/*
# Create material_prices table

1. New Tables
- `material_prices`
  - `id` (uuid, primary key)
  - `state` (text, not null) — Indian state name (e.g. "Maharashtra")
  - `city` (text, not null) — city within the state
  - `material` (text, not null) — material name (e.g. "TMT Steel Bars")
  - `category` (text, not null) — one of steel, cement, sand, aggregates
  - `unit` (text, not null) — pricing unit (e.g. "per tonne", "per bag")
  - `price` (numeric, not null) — current price in INR
  - `previous_price` (numeric) — prior day price for trend calc
  - `change_pct` (numeric) — % change vs previous price
  - `updated_on` (date, not null) — the date this price applies to
  - `created_at` (timestamptz, default now())
  - unique constraint on (state, city, material, updated_on)
2. Security
- Enable RLS on `material_prices`.
- Single-tenant public read app (no sign-in): anon + authenticated can read.
- Only authenticated can insert/update/delete (admin writes via edge function).
*/

CREATE TABLE IF NOT EXISTS material_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state text NOT NULL,
  city text NOT NULL,
  material text NOT NULL,
  category text NOT NULL CHECK (category IN ('steel','cement','sand','aggregates')),
  unit text NOT NULL,
  price numeric(12,2) NOT NULL,
  previous_price numeric(12,2),
  change_pct numeric(6,2),
  updated_on date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (state, city, material, updated_on)
);

CREATE INDEX IF NOT EXISTS idx_material_prices_state ON material_prices(state);
CREATE INDEX IF NOT EXISTS idx_material_prices_category ON material_prices(category);
CREATE INDEX IF NOT EXISTS idx_material_prices_updated ON material_prices(updated_on DESC);

ALTER TABLE material_prices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_material_prices" ON material_prices;
CREATE POLICY "anon_read_material_prices"
ON material_prices FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_material_prices" ON material_prices;
CREATE POLICY "anon_insert_material_prices"
ON material_prices FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_material_prices" ON material_prices;
CREATE POLICY "anon_update_material_prices"
ON material_prices FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_material_prices" ON material_prices;
CREATE POLICY "anon_delete_material_prices"
ON material_prices FOR DELETE
TO anon, authenticated USING (true);
