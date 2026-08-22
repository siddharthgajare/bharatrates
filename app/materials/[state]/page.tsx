'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowUpDown,
  Download,
  FileSpreadsheet,
  Loader2,
  MapPin,
  Search,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { STATES, normalizeState } from '@/lib/states';
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  type MaterialCategory,
  type MaterialPrice,
} from '@/lib/materials';
import { supabase } from '@/lib/supabase';

// Required for static/edge adapters to recognize dynamic state slugs during build
export function generateStaticParams() {
  return STATES.map((s) => ({
    state: s.name.toLowerCase().replace(/[^a-z]+/g, '-'),
  }));
}

type SortKey = 'material' | 'city' | 'category' | 'price' | 'change';
type SortDir = 'asc' | 'desc';

export default function StateMaterialsPage() {
  const params = useParams<{ state: string }>();
  const state = useMemo(() => normalizeState(params.state), [params.state]);

  const [rows, setRows] = useState<MaterialPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<MaterialCategory | 'all'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('material');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const triggerGeneration = useCallback(async (stateName: string) => {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-prices?state=${encodeURIComponent(stateName)}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
    });
    if (!res.ok) throw new Error(`Generation failed (${res.status})`);
    return res.json();
  }, []);

  useEffect(() => {
    if (!state) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const today = new Date().toISOString().slice(0, 10);
        const { data, error: qErr } = await supabase
          .from('material_prices')
          .select('*')
          .eq('state', state.name)
          .order('updated_on', { ascending: false });

        if (qErr) throw qErr;

        let latest = (data ?? []) as MaterialPrice[];
        const hasToday = latest.some((r) => r.updated_on === today);

        if (!hasToday) {
          await triggerGeneration(state.name);
          const { data: fresh, error: e2 } = await supabase
            .from('material_prices')
            .select('*')
            .eq('state', state.name)
            .order('updated_on', { ascending: false });
          if (e2) throw e2;
          latest = (fresh ?? []) as MaterialPrice[];
        }

        if (cancelled) return;
        // keep only the most recent day's rows
        const topDate = latest[0]?.updated_on;
        const todayRows = topDate ? latest.filter((r) => r.updated_on === topDate) : [];
        setRows(todayRows);
        setUpdatedAt(topDate ?? null);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load prices');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [state, triggerGeneration]);

  const cities = useMemo(() => {
    const set = new Set(rows.map((r) => r.city));
    return ['all', ...Array.from(set).sort()];
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows
      .filter((r) => (cityFilter === 'all' ? true : r.city === cityFilter))
      .filter((r) => (categoryFilter === 'all' ? true : r.category === categoryFilter))
      .filter((r) => (!q ? true : r.material.toLowerCase().includes(q) || r.city.toLowerCase().includes(q)));
  }, [rows, cityFilter, categoryFilter, search]);

  const sorted = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      switch (sortKey) {
        case 'material':
          return dir * a.material.localeCompare(b.material);
        case 'city':
          return dir * a.city.localeCompare(b.city);
        case 'category':
          return dir * a.category.localeCompare(b.category);
        case 'price':
          return dir * (a.price - b.price);
        case 'change':
          return dir * ((a.change_pct ?? 0) - (b.change_pct ?? 0));
        default:
          return 0;
      }
    });
  }, [filtered, sortKey, sortDir]);

  const summary = useMemo(() => {
    const byCat: Record<string, { count: number; avg: number; avgChange: number }> = {};
    for (const r of rows) {
      const c = (byCat[r.category] ??= { count: 0, avg: 0, avgChange: 0 });
      c.count += 1;
      c.avg += r.price;
      c.avgChange += r.change_pct ?? 0;
    }
    return Object.entries(byCat).map(([cat, v]) => ({
      category: cat as MaterialCategory,
      count: v.count,
      avg: v.avg / v.count,
      avgChange: v.avgChange / v.count,
    }));
  }, [rows]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'price' || key === 'change' ? 'desc' : 'asc');
    }
  };

  const exportCSV = () => {
    const header = ['State', 'City', 'Material', 'Category', 'Unit', 'Price (INR)', 'Previous (INR)', 'Change %', 'Date'];
    const body = sorted.map((r) => [
      r.state,
      r.city,
      r.material,
      r.category,
      r.unit,
      r.price,
      r.previous_price ?? '',
      r.change_pct ?? '',
      r.updated_on,
    ]);
    const csv = [header, ...body]
      .map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state?.name.toLowerCase().replace(/[^a-z]+/g, '-')}-prices-${updatedAt ?? 'latest'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(sorted, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state?.name.toLowerCase().replace(/[^a-z]+/g, '-')}-prices-${updatedAt ?? 'latest'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const fmtINR = (n: number) =>
    n.toLocaleString('en-IN', { maximumFractionDigits: 0 });

  if (!state) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <p className="text-muted-foreground mb-4">We couldn’t find that state.</p>
        <Link href="/" className="text-primary hover:underline inline-flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to map
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <header className="border-b border-border/60 backdrop-blur-sm bg-background/70 sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            All states
          </Link>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
            </span>
            {updatedAt ? `Live · ${updatedAt}` : 'Loading…'}
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 pt-10 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-sm text-primary mb-2">
              <MapPin className="h-4 w-4" />
              {state.region.charAt(0).toUpperCase() + state.region.slice(1)} India
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{state.name}</h1>
            <p className="text-muted-foreground mt-1.5 text-sm">
              Capital {state.capital} · {state.cities.length} cities tracked · 4 material categories
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportCSV}
              disabled={loading || sorted.length === 0}
              className="inline-flex items-center gap-2 h-10 rounded-lg border border-border bg-card/60 px-4 text-sm font-medium hover:bg-card hover:border-primary/50 transition-colors disabled:opacity-50"
            >
              <Download className="h-4 w-4" /> CSV
            </button>
            <button
              onClick={exportJSON}
              disabled={loading || sorted.length === 0}
              className="inline-flex items-center gap-2 h-10 rounded-lg border border-border bg-card/60 px-4 text-sm font-medium hover:bg-card hover:border-primary/50 transition-colors disabled:opacity-50"
            >
              <FileSpreadsheet className="h-4 w-4" /> JSON
            </button>
          </div>
        </div>

        {summary.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-8">
            {summary.map((s) => (
              <div
                key={s.category}
                className="rounded-xl border border-border/60 bg-card/50 p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{CATEGORY_LABELS[s.category]}</span>
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: CATEGORY_COLORS[s.category] }} />
                </div>
                <div className="mt-2 text-2xl font-semibold tabular-nums">
                  ₹{fmtINR(s.avg)}
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs">
                  {s.avgChange > 0 ? (
                    <TrendingUp className="h-3.5 w-3.5 text-success" />
                  ) : s.avgChange < 0 ? (
                    <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                  ) : null}
                  <span className={s.avgChange > 0 ? 'text-success' : s.avgChange < 0 ? 'text-destructive' : 'text-muted-foreground'}>
                    {s.avgChange > 0 ? '+' : ''}{s.avgChange.toFixed(2)}% avg
                  </span>
                  <span className="text-muted-foreground">· {s.count} items</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-xl border border-border/60 bg-card/40 overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-3 p-4 border-b border-border/60">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search material or city…"
                className="w-full h-10 rounded-lg border border-input bg-background/60 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="h-10 rounded-lg border border-input bg-background/60 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c === 'all' ? 'All cities' : c}
                  </option>
                ))}
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as MaterialCategory | 'all')}
                className="h-10 rounded-lg border border-input bg-background/60 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All categories</option>
                {(Object.keys(CATEGORY_LABELS) as MaterialCategory[]).map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Loading live prices…
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-destructive mb-2">Couldn’t load prices</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          ) : sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
              <p>No materials match your filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-left text-xs text-muted-foreground">
                    <Th label="Material" k="material" cur={sortKey} dir={sortDir} onSort={toggleSort} />
                    <Th label="City" k="city" cur={sortKey} dir={sortDir} onSort={toggleSort} />
                    <Th label="Category" k="category" cur={sortKey} dir={sortDir} onSort={toggleSort} />
                    <Th label="Unit" k={null} cur={sortKey} dir={sortDir} onSort={toggleSort} />
                    <Th label="Price (₹)" k="price" cur={sortKey} dir={sortDir} onSort={toggleSort} align="right" />
                    <Th label="Change" k="change" cur={sortKey} dir={sortDir} onSort={toggleSort} align="right" />
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium">{r.material}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.city}</td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center gap-1.5 text-xs"
                          style={{ color: CATEGORY_COLORS[r.category] }}
                        >
                          <span className="h-2 w-2 rounded-full" style={{ background: CATEGORY_COLORS[r.category] }} />
                          {CATEGORY_LABELS[r.category]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{r.unit}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium">
                        ₹{fmtINR(r.price)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {r.change_pct == null ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1 ${
                              r.change_pct > 0 ? 'text-success' : r.change_pct < 0 ? 'text-destructive' : 'text-muted-foreground'
                            }`}
                          >
                            {r.change_pct > 0 ? (
                              <TrendingUp className="h-3.5 w-3.5" />
                            ) : r.change_pct < 0 ? (
                              <TrendingDown className="h-3.5 w-3.5" />
                            ) : null}
                            {r.change_pct > 0 ? '+' : ''}{r.change_pct.toFixed(2)}%
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && sorted.length > 0 && (
            <div className="px-4 py-3 border-t border-border/60 text-xs text-muted-foreground flex justify-between">
              <span>Showing {sorted.length} of {rows.length} prices</span>
              <span>Prices in INR · indicative AI estimates</span>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function Th({
  label,
  k,
  cur,
  dir,
  onSort,
  align = 'left',
}: {
  label: string;
  k: SortKey | null;
  cur: SortKey;
  dir: SortDir;
  onSort: (k: SortKey) => void;
  align?: 'left' | 'right';
}) {
  const active = k !== null && k === cur;
  return (
    <th className={`px-4 py-3 font-medium ${align === 'right' ? 'text-right' : ''}`}>
      {k === null ? (
        label
      ) : (
        <button
          onClick={() => onSort(k)}
          className={`inline-flex items-center gap-1 hover:text-foreground transition-colors ${active ? 'text-foreground' : ''}`}
        >
          {label}
          <ArrowUpDown className={`h-3 w-3 ${active ? 'opacity-100' : 'opacity-40'}`} />
          {active && <span className="text-[10px]">{dir === 'asc' ? '↑' : '↓'}</span>}
        </button>
      )}
    </th>
  );
}
