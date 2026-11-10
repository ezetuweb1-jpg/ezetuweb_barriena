/*
# Photographer follows (device-scoped)

Adds the storage behind the "Follow / Following" button on photographer profiles.
The app has no sign-in, so each browser is identified by its device id and that
device's follows are remembered across reloads.

1. New Tables
- `photographer_follows`: one row per (device, photographer) pair.
  - `device_id` (text, part of primary key): the browser's device id.
  - `author` (text, part of primary key): the photographer's name.
  - `created_at` (timestamptz): when the follow was made.

2. New Functions
- `set_photographer_follow(p_device_id, p_author, p_follow)`: follows or unfollows; idempotent.
- `followed_authors(p_device_id)`: returns the photographers a device follows.
- `follower_count(p_author)`: returns how many devices follow a photographer.

3. Security
- Row level security is enabled on `photographer_follows` with no policies and no grants,
  so the table cannot be read or written directly from the browser.
- The three functions run with the owner's rights and a fixed search path, and are
  granted only to `anon` and `authenticated` (the browser roles), so the table is reached
  only through them. Follower counts never expose which devices follow.

4. Notes
- Identity is the device id, not a user account, so follows are per browser.
*/

CREATE TABLE IF NOT EXISTS photographer_follows (
  device_id text NOT NULL,
  author text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (device_id, author)
);

CREATE INDEX IF NOT EXISTS photographer_follows_author_idx ON photographer_follows (author);

ALTER TABLE photographer_follows ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION set_photographer_follow(p_device_id text, p_author text, p_follow boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_follow THEN
    INSERT INTO photographer_follows (device_id, author)
    VALUES (p_device_id, p_author)
    ON CONFLICT (device_id, author) DO NOTHING;
  ELSE
    DELETE FROM photographer_follows
    WHERE device_id = p_device_id AND author = p_author;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION followed_authors(p_device_id text)
RETURNS SETOF text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT author FROM photographer_follows
  WHERE device_id = p_device_id
  ORDER BY created_at;
$$;

CREATE OR REPLACE FUNCTION follower_count(p_author text)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*)::integer FROM photographer_follows WHERE author = p_author;
$$;

REVOKE EXECUTE ON FUNCTION set_photographer_follow(text, text, boolean) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION followed_authors(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION follower_count(text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION set_photographer_follow(text, text, boolean) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION followed_authors(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION follower_count(text) TO anon, authenticated;
