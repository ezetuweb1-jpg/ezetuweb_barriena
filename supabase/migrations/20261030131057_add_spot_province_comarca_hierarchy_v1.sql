/*
# Add province and comarca hierarchy to spots

1. Modified Tables
- `spots`
  - `province` (text, nullable): administrative region (Basque lurraldea, Italian/Spanish province or region).
  - `comarca` (text, nullable): natural or landscape subregion (Basque comarca, Dolomites, Pyrenees).

2. Data changes
- Backfills every existing spot: Basque spots take province from `euskal_herria` and comarca from `region`; other spots take province from `region`.
- Sets the hierarchy for Tre Cime di Lavaredo, Lago di Braies, Gaztelugatxe and Ordesa / Cola de Caballo.

3. Security
- No new tables. Existing row level security and grants on `spots` are unchanged.

4. Notes
- `region` and `euskal_herria` are kept as they were so existing screens keep working.
- Localized labels for these keys live in the app, keyed by the stored value.
*/

ALTER TABLE spots ADD COLUMN IF NOT EXISTS province text;
ALTER TABLE spots ADD COLUMN IF NOT EXISTS comarca text;

UPDATE spots SET province = euskal_herria, comarca = region
WHERE euskal_herria IS NOT NULL AND province IS NULL;

UPDATE spots SET province = region
WHERE euskal_herria IS NULL AND province IS NULL;

UPDATE spots SET province = 'Bizkaia', comarca = 'Busturialdea'
WHERE id = '11111111-1111-4111-8111-111111111101';

UPDATE spots SET province = 'Bolzano (Hego Tirol)', comarca = 'Dolomiti'
WHERE id = '11111111-1111-4111-8111-111111111102';

UPDATE spots SET province = 'Veneto (Belluno)', comarca = 'Dolomiti'
WHERE id = '11111111-1111-4111-8111-111111111211';

UPDATE spots SET province = 'Huesca', comarca = 'Pirinioak (Sobrarbe)'
WHERE id = '11111111-1111-4111-8111-111111111206';
