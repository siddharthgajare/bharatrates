export type MaterialCategory = 'steel' | 'cement' | 'sand' | 'aggregates';

export type MaterialSpec = {
  name: string;
  category: MaterialCategory;
  unit: string;
  basePrice: number;
  volatility: number;
};

export const MATERIALS: MaterialSpec[] = [
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

export const CATEGORY_LABELS: Record<MaterialCategory, string> = {
  steel: 'Steel',
  cement: 'Cement',
  sand: 'Sand',
  aggregates: 'Aggregates',
};

export const CATEGORY_COLORS: Record<MaterialCategory, string> = {
  steel: '#60a5fa',
  cement: '#34d399',
  sand: '#fbbf24',
  aggregates: '#f97316',
};

export type MaterialPrice = {
  id: string;
  state: string;
  city: string;
  material: string;
  category: MaterialCategory;
  unit: string;
  price: number;
  previous_price: number | null;
  change_pct: number | null;
  updated_on: string;
};
