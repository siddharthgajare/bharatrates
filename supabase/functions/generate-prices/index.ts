import { createClient } from 'npm:@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

type MaterialSpec = {
  name: string;
  category: 'steel' | 'cement' | 'sand' | 'aggregates';
  unit: string;
  basePrice: number;
  volatility: number;
};

const MATERIALS: MaterialSpec[] = [
  { name: 'TMT Steel Bars (Fe 500D)', category: 'steel', unit: 'per tonne', basePrice: 62000, volatility: 0.025 },
  { name: 'TMT Steel Bars (Fe 550)', category: 'steel', unit: 'per tonne', basePrice: 65000, volatility: 0.025 },
  { name: 'Mild Steel Rounds', category: 'steel', unit: 'per tonne', basePrice: 58000, volatility: 0.02 },
  { name: 'OPC Cement 53 Grade', category: 'cement', unit: 'per bag (50kg)', basePrice: 420, volatility: 0.015 },
  { name: 'OPC Cement 43 Grade', category: 'cement', unit: 'per bag (50kg)', basePrice: 380, volatility: 0.015 },
  { name: 'PPC Cement', category: 'cement', unit: 'per bag (50kg)', basePrice: 360, volatility: 0.015 },
  { name: 'White Cement', category: 'cement', unit: 'per bag (50kg)', basePrice: 850, volatility: 0.01 },
  { name: 'River Sand', category: 'sand', unit: 'per brass', basePrice: 4800, volatility: 0.04 },
  { name: 'M-Sand', category: 'sand', unit: 'per brass', basePrice: 3500, volatility: 0.03 },
  { name: 'Pit Sand', category: 'sand', unit: 'per brass', basePrice: 3200, volatility: 0.035 },
  { name: '20mm Aggregates', category: 'aggregates', unit: 'per brass', basePrice: 2800, volatility: 0.03 },
  { name: '12mm Aggregates', category: 'aggregates', unit: 'per brass', basePrice: 2950, volatility: 0.03 },
  { name: '40mm Aggregates', category: 'aggregates', unit: 'per brass', basePrice: 2600, volatility: 0.025 },
  { name: 'Crushed Stone Dust', category: 'aggregates', unit: 'per brass', basePrice: 2400, volatility: 0.03 },
];

type StateInfo = {
  name: string;
  code: string;
  cities: string[];
  region: 'north' | 'south' | 'east' | 'west' | 'central' | 'northeast';
};

const STATES: StateInfo[] = [
  { name: 'Andhra Pradesh', code: 'AP', region: 'south', cities: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati'] },
  { name: 'Arunachal Pradesh', code: 'AR', region: 'northeast', cities: ['Itanagar', 'Naharlagun', 'Tawang'] },
  { name: 'Assam', code: 'AS', region: 'northeast', cities: ['Guwahati', 'Dibrugarh', 'Silchar', 'Jorhat'] },
  { name: 'Bihar', code: 'BR', region: 'east', cities: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur'] },
  { name: 'Chhattisgarh', code: 'CG', region: 'central', cities: ['Raipur', 'Bhilai', 'Bilaspur', 'Korba'] },
  { name: 'Goa', code: 'GA', region: 'west', cities: ['Panaji', 'Margao', 'Vasco da Gama'] },
  { name: 'Gujarat', code: 'GJ', region: 'west', cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'] },
  { name: 'Haryana', code: 'HR', region: 'north', cities: ['Gurugram', 'Faridabad', 'Panipat', 'Ambala'] },
  { name: 'Himachal Pradesh', code: 'HP', region: 'north', cities: ['Shimla', 'Manali', 'Solan', 'Dharamshala'] },
  { name: 'Jharkhand', code: 'JH', region: 'east', cities: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro'] },
  { name: 'Karnataka', code: 'KA', region: 'south', cities: ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubli'] },
  { name: 'Kerala', code: 'KL', region: 'south', cities: ['Kochi', 'Kozhikode', 'Thiruvananthapuram', 'Thrissur'] },
  { name: 'Madhya Pradesh', code: 'MP', region: 'central', cities: ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior'] },
  { name: 'Maharashtra', code: 'MH', region: 'west', cities: ['Mumbai', 'Pune', 'Nagpur', 'Nashik'] },
  { name: 'Manipur', code: 'MN', region: 'northeast', cities: ['Imphal', 'Churachandpur'] },
  { name: 'Meghalaya', code: 'ML', region: 'northeast', cities: ['Shillong', 'Tura'] },
  { name: 'Mizoram', code: 'MZ', region: 'northeast', cities: ['Aizawl', 'Lunglei'] },
  { name: 'Nagaland', code: 'NL', region: 'northeast', cities: ['Kohima', 'Dimapur'] },
  { name: 'Odisha', code: 'OD', region: 'east', cities: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Brahmapur'] },
  { name: 'Punjab', code: 'PB', region: 'north', cities: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Mohali'] },
  { name: 'Rajasthan', code: 'RJ', region: 'north', cities: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota'] },
  { name: 'Sikkim', code: 'SK', region: 'northeast', cities: ['Gangtok', 'Namchi'] },
  { name: 'Tamil Nadu', code: 'TN', region: 'south', cities: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli'] },
  { name: 'Telangana', code: 'TS', region: 'south', cities: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar'] },
  { name: 'Tripura', code: 'TR', region: 'northeast', cities: ['Agartala', 'Dharmanagar'] },
  { name: 'Uttar Pradesh', code: 'UP', region: 'north', cities: ['Lucknow', 'Kanpur', 'Agra', 'Varanasi'] },
  { name: 'Uttarakhand', code: 'UK', region: 'north', cities: ['Dehradun', 'Haridwar', 'Nainital', 'Haldwani'] },
  { name: 'West Bengal', code: 'WB', region: 'east', cities: ['Kolkata', 'Howrah', 'Durgapur', 'Siliguri'] },
];

const REGION_ADJUST: Record<string, number> = {
  north: 1.08,
  south: 0.96,
  east: 0.98,
  west: 1.05,
  central: 0.94,
  northeast: 1.12,
};

function seededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hashStr(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// Box-Muller transform for a gaussian sample using a uniform RNG
function gaussian(rng: () => number): number {
  const u = Math.max(rng(), 1e-9);
  const v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function generatePriceForDay(
  state: StateInfo,
  city: string,
  material: MaterialSpec,
  dateStr: string
): { price: number; previous: number | null } {
  const today = new Date(dateStr + 'T00:00:00Z');
  const yesterday = new Date(today.getTime() - 86400000);
  const yStr = yesterday.toISOString().slice(0, 10);

  const regionAdj = REGION_ADJUST[state.region] ?? 1;
  const cityAdj = 1 + ((hashStr(city) % 200) - 100) / 1000;
  const base = material.basePrice * regionAdj * cityAdj;

  // Day-indexed drift so prices wander over time but stay deterministic per day
  const dayIndex = Math.floor(today.getTime() / 86400000);
  const driftSeed = hashStr(`${state.code}-${city}-${material.name}`);
  const driftRng = seededRandom(driftSeed);
  // cumulative mild drift
  let drift = 0;
  const driftMagnitude = 0.06;
  for (let d = 0; d < Math.min(dayIndex % 90, 30); d++) {
    drift += (driftRng() - 0.5) * driftMagnitude;
  }

  const dailySeed = hashStr(`${state.code}-${city}-${material.name}-${dateStr}`);
  const rng = seededRandom(dailySeed);
  const noise = gaussian(rng) * material.volatility;

  const price = Math.max(base * (1 + drift + noise), base * 0.5);
  const rounded = Math.round(price / (material.category === 'cement' ? 1 : 10)) * (material.category === 'cement' ? 1 : 10);

  // Previous price = yesterday's deterministic price
  if (dateStr <= '2024-01-01') {
    return { price: rounded, previous: null };
  }
  const prevDayIndex = dayIndex - 1;
  const prevDriftRng = seededRandom(driftSeed);
  let prevDrift = 0;
  for (let d = 0; d < Math.min(prevDayIndex % 90, 30); d++) {
    prevDrift += (prevDriftRng() - 0.5) * driftMagnitude;
  }
  const prevDailySeed = hashStr(`${state.code}-${city}-${material.name}-${yStr}`);
  const prevRng = seededRandom(prevDailySeed);
  const prevNoise = gaussian(prevRng) * material.volatility;
  const prevPrice = Math.max(base * (1 + prevDrift + prevNoise), base * 0.5);
  const prevRounded = Math.round(prevPrice / (material.category === 'cement' ? 1 : 10)) * (material.category === 'cement' ? 1 : 10);

  return { price: rounded, previous: prevRounded };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const stateParam = url.searchParams.get('state');
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    if (!supabaseUrl || !serviceKey) {
      throw new Error('Missing server credentials');
    }
    const admin = createClient(supabaseUrl, serviceKey);

    const today = new Date().toISOString().slice(0, 10);
    const targetStates = stateParam
      ? STATES.filter((s) => s.name.toLowerCase().replace(/[^a-z]/g, '') === stateParam.toLowerCase().replace(/[^a-z]/g, ''))
      : STATES;

    let upserted = 0;
    for (const state of targetStates) {
      const rows: Record<string, unknown>[] = [];
      for (const city of state.cities) {
        for (const material of MATERIALS) {
          const { price, previous } = generatePriceForDay(state, city, material, today);
          const changePct = previous ? +(((price - previous) / previous) * 100).toFixed(2) : null;
          rows.push({
            state: state.name,
            city,
            material: material.name,
            category: material.category,
            unit: material.unit,
            price,
            previous_price: previous,
            change_pct: changePct,
            updated_on: today,
          });
        }
      }
      const { error } = await admin
        .from('material_prices')
        .upsert(rows, { onConflict: 'state,city,material,updated_on', ignoreDuplicates: false });
      if (error) {
        console.error(`upsert error for ${state.name}:`, error.message);
      } else {
        upserted += rows.length;
      }
    }

    return new Response(
      JSON.stringify({ ok: true, date: today, states: targetStates.length, rows: upserted }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
