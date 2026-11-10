/*
# Fix Basque spot comarcas + seed additional Basque spots

## Purpose
1. Repurpose the `region` column for Basque spots to hold the comarca/eskualdea
   (it previously duplicated `euskal_herria`, i.e. the lurraldea/province).
   `euskal_herria` = lurraldea/province, `region` = comarca/eskualdea.
2. Seed 4 new Basque spots to test comarca filtering across lurraldeak.
*/

-- ============================================================
-- 1. Update existing Basque spots: set region = comarca
-- ============================================================
UPDATE spots SET region = 'Busturialdea' WHERE id = '11111111-1111-4111-8111-111111111101';
UPDATE spots SET region = 'Urola Kosta'  WHERE id = '11111111-1111-4111-8111-111111111201';
UPDATE spots SET region = 'Debagoiena'   WHERE id = '11111111-1111-4111-8111-111111111202';
UPDATE spots SET region = 'Oarsoaldea'   WHERE id = '11111111-1111-4111-8111-111111111203';
UPDATE spots SET region = 'Goierri'      WHERE id = '11111111-1111-4111-8111-111111111204';
UPDATE spots SET region = 'Baionako Lurraldea' WHERE id = '11111111-1111-4111-8111-111111111205';

-- ============================================================
-- 2. Seed 4 new Basque spots (dollar-quoted translations)
-- ============================================================
INSERT INTO spots (id, name, country, country_code, region, category, latitude, longitude, elevation_m, protected_zone, euskal_herria, bayesian_rating, ratings_count, verified, description, translations)
VALUES
(
  '11111111-1111-4111-8111-111111111301',
  'Zumaia',
  'Spain', 'ES',
  'Urola Kosta',
  'nature',
  43.2974, -2.2583,
  10, true,
  'Gipuzkoa',
  4.6, 18, true,
  'Flysch cliffs on the Basque coast with dramatic alternating layers of sedimentary rock along Itzurun beach.',
  $JSON${"eu":"Flysch itsaslabarrak, sedimentu geruza ikusgarriak Itzurun hondartzan.","es":"Acantilados de flysch con capas sedimentarias espectaculares en la playa de Itzurun.","en":"Flysch cliffs with dramatic sedimentary rock layers along Itzurun beach.","fr":"Falaises de flysch aux couches sédimentaires spectaculaires sur la plage d'Itzurun.","de":"Flysch-Klippen mit dramatischen Sedimentschichten am Itzurun-Strand.","it":"Scogliere di flysch con strati sedimentari spettacolari sulla spiaggia di Itzurun."}$JSON$
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO spots (id, name, country, country_code, region, category, latitude, longitude, elevation_m, protected_zone, euskal_herria, bayesian_rating, ratings_count, verified, description, translations)
VALUES
(
  '11111111-1111-4111-8111-111111111302',
  'Gorbeia',
  'Spain', 'ES',
  'Arratia',
  'nature',
  43.0667, -2.7667,
  1481, true,
  'Bizkaia',
  4.3, 12, true,
  'Gorbeia Natural Park, the highest peak in Bizkaia with sweeping views, beech forests and traditional shepherding.',
  $JSON${"eu":"Gorbeia natura parkea, Bizkaiko gorena, pagadiak eta artzaintza tradizionala.","es":"Parque natural de Gorbeia, el pico mas alto de Bizkaia con bosques de hayas y pastoreo tradicional.","en":"Gorbeia Natural Park, the highest peak in Bizkaia with beech forests and traditional shepherding.","fr":"Parc naturel de Gorbeia, le plus haut sommet de Biscaye avec hetrages et pastoralisme traditionnel.","de":"Naturpark Gorbeia, hochster Gipfel der Bizkaia mit Buchenwaldern und traditioneller Hirtenkultur.","it":"Parco naturale di Gorbeia, la cima piu alta della Biscaglia con faggete e pastorizia tradizionale."}$JSON$
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO spots (id, name, country, country_code, region, category, latitude, longitude, elevation_m, protected_zone, euskal_herria, bayesian_rating, ratings_count, verified, description, translations)
VALUES
(
  '11111111-1111-4111-8111-111111111303',
  'Bardenas Reales',
  'Spain', 'ES',
  'Erribera',
  'nature',
  42.1850, -1.4170,
  650, true,
  'Nafarroa',
  4.4, 22, true,
  'Semi-desert natural park with eroded clay badlands, canyons and plateaus, a UNESCO Biosphere Reserve.',
  $JSON${"eu":"Basamortu erdiko natura parkea, higadura argilar batzak, arroilak eta goi-lautadak, UNESCOren erreserba.","es":"Parque natural semiarido con badlands arcillosos, canones y mesetas, reserva de la biosfera UNESCO.","en":"Semi-desert natural park with eroded clay badlands, canyons and plateaus, a UNESCO Biosphere Reserve.","fr":"Parc naturel semi-desertique avec badlands argileux, canyons et plateaux, reserve de biosphere UNESCO.","de":"Halbtrockenes Naturpark mit lehmigen Badlands, Schluchten und Hochebenen, UNESCO-Biospharenreservat.","it":"Parco naturale semidesertico con badlands argillosi, canyon e altipiani, riserva della biosfera UNESCO."}$JSON$
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO spots (id, name, country, country_code, region, category, latitude, longitude, elevation_m, protected_zone, euskal_herria, bayesian_rating, ratings_count, verified, description, translations)
VALUES
(
  '11111111-1111-4111-8111-111111111304',
  'Donibane Garazi',
  'France', 'FR',
  'Garazi',
  'village',
  43.2322, -1.1936,
  325, false,
  'Behe Nafarroa',
  4.2, 8, true,
  'Historic capital of Lower Navarre, a medieval walled town on the Camino de Santiago with cobbled streets.',
  $JSON${"eu":"Behe Nafarroako hiriburu historikoa, Donejakue bideko herri harresitua, harrizko kaleak.","es":"Capital historica de la Baja Navarra, villa medieval amurallada en el Camino de Santiago con calles empedradas.","en":"Historic capital of Lower Navarre, a medieval walled town on the Camino de Santiago with cobbled streets.","fr":"Capitale historique de la Basse-Navarre, ville medievale fortifiee sur le Camino de Santiago aux rues pavees.","de":"Historische Hauptstadt von Nieder-Navarra, mittelalterliche befestigte Stadt am Jakobsweg mit gepflasterten Gassen.","it":"Capitale storica della Bassa Navarra, borgo medievale fortificato sul Camino de Santiago con strade lastricate."}$JSON$
)
ON CONFLICT (id) DO NOTHING;
