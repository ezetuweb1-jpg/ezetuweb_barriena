/*
# Add declared photo awards table

1. New Tables
- `photo_awards`: one row per declared podium place (rank 1-3) for a closed month or year.
  - `id` (text, primary key), `period_type` ('month' or 'year'), `period_label` (display text),
    `period_start` / `period_end` (date range of the closed period), `rank` (1-3),
    `photo_id` (the awarded photo, foreign key to photos), `author_id` (author slug).

2. Seed data
- Declares the September 2026 first-place "Foto del Mes" for Mikel Etxebarria's Gaztelugatxe photo.

3. Security
- Row level security enabled. Public read-only access for anon and authenticated (awards are public).
- No insert, update or delete grants or policies: declared awards can only be changed by the database owner.

4. Notes
- A unique constraint keeps one photo per period and rank.
- Deleting a photo removes its award rows (cascade).
*/

CREATE TABLE IF NOT EXISTS photo_awards (
  id text PRIMARY KEY,
  period_type text NOT NULL CHECK (period_type IN ('month', 'year')),
  period_label text NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  rank smallint NOT NULL CHECK (rank BETWEEN 1 AND 3),
  photo_id uuid NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  author_id text NOT NULL,
  UNIQUE (period_type, period_start, rank)
);

CREATE INDEX IF NOT EXISTS photo_awards_photo_id_idx ON photo_awards (photo_id);

ALTER TABLE photo_awards ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON photo_awards TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_photo_awards" ON photo_awards;
CREATE POLICY "anon_select_photo_awards" ON photo_awards FOR SELECT
  TO anon, authenticated USING (true);

INSERT INTO photo_awards (id, period_type, period_label, period_start, period_end, rank, photo_id, author_id)
SELECT 'award-month-sep2026-1', 'month', 'Septiembre 2026', DATE '2026-09-01', DATE '2026-10-01', 1, p.id, 'mikel-etxebarria'
FROM photos p
JOIN spots s ON s.id = p.spot_id
WHERE p.author = 'Mikel Etxebarria' AND s.name = 'Gaztelugatxe'
ORDER BY p.likes DESC
LIMIT 1
ON CONFLICT (id) DO NOTHING;
