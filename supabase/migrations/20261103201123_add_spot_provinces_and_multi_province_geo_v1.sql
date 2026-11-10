/*
# Add provinces array and align multi-province geography

1. Modified Tables
- `spots`: new column `provinces` (text array) listing every province a spot touches. Single-province spots hold one entry; border spots hold several.
2. Data Changes
- Cruz del Gorbeia is renamed to "Cruz del Gorbeia / Gorbeiako Gurutzea", set to Spain, and linked to Bizkaia and Araba.
- Tre Cime di Lavaredo is linked to Belluno and Bolzano.
- Albarracín is placed in Teruel.
- Gaztelugatxe stays in Bizkaia.
3. Security
- No policy or grant changes. Existing spot access rules are unchanged.

## Notes
- Idempotent: the column is added only if missing, and the updates can be re-run safely.
- No data is removed.
*/

ALTER TABLE spots ADD COLUMN IF NOT EXISTS provinces text[];

UPDATE spots SET provinces = ARRAY[province]
WHERE provinces IS NULL AND province IS NOT NULL;

UPDATE spots SET
  name = 'Cruz del Gorbeia / Gorbeiako Gurutzea',
  country = 'España',
  category = 'nature',
  province = 'Bizkaia',
  provinces = ARRAY['Bizkaia', 'Araba'],
  comarca = 'Arratia'
WHERE id = '11111111-1111-4111-8111-111111111302';

UPDATE spots SET province = 'Belluno', provinces = ARRAY['Belluno', 'Bolzano']
WHERE id = '11111111-1111-4111-8111-111111111211';

UPDATE spots SET province = 'Bizkaia', provinces = ARRAY['Bizkaia']
WHERE id = '11111111-1111-4111-8111-111111111101';

UPDATE spots SET province = 'Teruel', provinces = ARRAY['Teruel']
WHERE id = '11111111-1111-4111-8111-111111111108';
