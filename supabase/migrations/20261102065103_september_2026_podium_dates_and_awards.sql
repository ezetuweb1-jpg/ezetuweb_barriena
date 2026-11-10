/*
# September 2026 podium: photo dates and full top 3

1. Modified Tables
- `photos`: the three September 2026 winning photos get upload dates inside September 2026.
  - Mikel Etxebarria, Gaztelugatxe (1st place): 2026-09-18
  - Dirk Pothen, Tre Cime di Lavaredo (2nd place): 2026-09-22
  - Manuel, Albarracin (3rd place): 2026-09-08

2. New Award Rows
- `photo_awards`: adds 2nd and 3rd place for "Septiembre 2026"; 1st place already exists.

3. Security
- No policy or grant changes. Declared awards remain public read-only.

4. Notes
- Only the three listed photos change. Their likes and other data are untouched.
*/

UPDATE photos SET created_at = TIMESTAMPTZ '2026-09-18 12:00:00+00' WHERE id = 'a53d0319-60af-4f74-a78b-3f499e5dc055';
UPDATE photos SET created_at = TIMESTAMPTZ '2026-09-22 12:00:00+00' WHERE id = '1899baab-544f-43fe-a485-9d09c4955012';
UPDATE photos SET created_at = TIMESTAMPTZ '2026-09-08 12:00:00+00' WHERE id = 'a910cdeb-247c-44f6-a728-fc2e7c177046';

INSERT INTO photo_awards (id, period_type, period_label, period_start, period_end, rank, photo_id, author_id) VALUES
  ('award-month-sep2026-2', 'month', 'Septiembre 2026', DATE '2026-09-01', DATE '2026-10-01', 2, '1899baab-544f-43fe-a485-9d09c4955012', 'dirk-pothen'),
  ('award-month-sep2026-3', 'month', 'Septiembre 2026', DATE '2026-09-01', DATE '2026-10-01', 3, 'a910cdeb-247c-44f6-a728-fc2e7c177046', 'manuel')
ON CONFLICT (id) DO NOTHING;
