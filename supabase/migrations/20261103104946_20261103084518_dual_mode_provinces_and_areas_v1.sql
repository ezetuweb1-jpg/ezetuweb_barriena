ALTER TABLE spots ADD COLUMN IF NOT EXISTS provinces text[];
ALTER TABLE spots ADD COLUMN IF NOT EXISTS area_of_interest text;

UPDATE spots SET provinces = ARRAY[province] WHERE provinces IS NULL AND province IS NOT NULL;
UPDATE spots SET provinces = ARRAY[]::text[] WHERE provinces IS NULL AND province IS NULL;

UPDATE spots SET province = 'Bolzano', provinces = ARRAY['Bolzano']
WHERE id = '11111111-1111-4111-8111-111111111102';

UPDATE spots SET province = 'Bolzano', provinces = ARRAY['Bolzano']
WHERE id = '11111111-1111-4111-8111-111111111212';

UPDATE spots SET province = 'Bolzano', provinces = ARRAY['Bolzano']
WHERE id = '11111111-1111-4111-8111-111111111213';

UPDATE spots SET province = 'Belluno', provinces = ARRAY['Belluno', 'Bolzano']
WHERE id = '11111111-1111-4111-8111-111111111211';

UPDATE spots SET provinces = ARRAY['Huesca']
WHERE id = '11111111-1111-4111-8111-111111111206';

UPDATE spots SET area_of_interest = 'Dolomiti'
WHERE id IN (
  '11111111-1111-4111-8111-111111111102',
  '11111111-1111-4111-8111-111111111211',
  '11111111-1111-4111-8111-111111111212',
  '11111111-1111-4111-8111-111111111213'
);

UPDATE spots SET area_of_interest = 'Val d''Orcia'
WHERE id = '11111111-1111-4111-8111-111111111217';

UPDATE spots SET area_of_interest = 'Pirineos'
WHERE id IN (
  '11111111-1111-4111-8111-111111111206',
  '11111111-1111-4111-8111-111111111207',
  '11111111-1111-4111-8111-111111111209',
  '11111111-1111-4111-8111-111111111210',
  '11111111-1111-4111-8111-111111111208'
);

UPDATE spots SET area_of_interest = 'Urdaibai'
WHERE id = '11111111-1111-4111-8111-111111111101';

UPDATE spots SET area_of_interest = comarca
WHERE euskal_herria IS NOT NULL AND comarca IS NOT NULL AND area_of_interest IS NULL;

DELETE FROM photos WHERE spot_id = '11111111-1111-4111-8111-111111111221';
DELETE FROM spots WHERE id = '11111111-1111-4111-8111-111111111221';

INSERT INTO spots (id, name, country, country_code, region, category, latitude, longitude, elevation_m, protected_zone, euskal_herria, province, provinces, comarca, area_of_interest, bayesian_rating, ratings_count, verified, description, translations, iconic_spots)
VALUES (
  '11111111-1111-4111-8111-111111111231',
  'Pienza',
  'Italy', 'IT',
  'Tuscany',
  'village',
  43.0718, 11.6762,
  491, false,
  NULL,
  'Siena',
  ARRAY['Siena'],
  NULL,
  'Val d''Orcia',
  4.7, 10, true,
  'Renaissance ideal town in Val d''Orcia, UNESCO World Heritage, famous for pecorino cheese and cypress-lined roads.',
  '{"es":"Pueblo renacentista ideal en Val d''Orcia, Patrimonio UNESCO, famoso por el queso pecorino y carreteras de cipreses.","en":"Renaissance ideal town in Val d''Orcia, UNESCO World Heritage, famous for pecorino cheese and cypress-lined roads.","eu":"Val d''Orciako herri pizkundetar ideala, UNESCOren ondarea, pecorino gaztagatik eta ziprez bideengatik ezaguna.","fr":"Bourg renaissance ideal dans le Val d''Orcia, patrimoine UNESCO, celebre pour le pecorino et les routes de cypres.","de":"Idealstadt der Renaissance im Val d''Orcia, UNESCO-Welterbe, beruhmt fur Pecorino und Zypressenalleen.","it":"Borgo rinascimentale ideale in Val d''Orcia, patrimonio UNESCO, famoso per il pecorino e le strade di cipressi."}',
  '{"spots": ["Duomo di Pienza", "Palazzo Piccolomini", "Corso Rossellino"]}'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO spots (id, name, country, country_code, region, category, latitude, longitude, elevation_m, protected_zone, euskal_herria, province, provinces, comarca, area_of_interest, bayesian_rating, ratings_count, verified, description, translations, iconic_spots)
VALUES (
  '11111111-1111-4111-8111-111111111232',
  'Cipressi di San Quirico d''Orcia',
  'Italy', 'IT',
  'Tuscany',
  'nature',
  43.0720, 11.6250,
  407, false,
  NULL,
  'Siena',
  ARRAY['Siena'],
  NULL,
  'Val d''Orcia',
  4.5, 7, true,
  'Iconic cluster of cypress trees in San Quirico d''Orcia, symbol of the Tuscan landscape.',
  '{"es":"Grupo iconico de cipreses en San Quirico d''Orcia, simbolo del paisaje toscano.","en":"Iconic cluster of cypress trees in San Quirico d''Orcia, symbol of the Tuscan landscape.","eu":"San Quirico d''Orciako ziprez ikonikoak, Toskanako paisaiaren sinboloa.","fr":"Groupe emblematique de cypres a San Quirico d''Orcia, symbole du paysage toscan.","de":"Ikonische Zypressengruppe in San Quirico d''Orcia, Symbol der toskanischen Landschaft.","it":"Gruppo iconico di cipressi a San Quirico d''Orcia, simbolo del paesaggio toscano."}',
  '{"spots": []}'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO photos (spot_id, image_url, width, height, author, season, likes, trend_score, is_hero, camera_model, lens, aperture, shutter_speed, iso)
VALUES (
  '11111111-1111-4111-8111-111111111231',
  'https://images.pexels.com/photos/3708526/pexels-photo-3708526.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  6000, 4000,
  'Massimo Ossana',
  'spring',
  2200, 82.3,
  false,
  'Canon EOS R6', 'RF 24-105mm f/4L', 'f/8.0', '1/200s', 200
)
ON CONFLICT DO NOTHING;

INSERT INTO photos (spot_id, image_url, width, height, author, season, likes, trend_score, is_hero)
VALUES (
  '11111111-1111-4111-8111-111111111232',
  'https://images.pexels.com/photos/16265831/pexels-photo-16265831.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  5472, 3648,
  'Pierre Chatel-Innocenti',
  'spring',
  1850, 74.6,
  false
)
ON CONFLICT DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_spots_provinces_gin ON spots USING GIN (provinces);
CREATE INDEX IF NOT EXISTS idx_spots_area_of_interest ON spots(area_of_interest);
