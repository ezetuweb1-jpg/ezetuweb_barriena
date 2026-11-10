/*
# Photo like counter helpers

Adds SECURITY INVOKER SQL functions to increment/decrement the denormalized
`photos.likes` column safely. Called from the frontend after inserting/deleting
a `photo_likes` row.

1. Functions
- `increment_photo_likes(p_photo_id uuid)` — +1, returns new count.
- `decrement_photo_likes(p_photo_id uuid)` — -1 (clamped at 0), returns new count.
2. Grants
- Execute granted to `anon` and `authenticated` (no-auth single-tenant app).
*/

CREATE OR REPLACE FUNCTION increment_photo_likes(p_photo_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY INVOKER
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
