'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowRight, Building2, Search, TrendingUp, Zap } from 'lucide-react';
import { STATES } from '@/lib/states';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/materials';

const REGION_LABELS: Record<string, string> = {
  north: 'North',
  south: 'South',
  east: 'East',
  west: 'West',
  central: 'Central',
  northeast: 'North-East',
};

const REGION_ORDER = ['north', 'west', 'central', 'south', 'east', 'northeast'];

export default function Home() {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return STATES;
    return STATES.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.capital.toLowerCase().includes(q) ||
        s.cities.some((c) => c.toLowerCase().includes(q))
    );
  }, [query]);

  const grouped = useMemo(() => {
    const map: Record<string, typeof STATES> = {};
    for (const s of filtered) {
      (map[s.region] ??= []).push(s);
    }
    return map;
  }, [filtered]);

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <main className="min-h-screen">
      <header className="border-b border-border/60 backdrop-blur-sm bg-background/70 sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-semibold tracking-tight text-lg">BharatRates</span>
              <span className="ml-2 text-[11px] text-muted-foreground hidden sm:inline">
                Live civil material pricing
              </span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
            </span>
            Updated daily · {today}
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 pt-16 pb-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3 py-1 text-xs text-muted-foreground mb-6">
          <Zap className="h-3.5 w-3.5 text-warning" />
          AI-backed daily price intelligence
        </div>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-[1.05]">
          Civil material prices,
          <br />
          <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
            for every state in India
          </span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-muted-foreground text-base sm:text-lg leading-relaxed">
          Pick a state to open its live pricing workbook — steel, cement, sand and
          aggregates with city-level detail, trend indicators, search and export.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {(Object.keys(CATEGORY_LABELS) as Array<keyof typeof CATEGORY_LABELS>).map((cat) => (
            <span
              key={cat}
              className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-3 py-1.5 text-xs"
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: CATEGORY_COLORS[cat] }} />
              {CATEGORY_LABELS[cat]}
            </span>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Choose a state</h2>
            <span className="text-muted-foreground text-sm">({filtered.length} of {STATES.length})</span>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search state or city..."
              className="w-full h-10 rounded-lg border border-input bg-card/60 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            No states match “{query}”.
          </div>
        ) : (
          <div className="space-y-8">
            {REGION_ORDER.map((region) => {
              const states = grouped[region];
              if (!states?.length) return null;
              return (
                <div key={region}>
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {REGION_LABELS[region]}
                    </h3>
                    <div className="h-px flex-1 bg-border/50" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {states.map((state) => (
                      <Link
                        key={state.code}
                        href={`/materials/${state.name.toLowerCase().replace(/[^a-z]+/g, '-')}`}
                        className="group relative overflow-hidden rounded-xl border border-border/70 bg-card/50 p-4 transition-all hover:border-primary/60 hover:bg-card hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-accent/5 transition-all" />
                        <div className="relative flex items-start justify-between">
                          <div className="min-w-0">
                            <div className="font-medium truncate">{state.name}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {state.cities.length} cities
                            </div>
                          </div>
                          <span className="shrink-0 text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground">
                            {state.code}
                          </span>
                        </div>
                        <div className="relative mt-3 flex items-center justify-between text-xs text-muted-foreground">
                          <span className="truncate">{state.capital}</span>
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <footer className="border-t border-border/60 py-8">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>BharatRates — indicative AI-generated pricing, not for trade decisions.</span>
          <span>{STATES.length} states · 4 categories · daily updates</span>
        </div>
      </footer>
    </main>
  );
}
