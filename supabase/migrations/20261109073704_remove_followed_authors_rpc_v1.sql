/*
# Remove unused followed_authors lookup

1. Changes
- Drops the `followed_authors(p_device_id text)` function.

2. Why
- Followed photographers are now stored on the device (the shared follow store), so the Passport and gallery no longer read the server list.

3. Data safety
- Only a function is removed. The `photographer_follows` table and its rows are untouched.
- `set_photographer_follow` and `follower_count` remain in use and are not changed.
*/

DROP FUNCTION IF EXISTS followed_authors(text);
