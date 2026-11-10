/*
# Update hero photo author to Basque name

## What changed
- Updates the hero photo's author from "Alejandro De Roa" to "Mikel Etxebarria"
  so the Hero attribution shows a Basque photographer name when viewing in Euskara.
- No schema changes, no RLS changes.
*/

UPDATE photos
SET author = 'Mikel Etxebarria'
WHERE is_hero = true AND spot_id = '11111111-1111-4111-8111-111111111101';
