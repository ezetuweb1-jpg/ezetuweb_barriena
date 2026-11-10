/*
# Fix Spot Coordinates for Accurate Map Rendering

## Purpose
Several spots had slightly inaccurate or imprecise coordinates. This migration
corrects the latitude/longitude for 9 key places to ensure accurate pin placement
and reliable bounds-based filtering on the Map Explorer.

## Changes
- UPDATE spots SET latitude/longitude for 9 spots (no data loss, only coordinate corrections):
  * Gaztelugatxe: 43.4475, -2.7849
  * Albarracín: 40.4075, -1.4428
  * Lago di Braies: 46.6947, 12.0854
  * Mont Saint-Michel: 48.6360, -1.5115
  * Praha: 50.0878, 14.4205
  * Neuschwanstein: 47.5576, 10.7498
  * Lauterbrunnen: 46.5935, 7.9090
  * Torres del Paine: -51.2532, -72.8814
  * Kyoto Arashiyama: 35.0116, 135.7681

## Security
No schema or policy changes.
*/

UPDATE spots SET latitude = 43.4475, longitude = -2.7849 WHERE id = '11111111-1111-4111-8111-111111111101';
UPDATE spots SET latitude = 40.4075, longitude = -1.4428 WHERE id = '11111111-1111-4111-8111-111111111102';
UPDATE spots SET latitude = 46.6947, longitude = 12.0854 WHERE id = '11111111-1111-4111-8111-111111111103';
UPDATE spots SET latitude = 48.6360, longitude = -1.5115 WHERE id = '11111111-1111-4111-8111-111111111104';
UPDATE spots SET latitude = -51.2532, longitude = -72.8814 WHERE id = '11111111-1111-4111-8111-111111111105';
UPDATE spots SET latitude = 35.0116, longitude = 135.7681 WHERE id = '11111111-1111-4111-8111-111111111114';
UPDATE spots SET latitude = 47.5576, longitude = 10.7498 WHERE id = '11111111-1111-4111-8111-111111111126';
UPDATE spots SET latitude = 50.0878, longitude = 14.4205 WHERE id = '11111111-1111-4111-8111-111111111127';
UPDATE spots SET latitude = 46.5935, longitude = 7.9090 WHERE id = '11111111-1111-4111-8111-111111111118';
