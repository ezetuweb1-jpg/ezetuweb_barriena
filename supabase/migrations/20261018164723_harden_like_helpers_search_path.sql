/*
# Harden photo like helpers — pin search_path

Sets an explicit `search_path` on the two SECURITY INVOKER helper functions
to resolve the "mutable search_path" security advisor warning.
*/

CREATE OR REPLACE FUNCTION increment_photo_likes(p_photo_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_catalog
AS $$
DECLARE new_count integer;
BEGIN
  UPDATE photos SET likes = likes + 1 WHERE id = p_photo_id RETURNING likes INTO new_count;
  RETURN new_count;
END $$;

CREATE OR REPLACE FUNCTION decrement_photo_likes(p_photo_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_catalog
AS $$
DECLARE new_count integer;
BEGIN
  UPDATE photos SET likes = GREATEST(0, likes - 1) WHERE id = p_photo_id RETURNING likes INTO new_count;
  RETURN new_count;
END $$;

REVOKE ALL ON FUNCTION increment_photo_likes(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION decrement_photo_likes(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION increment_photo_likes(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION decrement_photo_likes(uuid) TO anon, authenticated;
