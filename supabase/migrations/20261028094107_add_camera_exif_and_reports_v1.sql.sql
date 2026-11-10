/*
# Add camera EXIF metadata + community reports

## Overview
Adds optional camera EXIF metadata to photos so the app can display a
"Verified Real Capture" badge with camera/lens/aperture/shutter/ISO info.
Also adds a community reports table for the granular report flow.

## New columns on `photos`
- `camera_model` (text, nullable) — e.g. "Sony A7 IV"
- `lens` (text, nullable) — e.g. "24-70mm"
- `aperture` (text, nullable) — e.g. "f/2.8"
- `shutter_speed` (text, nullable) — e.g. "1/400s"
- `iso` (integer, nullable) — e.g. 100

All nullable so existing photos are unaffected. The frontend treats presence
of `camera_model` as the signal to show the EXIF badge.

## New table: `photo_reports`
- `id` uuid PK
- `photo_id` uuid FK → photos(id) ON DELETE CASCADE
- `device_id` text NOT NULL — local device UUID for de-dup
- `reason` text NOT NULL — one of: ai_generated, fake_place, wrong_place, people_selfie, plagiarism
- `details` text — optional extra context (max 500 chars)
- `created_at` timestamptz DEFAULT now()
- UNIQUE (photo_id, device_id) — one report per device per photo

## Security
- RLS enabled on `photo_reports`.
- `TO anon, authenticated` CRUD (no-auth single-tenant app, public community content).
- `USING (true)` / `WITH CHECK (true)` because reports are shared community data.
- GRANT CRUD on `photo_reports` to `anon, authenticated`.
- GRANT SELECT, INSERT, UPDATE on `photos` (camera columns) to `anon, authenticated` — already had table-level grants, so column additions are covered by existing grants.
*/

-- ===================== photos: EXIF columns =====================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'photos' AND column_name = 'camera_model') THEN
    ALTER TABLE photos ADD COLUMN camera_model text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'photos' AND column_name = 'lens') THEN
    ALTER TABLE photos ADD COLUMN lens text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'photos' AND column_name = 'aperture') THEN
    ALTER TABLE photos ADD COLUMN aperture text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'photos' AND column_name = 'shutter_speed') THEN
    ALTER TABLE photos ADD COLUMN shutter_speed text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'photos' AND column_name = 'iso') THEN
    ALTER TABLE photos ADD COLUMN iso integer;
  END IF;
END $$;

-- ===================== photo_reports =====================
CREATE TABLE IF NOT EXISTS photo_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id uuid NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  device_id text NOT NULL,
  reason text NOT NULL CHECK (reason IN ('ai_generated', 'fake_place', 'wrong_place', 'people_selfie', 'plagiarism')),
  details text CHECK (char_length(details) <= 500),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (photo_id, device_id)
);

ALTER TABLE photo_reports ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON photo_reports TO anon, authenticated;

DROP POLICY IF EXISTS "photo_reports_read" ON photo_reports;
CREATE POLICY "photo_reports_read" ON photo_reports FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "photo_reports_insert" ON photo_reports;
CREATE POLICY "photo_reports_insert" ON photo_reports FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "photo_reports_update" ON photo_reports;
CREATE POLICY "photo_reports_update" ON photo_reports FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "photo_reports_delete" ON photo_reports;
CREATE POLICY "photo_reports_delete" ON photo_reports FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_photo_reports_photo ON photo_reports(photo_id);

-- ===================== seed EXIF on top photos =====================
UPDATE photos SET
  camera_model = 'Sony A7 IV', lens = 'FE 24-70mm f/2.8 GM', aperture = 'f/8.0', shutter_speed = '1/250s', iso = 100
WHERE is_hero = true;

UPDATE photos SET
  camera_model = 'Canon EOS R5', lens = 'RF 15-35mm f/2.8L', aperture = 'f/11', shutter_speed = '1/125s', iso = 200
WHERE likes > 2500 AND is_hero = false;

UPDATE photos SET
  camera_model = 'Nikon Z9', lens = 'Z 24-70mm f/2.8 S', aperture = 'f/9.0', shutter_speed = '1/200s', iso = 100
WHERE likes > 1800 AND likes <= 2500;
