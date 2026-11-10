/*
# Add Iconic Worldwide Spots and Seed Photos

## What This Migration Does

1. Adds 8 new iconic worldwide spots that were missing from the database:
   - Gaztelugatxe (Basque Country, Spain) — nature, hero spot
   - Lago di Braies (Italy) — nature
   - Mont Saint-Michel (France) — village
   - Neuschwanstein (Germany) — village
   - Lauterbrunnen (Switzerland) — nature
   - Torres del Paine (Chile) — nature
   - Kyoto (Japan) — city
   - Albarracín (Spain) — village

2. Seeds photos for ALL spots (existing + new) using real landscape photography URLs.
   Each spot gets 1-2 photos with appropriate season tags, like counts, and trend scores.
   The Gaztelugatxe photo is marked as is_hero = true (Foto del Día).

3. All new spots get translations in es/en/eus where applicable.

## Security
- No new tables created. All inserts go into existing `spots` and `photos` tables.
- RLS already enabled on both tables with anon+authenticated CRUD policies.
- No policy changes needed.
*/

-- Insert iconic spots (idempotent: skip if name already exists)
INSERT INTO spots (id, name, country, country_code, region, category, latitude, longitude, elevation_m, protected_zone, euskal_herria, bayesian_rating, ratings_count, verified, description, translations, iconic_spots)
SELECT
  '11111111-1111-4111-8111-111111111101',
  'Gaztelugatxe', 'Spain', 'ES', 'Bizkaia', 'nature',
  43.4466, -2.3089, 150, true, 'Bizkaia',
  4.8, 12, true,
  'Hermitage on a rocky islet connected by a narrow stone bridge along the Basque coast.',
  '{"es": "Ermita sobre un islote rocoso conectado por un estrecho puente de piedra en la costa vasca.", "en": "Hermitage on a rocky islet connected by a narrow stone bridge along the Basque coast.", "eus": "Itsaslaldeko harkaitz batean dagoen ermita, harrizko zubi estu batekin konektatua."}',
  '{"spots": ["San Juan de Gaztelugatxe", "Puente de piedra", "Costa de Bizkaia"]}'
WHERE NOT EXISTS (SELECT 1 FROM spots WHERE name = 'Gaztelugatxe');

INSERT INTO spots (id, name, country, country_code, region, category, latitude, longitude, elevation_m, protected_zone, euskal_herria, bayesian_rating, ratings_count, verified, description, translations, iconic_spots)
SELECT
  '11111111-1111-4111-8111-111111111102',
  'Lago di Braies', 'Italy', 'IT', 'Dolomiti', 'nature',
  46.6933, 12.0944, 1469, false, null,
  4.8, 10, true,
  'Emerald alpine lake in the Dolomites surrounded by towering peaks.',
  '{"es": "Lago alpino esmeralda en los Dolomitas rodeado de picos imponentes.", "en": "Emerald alpine lake in the Dolomites surrounded by towering peaks.", "eus": "Dolomitetako laku alpino esmeralda, gailur ikusgarriez inguratua."}',
  '{"spots": ["Lago di Braies", "Dolomiti", "Pragser Wildsee"]}'
WHERE NOT EXISTS (SELECT 1 FROM spots WHERE name = 'Lago di Braies');

INSERT INTO spots (id, name, country, country_code, region, category, latitude, longitude, elevation_m, protected_zone, euskal_herria, bayesian_rating, ratings_count, verified, description, translations, iconic_spots)
SELECT
  '11111111-1111-4111-8111-111111111103',
  'Mont Saint-Michel', 'France', 'FR', 'Normandie', 'village',
  48.6361, -1.5114, 80, true, null,
  4.8, 11, true,
  'Medieval abbey on a tidal island off the Normandy coast.',
  '{"es": "Abadía medieval en una isla de mareas frente a la costa de Normandía.", "en": "Medieval abbey on a tidal island off the Normandy coast.", "eus": "Normandiako kostatik kanpo dagoen marearteko uharte bateko abadia Erdi Arokoa."}',
  '{"spots": ["Abbaye du Mont Saint-Michel", "Tidal causeway", "Normandy"]}'
WHERE NOT EXISTS (SELECT 1 FROM spots WHERE name = 'Mont Saint-Michel');

INSERT INTO spots (id, name, country, country_code, region, category, latitude, longitude, elevation_m, protected_zone, euskal_herria, bayesian_rating, ratings_count, verified, description, translations, iconic_spots)
SELECT
  '11111111-1111-4111-8111-111111111104',
  'Neuschwanstein', 'Germany', 'DE', 'Bayern', 'village',
  47.5575, 10.7497, 800, false, null,
  4.7, 9, true,
  'Fairytale castle perched on a rugged hill above Hohenschwangau village in Bavaria.',
  '{"es": "Castillo de cuento de hadas sobre una colina escarpada en Baviera.", "en": "Fairytale castle perched on a rugged hill above Hohenschwangau village in Bavaria.", "eus": "Ipuinetako gaztelu bat Bavariako muino harritsu batean."}',
  '{"spots": ["Schloss Neuschwanstein", "Hohenschwangau", "Bavaria Alps"]}'
WHERE NOT EXISTS (SELECT 1 FROM spots WHERE name = 'Neuschwanstein');

INSERT INTO spots (id, name, country, country_code, region, category, latitude, longitude, elevation_m, protected_zone, euskal_herria, bayesian_rating, ratings_count, verified, description, translations, iconic_spots)
SELECT
  '11111111-1111-4111-8111-111111111105',
  'Lauterbrunnen', 'Switzerland', 'CH', 'Bernese Oberland', 'nature',
  46.5939, 7.9089, 802, false, null,
  4.7, 8, true,
  'Valley of 72 waterfalls with sheer cliff walls in the Swiss Alps.',
  '{"es": "Valle de 72 cascadas con paredes verticales en los Alpes suizos.", "en": "Valley of 72 waterfalls with sheer cliff walls in the Swiss Alps.", "eus": "72 ur-jauziko harana, labar bertikalekin Alpe suitzarretan."}',
  '{"spots": ["Staubbach Falls", "Trümmelbach Falls", "Lauterbrunnen Valley"]}'
WHERE NOT EXISTS (SELECT 1 FROM spots WHERE name = 'Lauterbrunnen');

INSERT INTO spots (id, name, country, country_code, region, category, latitude, longitude, elevation_m, protected_zone, euskal_herria, bayesian_rating, ratings_count, verified, description, translations, iconic_spots)
SELECT
  '11111111-1111-4111-8111-111111111106',
  'Torres del Paine', 'Chile', 'CL', 'Patagonia', 'nature',
  -51.0000, -73.0833, 2500, true, null,
  4.9, 14, true,
  'Dramatic granite peaks rising from the Patagonian steppe in Chilean Patagonia.',
  '{"es": "Picos de granito dramáticos que se elevan desde la estepa patagónica.", "en": "Dramatic granite peaks rising from the Patagonian steppe in Chilean Patagonia.", "eus": "Granitoko gailur dramatikoak Patagoniako ordokietatik altxatzen direnak."}',
  '{"spots": ["Cuernos del Paine", "Lago Grey", "Torres del Paine"]}'
WHERE NOT EXISTS (SELECT 1 FROM spots WHERE name = 'Torres del Paine');

INSERT INTO spots (id, name, country, country_code, region, category, latitude, longitude, elevation_m, protected_zone, euskal_herria, bayesian_rating, ratings_count, verified, description, translations, iconic_spots)
SELECT
  '11111111-1111-4111-8111-111111111107',
  'Kyoto', 'Japan', 'JP', 'Kansai', 'city',
  35.0116, 135.7681, 200, false, null,
  4.8, 15, true,
  'Ancient capital of Japan famed for temples, bamboo groves, and autumn foliage.',
  '{"es": "Antigua capital de Japón famosa por templos, bosques de bambú y follaje otoñal.", "en": "Ancient capital of Japan famed for temples, bamboo groves, and autumn foliage.", "eus": "Japoniako antzinako hiriburua, tenplu, banbu eta udazkeneko hostoeengatik ezaguna."}',
  '{"spots": ["Fushimi Inari", "Kinkaku-ji", "Arashiyama Bamboo Grove"]}'
WHERE NOT EXISTS (SELECT 1 FROM spots WHERE name = 'Kyoto');

INSERT INTO spots (id, name, country, country_code, region, category, latitude, longitude, elevation_m, protected_zone, euskal_herria, bayesian_rating, ratings_count, verified, description, translations, iconic_spots)
SELECT
  '11111111-1111-4111-8111-111111111108',
  'Albarracín', 'Spain', 'ES', 'Aragón', 'village',
  40.4083, -1.4444, 1162, false, null,
  4.7, 10, true,
  'Pink-walled medieval village perched on a cliff above the Guadalquivir river.',
  '{"es": "Pueblo medieval de muros rosados sobre un acantilado junto al río Guadalquivir.", "en": "Pink-walled medieval village perched on a cliff above the Guadalquivir river.", "eus": "Horma arroxekako herri Erdi Arokoa, amildegi baten gainean."}',
  '{"spots": ["Murallas de Albarracín", "Calle del Azabal", "Iglesia de Santa María"]}'
WHERE NOT EXISTS (SELECT 1 FROM spots WHERE name = 'Albarracín');

-- Seed photos for ALL spots using real landscape photography
-- Only insert if the photos table is empty for that spot (idempotent)

-- Gaztelugatxe (hero)
INSERT INTO photos (spot_id, image_url, width, height, author, season, likes, trend_score, is_hero)
SELECT '11111111-1111-4111-8111-111111111101', 'https://images.pexels.com/photos/29809979/pexels-photo-29809979.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 5964, 3976, 'Alejandro De Roa', 'summer', 3420, 98.5, true
WHERE NOT EXISTS (SELECT 1 FROM photos WHERE spot_id = '11111111-1111-4111-8111-111111111101');

-- Lago di Braies
INSERT INTO photos (spot_id, image_url, width, height, author, season, likes, trend_score, is_hero)
SELECT '11111111-1111-4111-8111-111111111102', 'https://images.pexels.com/photos/40039366/pexels-photo-40039366.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 8064, 4536, 'Harsh Kukadiya', 'summer', 2890, 92.3, false
WHERE NOT EXISTS (SELECT 1 FROM photos WHERE spot_id = '11111111-1111-4111-8111-111111111102');

-- Mont Saint-Michel
INSERT INTO photos (spot_id, image_url, width, height, author, season, likes, trend_score, is_hero)
SELECT '11111111-1111-4111-8111-111111111103', 'https://images.pexels.com/photos/35257273/pexels-photo-35257273.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 6205, 4160, 'Diego HG', 'autumn', 2750, 89.1, false
WHERE NOT EXISTS (SELECT 1 FROM photos WHERE spot_id = '11111111-1111-4111-8111-111111111103');

-- Neuschwanstein
INSERT INTO photos (spot_id, image_url, width, height, author, season, likes, trend_score, is_hero)
SELECT '11111111-1111-4111-8111-111111111104', 'https://images.pexels.com/photos/11348493/pexels-photo-11348493.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 6480, 4320, 'Gildo Cancelli', 'autumn', 2600, 86.7, false
WHERE NOT EXISTS (SELECT 1 FROM photos WHERE spot_id = '11111111-1111-4111-8111-111111111104');

-- Lauterbrunnen
INSERT INTO photos (spot_id, image_url, width, height, author, season, likes, trend_score, is_hero)
SELECT '11111111-1111-4111-8111-111111111105', 'https://images.pexels.com/photos/34242011/pexels-photo-34242011.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 4928, 3264, 'Adrian Limani', 'summer', 2400, 83.2, false
WHERE NOT EXISTS (SELECT 1 FROM photos WHERE spot_id = '11111111-1111-4111-8111-111111111105');

-- Torres del Paine
INSERT INTO photos (spot_id, image_url, width, height, author, season, likes, trend_score, is_hero)
SELECT '11111111-1111-4111-8111-111111111106', 'https://images.pexels.com/photos/30359266/pexels-photo-30359266.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 5144, 2803, 'Marek Piwnicki', 'winter', 3100, 95.1, false
WHERE NOT EXISTS (SELECT 1 FROM photos WHERE spot_id = '11111111-1111-4111-8111-111111111106');

-- Kyoto
INSERT INTO photos (spot_id, image_url, width, height, author, season, likes, trend_score, is_hero)
SELECT '11111111-1111-4111-8111-111111111107', 'https://images.pexels.com/photos/35323182/pexels-photo-35323182.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 6000, 4000, 'Emiliano Lara', 'autumn', 3200, 94.8, false
WHERE NOT EXISTS (SELECT 1 FROM photos WHERE spot_id = '11111111-1111-4111-8111-111111111107');

-- Albarracín
INSERT INTO photos (spot_id, image_url, width, height, author, season, likes, trend_score, is_hero)
SELECT '11111111-1111-4111-8111-111111111108', 'https://images.pexels.com/photos/5205782/pexels-photo-5205782.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 5336, 3558, 'Manuel', 'summer', 1850, 78.5, false
WHERE NOT EXISTS (SELECT 1 FROM photos WHERE spot_id = '11111111-1111-4111-8111-111111111108');

-- Existing spots: seed photos
-- Tre Cime di Lavaredo
INSERT INTO photos (spot_id, image_url, width, height, author, season, likes, trend_score, is_hero)
SELECT '11111111-1111-4111-8111-111111111211', 'https://images.pexels.com/photos/32713329/pexels-photo-32713329.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 5184, 3888, 'Dirk Pothen', 'summer', 2900, 91.2, false
WHERE NOT EXISTS (SELECT 1 FROM photos WHERE spot_id = '11111111-1111-4111-8111-111111111211');

-- Granada
INSERT INTO photos (spot_id, image_url, width, height, author, season, likes, trend_score, is_hero)
SELECT '11111111-1111-4111-8111-111111111223', 'https://images.pexels.com/photos/11829134/pexels-photo-11829134.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 6048, 4024, 'Zekai Zhu', 'spring', 3050, 93.5, false
WHERE NOT EXISTS (SELECT 1 FROM photos WHERE spot_id = '11111111-1111-4111-8111-111111111223');

-- Matterhorn
INSERT INTO photos (spot_id, image_url, width, height, author, season, likes, trend_score, is_hero)
SELECT '11111111-1111-4111-8111-111111111214', 'https://images.pexels.com/photos/29734968/pexels-photo-29734968.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 6000, 4000, 'Ilia Bronskiy', 'summer', 2800, 90.1, false
WHERE NOT EXISTS (SELECT 1 FROM photos WHERE spot_id = '11111111-1111-4111-8111-111111111214');

-- Cirque de Gavarnie
INSERT INTO photos (spot_id, image_url, width, height, author, season, likes, trend_score, is_hero)
SELECT '11111111-1111-4111-8111-111111111209', 'https://images.pexels.com/photos/12020794/pexels-photo-12020794.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 4272, 2848, 'arnaud audoin', 'summer', 2200, 82.3, false
WHERE NOT EXISTS (SELECT 1 FROM photos WHERE spot_id = '11111111-1111-4111-8111-111111111209');

-- Val d'Orcia
INSERT INTO photos (spot_id, image_url, width, height, author, season, likes, trend_score, is_hero)
SELECT '11111111-1111-4111-8111-111111111217', 'https://images.pexels.com/photos/37666468/pexels-photo-37666468.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 9504, 5346, 'Phil Evenden', 'spring', 2400, 85.7, false
WHERE NOT EXISTS (SELECT 1 FROM photos WHERE spot_id = '11111111-1111-4111-8111-111111111217');

-- Ordesa Valley
INSERT INTO photos (spot_id, image_url, width, height, author, season, likes, trend_score, is_hero)
SELECT '11111111-1111-4111-8111-111111111206', 'https://images.pexels.com/photos/27729412/pexels-photo-27729412.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 6000, 4000, 'SilBaBum', 'summer', 2100, 80.5, false
WHERE NOT EXISTS (SELECT 1 FROM photos WHERE spot_id = '11111111-1111-4111-8111-111111111206');

-- Hondarribia
INSERT INTO photos (spot_id, image_url, width, height, author, season, likes, trend_score, is_hero)
SELECT '11111111-1111-4111-8111-111111111203', 'https://images.pexels.com/photos/14423261/pexels-photo-14423261.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 5184, 3456, 'Guerrero De la Luz', 'summer', 1700, 72.3, false
WHERE NOT EXISTS (SELECT 1 FROM photos WHERE spot_id = '11111111-1111-4111-8111-111111111203');

-- San Gimignano
INSERT INTO photos (spot_id, image_url, width, height, author, season, likes, trend_score, is_hero)
SELECT '11111111-1111-4111-8111-111111111218', 'https://images.pexels.com/photos/7717507/pexels-photo-7717507.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 3872, 2592, 'Siegfried Poepperl', 'summer', 2300, 84.1, false
WHERE NOT EXISTS (SELECT 1 FROM photos WHERE spot_id = '11111111-1111-4111-8111-111111111218');

-- Aigüestortes
INSERT INTO photos (spot_id, image_url, width, height, author, season, likes, trend_score, is_hero)
SELECT '11111111-1111-4111-8111-111111111208', 'https://images.pexels.com/photos/13314730/pexels-photo-13314730.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 5620, 3819, 'Manu Edition', 'summer', 1900, 76.8, false
WHERE NOT EXISTS (SELECT 1 FROM photos WHERE spot_id = '11111111-1111-4111-8111-111111111208');

-- Ronda
INSERT INTO photos (spot_id, image_url, width, height, author, season, likes, trend_score, is_hero)
SELECT '11111111-1111-4111-8111-111111111222', 'https://images.pexels.com/photos/11829157/pexels-photo-11829157.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 6048, 4024, 'Zekai Zhu', 'autumn', 2500, 86.9, false
WHERE NOT EXISTS (SELECT 1 FROM photos WHERE spot_id = '11111111-1111-4111-8111-111111111222');

-- Lago di Carezza
INSERT INTO photos (spot_id, image_url, width, height, author, season, likes, trend_score, is_hero)
SELECT '11111111-1111-4111-8111-111111111212', 'https://images.pexels.com/photos/34797482/pexels-photo-34797482.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 5272, 2962, 'Ken Cheung', 'autumn', 2600, 87.5, false
WHERE NOT EXISTS (SELECT 1 FROM photos WHERE spot_id = '11111111-1111-4111-8111-111111111212');

-- Getaria
INSERT INTO photos (spot_id, image_url, width, height, author, season, likes, trend_score, is_hero)
SELECT '11111111-1111-4111-8111-111111111201', 'https://images.pexels.com/photos/13153777/pexels-photo-13153777.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 5568, 3712, 'Emilio Sánchez Hernández', 'summer', 1500, 68.2, false
WHERE NOT EXISTS (SELECT 1 FROM photos WHERE spot_id = '11111111-1111-4111-8111-111111111201');

-- Aneto Peak
INSERT INTO photos (spot_id, image_url, width, height, author, season, likes, trend_score, is_hero)
SELECT '11111111-1111-4111-8111-111111111207', 'https://images.pexels.com/photos/14096999/pexels-photo-14096999.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 6016, 4000, 'Ye Baiq', 'winter', 1800, 74.6, false
WHERE NOT EXISTS (SELECT 1 FROM photos WHERE spot_id = '11111111-1111-4111-8111-111111111207');

-- Val Gardena
INSERT INTO photos (spot_id, image_url, width, height, author, season, likes, trend_score, is_hero)
SELECT '11111111-1111-4111-8111-111111111213', 'https://images.pexels.com/photos/33786361/pexels-photo-33786361.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 5472, 3648, 'Igor Passchier', 'winter', 2000, 79.3, false
WHERE NOT EXISTS (SELECT 1 FROM photos WHERE spot_id = '11111111-1111-4111-8111-111111111213');

-- Grossglockner
INSERT INTO photos (spot_id, image_url, width, height, author, season, likes, trend_score, is_hero)
SELECT '11111111-1111-4111-8111-111111111216', 'https://images.pexels.com/photos/23358699/pexels-photo-23358699.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 3280, 2464, 'Dmitry Romanoff', 'summer', 1900, 77.1, false
WHERE NOT EXISTS (SELECT 1 FROM photos WHERE spot_id = '11111111-1111-4111-8111-111111111216');

-- Montepulciano
INSERT INTO photos (spot_id, image_url, width, height, author, season, likes, trend_score, is_hero)
SELECT '11111111-1111-4111-8111-111111111219', 'https://images.pexels.com/photos/14373361/pexels-photo-14373361.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 4032, 3024, 'Vlado Paunovic', 'summer', 1750, 71.8, false
WHERE NOT EXISTS (SELECT 1 FROM photos WHERE spot_id = '11111111-1111-4111-8111-111111111219');

-- Cabo de Gata
INSERT INTO photos (spot_id, image_url, width, height, author, season, likes, trend_score, is_hero)
SELECT '11111111-1111-4111-8111-111111111224', 'https://images.pexels.com/photos/28353887/pexels-photo-28353887.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 6000, 4000, 'Antonio Porras Llopis', 'summer', 1950, 78.9, false
WHERE NOT EXISTS (SELECT 1 FROM photos WHERE spot_id = '11111111-1111-4111-8111-111111111224');

-- Zumaia
INSERT INTO photos (spot_id, image_url, width, height, author, season, likes, trend_score, is_hero)
SELECT '11111111-1111-4111-8111-111111111301', 'https://images.pexels.com/photos/33183368/pexels-photo-33183368.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 5860, 3907, 'Daniel Ledesma', 'spring', 2100, 81.4, false
WHERE NOT EXISTS (SELECT 1 FROM photos WHERE spot_id = '11111111-1111-4111-8111-111111111301');

-- Donostia
INSERT INTO photos (spot_id, image_url, width, height, author, season, likes, trend_score, is_hero)
SELECT '11111111-1111-4111-8111-111111111305', 'https://images.pexels.com/photos/29283772/pexels-photo-29283772.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 2846, 1991, 'luis Peralta', 'summer', 2200, 83.7, false
WHERE NOT EXISTS (SELECT 1 FROM photos WHERE spot_id = '11111111-1111-4111-8111-111111111305');

-- Oñati
INSERT INTO photos (spot_id, image_url, width, height, author, season, likes, trend_score, is_hero)
SELECT '11111111-1111-4111-8111-111111111202', 'https://images.pexels.com/photos/38037238/pexels-photo-38037238.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 4416, 2488, 'J MAD', 'spring', 1600, 69.5, false
WHERE NOT EXISTS (SELECT 1 FROM photos WHERE spot_id = '11111111-1111-4111-8111-111111111202');

-- Sierra de Cazorla
INSERT INTO photos (spot_id, image_url, width, height, author, season, likes, trend_score, is_hero)
SELECT '11111111-1111-4111-8111-111111111225', 'https://images.pexels.com/photos/37415920/pexels-photo-37415920.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 6097, 4065, 'Emilio Sánchez Hernández', 'spring', 1700, 72.1, false
WHERE NOT EXISTS (SELECT 1 FROM photos WHERE spot_id = '11111111-1111-4111-8111-111111111225');

-- Zugspitze
INSERT INTO photos (spot_id, image_url, width, height, author, season, likes, trend_score, is_hero)
SELECT '11111111-1111-4111-8111-111111111215', 'https://images.pexels.com/photos/20755851/pexels-photo-20755851.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 6240, 3510, 'Bastian Riccardi', 'winter', 1850, 75.3, false
WHERE NOT EXISTS (SELECT 1 FROM photos WHERE spot_id = '11111111-1111-4111-8111-111111111215');

-- Siena Countryside
INSERT INTO photos (spot_id, image_url, width, height, author, season, likes, trend_score, is_hero)
SELECT '11111111-1111-4111-8111-111111111221', 'https://images.pexels.com/photos/27659795/pexels-photo-27659795.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 6000, 3376, 'YIYANG LIU', 'spring', 1900, 76.4, false
WHERE NOT EXISTS (SELECT 1 FROM photos WHERE spot_id = '11111111-1111-4111-8111-111111111221');

-- Aralar Range
INSERT INTO photos (spot_id, image_url, width, height, author, season, likes, trend_score, is_hero)
SELECT '11111111-1111-4111-8111-111111111204', 'https://images.pexels.com/photos/9518092/pexels-photo-9518092.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 5184, 2920, 'Sébastien Vincon', 'summer', 1550, 67.8, false
WHERE NOT EXISTS (SELECT 1 FROM photos WHERE spot_id = '11111111-1111-4111-8111-111111111204');

-- Crete Senesi
INSERT INTO photos (spot_id, image_url, width, height, author, season, likes, trend_score, is_hero)
SELECT '11111111-1111-4111-8111-111111111220', 'https://images.pexels.com/photos/35376543/pexels-photo-35376543.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 5184, 3456, 'Rino Adamo', 'autumn', 1650, 70.2, false
WHERE NOT EXISTS (SELECT 1 FROM photos WHERE spot_id = '11111111-1111-4111-8111-111111111220');

-- Grazalema
INSERT INTO photos (spot_id, image_url, width, height, author, season, likes, trend_score, is_hero)
SELECT '11111111-1111-4111-8111-111111111226', 'https://images.pexels.com/photos/39464132/pexels-photo-39464132.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 8192, 4096, 'Quentin Martinez', 'spring', 1450, 65.1, false
WHERE NOT EXISTS (SELECT 1 FROM photos WHERE spot_id = '11111111-1111-4111-8111-111111111226');

-- Biarritz
INSERT INTO photos (spot_id, image_url, width, height, author, season, likes, trend_score, is_hero)
SELECT '11111111-1111-4111-8111-111111111205', 'https://images.pexels.com/photos/23105775/pexels-photo-23105775.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 6130, 4087, 'Mathias Reding', 'summer', 1750, 73.2, false
WHERE NOT EXISTS (SELECT 1 FROM photos WHERE spot_id = '11111111-1111-4111-8111-111111111205');

-- Bardenas Reales
INSERT INTO photos (spot_id, image_url, width, height, author, season, likes, trend_score, is_hero)
SELECT '11111111-1111-4111-8111-111111111303', 'https://images.pexels.com/photos/11186841/pexels-photo-11186841.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 4539, 3026, 'Sébastien Vincon', 'autumn', 2000, 79.8, false
WHERE NOT EXISTS (SELECT 1 FROM photos WHERE spot_id = '11111111-1111-4111-8111-111111111303');

-- Gorbeia
INSERT INTO photos (spot_id, image_url, width, height, author, season, likes, trend_score, is_hero)
SELECT '11111111-1111-4111-8111-111111111302', 'https://images.pexels.com/photos/20543360/pexels-photo-20543360.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 5184, 2657, 'Jose Prada', 'autumn', 1400, 63.5, false
WHERE NOT EXISTS (SELECT 1 FROM photos WHERE spot_id = '11111111-1111-4111-8111-111111111302');

-- Donibane Garazi
INSERT INTO photos (spot_id, image_url, width, height, author, season, likes, trend_score, is_hero)
SELECT '11111111-1111-4111-8111-111111111304', 'https://images.pexels.com/photos/24568237/pexels-photo-24568237.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 5120, 2880, 'SlimMars 13', 'summer', 1300, 61.2, false
WHERE NOT EXISTS (SELECT 1 FROM photos WHERE spot_id = '11111111-1111-4111-8111-111111111304');

-- Somport Pass
INSERT INTO photos (spot_id, image_url, width, height, author, season, likes, trend_score, is_hero)
SELECT '11111111-1111-4111-8111-111111111210', 'https://images.pexels.com/photos/38339399/pexels-photo-38339399.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 4000, 3000, 'Scott Fenwick', 'summer', 1200, 58.7, false
WHERE NOT EXISTS (SELECT 1 FROM photos WHERE spot_id = '11111111-1111-4111-8111-111111111210');

-- Add a second photo for some spots for more gallery variety
-- Gaztelugatxe second photo
INSERT INTO photos (spot_id, image_url, width, height, author, season, likes, trend_score, is_hero)
SELECT '11111111-1111-4111-8111-111111111101', 'https://images.pexels.com/photos/6648372/pexels-photo-6648372.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 6000, 4000, 'Enrique', 'spring', 2800, 88.3, false
WHERE NOT EXISTS (SELECT 1 FROM photos WHERE spot_id = '11111111-1111-4111-8111-111111111101' AND image_url LIKE '%6648372%');

-- Kyoto second photo
INSERT INTO photos (spot_id, image_url, width, height, author, season, likes, trend_score, is_hero)
SELECT '11111111-1111-4111-8111-111111111107', 'https://images.pexels.com/photos/33229939/pexels-photo-33229939.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 5472, 3078, 'Lorenzo Castellino', 'autumn', 2900, 90.2, false
WHERE NOT EXISTS (SELECT 1 FROM photos WHERE spot_id = '11111111-1111-4111-8111-111111111107' AND image_url LIKE '%33229939%');

-- Torres del Paine second photo
INSERT INTO photos (spot_id, image_url, width, height, author, season, likes, trend_score, is_hero)
SELECT '11111111-1111-4111-8111-111111111106', 'https://images.pexels.com/photos/7499998/pexels-photo-7499998.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 3780, 2623, 'Tom D''Arby', 'autumn', 2700, 87.6, false
WHERE NOT EXISTS (SELECT 1 FROM photos WHERE spot_id = '11111111-1111-4111-8111-111111111106' AND image_url LIKE '%7499998%');

-- Dolomites (Tre Cime) second photo
INSERT INTO photos (spot_id, image_url, width, height, author, season, likes, trend_score, is_hero)
SELECT '11111111-1111-4111-8111-111111111211', 'https://images.pexels.com/photos/3039336/pexels-photo-3039336.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 6322, 4215, 'Thomas Vitali', 'winter', 2500, 84.5, false
WHERE NOT EXISTS (SELECT 1 FROM photos WHERE spot_id = '11111111-1111-4111-8111-111111111211' AND image_url LIKE '%3039336%');
