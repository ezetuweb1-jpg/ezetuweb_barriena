/*
# Single Destination Entity for Cities
#
# 1. Add `iconic_spots` JSONB column to spots (array of landmark name strings).
# 2. Rename "Alhambra de Granada" -> "Granada" (it was a monument masquerading
#    as a city). The Alhambra becomes an iconic spot inside Granada.
# 3. Add Donostia as a new Basque city spot (Gipuzkoa / Donostialdea).
# 4. Populate iconic_spots for city-category spots.
*/

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'spots' AND column_name = 'iconic_spots') THEN
    ALTER TABLE spots ADD COLUMN iconic_spots jsonb DEFAULT '[]';
  END IF;
END $$;

-- Rename Alhambra de Granada to Granada (it IS the city, not the monument)
UPDATE spots SET name = 'Granada' WHERE id = '11111111-1111-4111-8111-111111111223';

-- Add Donostia (San Sebastián) as a Basque city
INSERT INTO spots (id, name, country, country_code, region, category, latitude, longitude, elevation_m, protected_zone, euskal_herria, bayesian_rating, ratings_count, verified, description, translations)
VALUES (
  '11111111-1111-4111-8111-111111111305',
  'Donostia',
  'Spain', 'ES',
  'Donostialdea',
  'city',
  43.3180, -1.9845,
  10, false,
  'Gipuzkoa',
  4.5, 30, true,
  'Basque coastal city famous for its bay, gastronomy and the Comb of the Wind sculpture.',
  $JSON${"eu":"Euskal kostaldeko hiria, bere badia, gastronomia eta Haizearen Orraziaren eskulturagatik ezaguna.","es":"Ciudad costera vasca famosa por su bahia, gastronomia y la escultura Peine del Viento.","en":"Basque coastal city famous for its bay, gastronomy and the Comb of the Wind sculpture.","fr":"Ville cotiere basque celebre pour sa baie, sa gastronomie et la sculpture Peigne du Vent.","de":"Baskische Kustenstadt, beruhmt fur ihre Bucht, Gastro nomie und die Skulptur Kamm des Windes.","it":"Citta costiera basca famosa per la baia, la gastronomia e la scultura Pettine del Vento."}$JSON$
)
ON CONFLICT (id) DO NOTHING;

-- Populate iconic_spots for cities
UPDATE spots SET iconic_spots = $JSON${"spots":["La Alhambra","Mirador de San Nicolas","El Albaicin"]}$JSON$ WHERE id = '11111111-1111-4111-8111-111111111223';

UPDATE spots SET iconic_spots = $JSON${"spots":["Karluv most (Puente de Carlos)","Prazsky hrad (Castillo)","Staromestske namesti"]}$JSON$ WHERE id = '11111111-1111-4111-8111-111111111127';

UPDATE spots SET iconic_spots = $JSON${"spots":["Kontxako Badia (La Concha)","Haizearen Orrazia (Peine del Viento)","Urgull"]}$JSON$ WHERE id = '11111111-1111-4111-8111-111111111305';

UPDATE spots SET iconic_spots = $JSON${"spots":["Piazza San Marco","Ponte di Rialto","Canal Grande"]}$JSON$ WHERE id = '11111111-1111-4111-8111-111111111128';

UPDATE spots SET iconic_spots = $JSON${"spots":["Bryggen","Floibanen","Fisketorget"]}$JSON$ WHERE id = '11111111-1111-4111-8111-111111111122';

UPDATE spots SET iconic_spots = $JSON${"spots":["Stradun","Muralles de la ciudad","Puerta de Pile"]}$JSON$ WHERE id = '11111111-1111-4111-8111-111111111119';

UPDATE spots SET iconic_spots = $JSON${"spots":["Edinburgh Castle","Royal Mile","Arthur's Seat"]}$JSON$ WHERE id = '11111111-1111-4111-8111-111111111113';

UPDATE spots SET iconic_spots = $JSON${"spots":["Cote des Basques","Rocher de la Vierge","Hotel du Palais"]}$JSON$ WHERE id = '11111111-1111-4111-8111-111111111205';
