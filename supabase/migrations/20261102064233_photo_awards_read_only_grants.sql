/*
# Make photo_awards read-only for the public API

1. Modified Tables
- `photo_awards`: removed INSERT, UPDATE and DELETE privileges from the `anon` and `authenticated` roles. Existing rows are unchanged.

2. Security
- Row level security stays enabled. The only policy is a SELECT policy for `anon` and `authenticated`, so the public can read declared awards but not change them.

3. Notes
- Awards are declared by the app owner through the database, not by visitors.
*/

REVOKE INSERT, UPDATE, DELETE ON photo_awards FROM anon, authenticated;
GRANT SELECT ON photo_awards TO anon, authenticated;
