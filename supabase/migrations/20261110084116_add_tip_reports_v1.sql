/*
# Add tip_reports table

## Overview
Adds a community reports table for traveler tips, mirroring the existing
`photo_reports` structure. This enables the "Report tip" flow so users can
flag spam, offensive language, or false/dangerous advice for moderator review.

## New table: `tip_reports`
- `id` uuid PK (default gen_random_uuid())
- `tip_id` uuid FK → tips(id) ON DELETE CASCADE
- `device_id` text NOT NULL — local device UUID for de-dup
- `reason` text NOT NULL — one of: spam, abuse, false_info
- `details` text — optional extra context (max 500 chars)
- `created_at` timestamptz DEFAULT now()
- UNIQUE (tip_id, device_id) — one report per device per tip

## Security
- RLS enabled on `tip_reports`.
- `TO anon, authenticated` CRUD (no-auth single-tenant app, public community content).
- `USING (true)` / `WITH CHECK (true)` because reports are shared community data.
- GRANT CRUD on `tip_reports` to `anon, authenticated`.
*/

CREATE TABLE IF NOT EXISTS tip_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tip_id uuid NOT NULL REFERENCES tips(id) ON DELETE CASCADE,
  device_id text NOT NULL,
  reason text NOT NULL CHECK (reason IN ('spam', 'abuse', 'false_info')),
  details text CHECK (char_length(details) <= 500),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tip_id, device_id)
);

ALTER TABLE tip_reports ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON tip_reports TO anon, authenticated;

DROP POLICY IF EXISTS "tip_reports_read" ON tip_reports;
CREATE POLICY "tip_reports_read" ON tip_reports FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "tip_reports_insert" ON tip_reports;
CREATE POLICY "tip_reports_insert" ON tip_reports FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "tip_reports_update" ON tip_reports;
CREATE POLICY "tip_reports_update" ON tip_reports FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "tip_reports_delete" ON tip_reports;
CREATE POLICY "tip_reports_delete" ON tip_reports FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_tip_reports_tip ON tip_reports(tip_id);
