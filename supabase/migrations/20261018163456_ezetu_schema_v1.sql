/*
# Ezetu — Worldwide Outdoor Travel & Landscape Discovery

## Overview
Single-tenant (no auth) schema for the Ezetu app. The app identifies a local
device via a generated UUID stored in localStorage so a user's passport,
wishlist, and contributed photos persist across sessions on the same device.

## Tables
1. `spots` — Official global places (municipalities + natural landmarks).
   - category: city | village | nature
   - bayesian_rating: precomputed Wilson/bayesian score for sorting
   - protected_zone: boolean — show "approximate location" badge
   - euskal_herria: boolean — territory inside Euskal Herria (for Ikurriña badge)
2. `photos` — Landscape photos tied to spots. No selfies/portraits (moderated by design).
   - season: spring | summer | autumn | winter
   - time_filter bucket derived from created_at for trend filtering
3. `tips` — Community traveller tips, max 140 chars, per spot.
4. `ratings` — 1–5 star breakdown per spot per device: photogenic, tranquility, accessibility.
5. `visits` — Records of "Ya he estado aquí" clicks per device per spot (passport data).
6. `wishlists` — Saved spots per device.
7. `photo_likes` — Like actions per device per photo (de-duped).

## Security
- RLS enabled on every table.
- All policies use `TO anon, authenticated` with `USING (true)` / `WITH CHECK (true)`
  because this is an intentionally public, single-tenant, no-auth app. Data is
  shared community content; there is no per-user isolation requirement.
*/

-- ===================== spots =====================
CREATE TABLE IF NOT EXISTS spots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country text NOT NULL,
  country_code text NOT NULL DEFAULT '',
  region text,
  category text NOT NULL CHECK (category IN ('city','village','nature')),
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  elevation_m integer,
  protected_zone boolean NOT NULL DEFAULT false,
  euskal_herria text,
  bayesian_rating double precision NOT NULL DEFAULT 0,
  ratings_count integer NOT NULL DEFAULT 0,
  verified boolean NOT NULL DEFAULT true,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE spots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "spots_read" ON spots;
CREATE POLICY "spots_read" ON spots FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "spots_insert" ON spots;
CREATE POLICY "spots_insert" ON spots FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "spots_update" ON spots;
CREATE POLICY "spots_update" ON spots FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- ===================== photos =====================
CREATE TABLE IF NOT EXISTS photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id uuid NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  width integer NOT NULL DEFAULT 1200,
  height integer NOT NULL DEFAULT 800,
  author text NOT NULL DEFAULT 'Ezetu',
  device_id text,
  season text NOT NULL CHECK (season IN ('spring','summer','autumn','winter')),
  likes integer NOT NULL DEFAULT 0,
  trend_score double precision NOT NULL DEFAULT 0,
  is_hero boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "photos_read" ON photos;
CREATE POLICY "photos_read" ON photos FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "photos_insert" ON photos;
CREATE POLICY "photos_insert" ON photos FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "photos_update" ON photos;
CREATE POLICY "photos_update" ON photos FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "photos_delete" ON photos;
CREATE POLICY "photos_delete" ON photos FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_photos_spot ON photos(spot_id);
CREATE INDEX IF NOT EXISTS idx_photos_trend ON photos(trend_score DESC);
CREATE INDEX IF NOT EXISTS idx_photos_season ON photos(season);

-- ===================== tips =====================
CREATE TABLE IF NOT EXISTS tips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id uuid NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  device_id text NOT NULL,
  author text NOT NULL DEFAULT 'Viajero',
  content text NOT NULL CHECK (char_length(content) <= 140),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tips ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tips_read" ON tips;
CREATE POLICY "tips_read" ON tips FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "tips_insert" ON tips;
CREATE POLICY "tips_insert" ON tips FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "tips_delete" ON tips;
CREATE POLICY "tips_delete" ON tips FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_tips_spot ON tips(spot_id);

-- ===================== ratings =====================
CREATE TABLE IF NOT EXISTS ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id uuid NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  device_id text NOT NULL,
  photogenic smallint NOT NULL CHECK (photogenic BETWEEN 1 AND 5),
  tranquility smallint NOT NULL CHECK (tranquility BETWEEN 1 AND 5),
  accessibility smallint NOT NULL CHECK (accessibility BETWEEN 1 AND 5),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (spot_id, device_id)
);

ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ratings_read" ON ratings;
CREATE POLICY "ratings_read" ON ratings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "ratings_insert" ON ratings;
CREATE POLICY "ratings_insert" ON ratings FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "ratings_update" ON ratings;
CREATE POLICY "ratings_update" ON ratings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "ratings_delete" ON ratings;
CREATE POLICY "ratings_delete" ON ratings FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_ratings_spot ON ratings(spot_id);

-- ===================== visits =====================
CREATE TABLE IF NOT EXISTS visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id uuid NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  device_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (spot_id, device_id)
);

ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "visits_read" ON visits;
CREATE POLICY "visits_read" ON visits FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "visits_insert" ON visits;
CREATE POLICY "visits_insert" ON visits FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "visits_delete" ON visits;
CREATE POLICY "visits_delete" ON visits FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_visits_device ON visits(device_id);

-- ===================== wishlists =====================
CREATE TABLE IF NOT EXISTS wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id uuid NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  device_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (spot_id, device_id)
);

ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "wishlists_read" ON wishlists;
CREATE POLICY "wishlists_read" ON wishlists FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "wishlists_insert" ON wishlists;
CREATE POLICY "wishlists_insert" ON wishlists FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "wishlists_delete" ON wishlists;
CREATE POLICY "wishlists_delete" ON wishlists FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_wishlists_device ON wishlists(device_id);

-- ===================== photo_likes =====================
CREATE TABLE IF NOT EXISTS photo_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id uuid NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  device_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (photo_id, device_id)
);

ALTER TABLE photo_likes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "photo_likes_read" ON photo_likes;
CREATE POLICY "photo_likes_read" ON photo_likes FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "photo_likes_insert" ON photo_likes;
CREATE POLICY "photo_likes_insert" ON photo_likes FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "photo_likes_delete" ON photo_likes;
CREATE POLICY "photo_likes_delete" ON photo_likes FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_photo_likes_photo ON photo_likes(photo_id);
CREATE INDEX IF NOT EXISTS idx_photo_likes_device ON photo_likes(device_id);
