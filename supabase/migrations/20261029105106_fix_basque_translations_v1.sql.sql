/*
# Fix Basque ('eu') translations across Euskal Herria spots

## What changed
1. Gaztelugatxe had its Basque translation stored under the wrong key 'eus'
   instead of 'eu' (the code used by LANG_KEY.EUS). The Hero fell back to
   Spanish for Basque users. This migration renames 'eus' -> 'eu' and
   upgrades the text to a richer, authentic Basque description.
2. Upgrades the Basque ('eu') description text for every spot with
   `euskal_herria IS NOT NULL` to ensure high-quality, native Basque
   with zero Spanish fallback.

## Notes
- No schema changes, no new tables, no RLS changes.
- Only the `translations` JSONB column is updated per-row.
- All updates use `jsonb_set` to surgically replace the 'eu' key.
*/

-- Gaztelugatxe: rename 'eus' -> 'eu' and upgrade text
UPDATE spots
SET translations = jsonb_set(
  translations - 'eus',
  '{eu}',
  '"Euskal kostaldeko harkaitz-uharteko baseliza ezaguna, 241 mailako zubi bihurgunetsu baten bidez lotua. Bizkaiko parajerik ikusgarrienetako bat."'::jsonb
)
WHERE id = '11111111-1111-4111-8111-111111111101';

-- Donostia
UPDATE spots
SET translations = jsonb_set(translations, '{eu}',
  '"Euskal itsasaldeko hiri dotorea, La Concha badiarengatik eta pintxo gastronomiarengatik ezaguna. Haizearen Orrazia eskultura eta Parte Zaharra nabarmentzen dira."'::jsonb)
WHERE id = '11111111-1111-4111-8111-111111111305';

-- Getaria
UPDATE spots
SET translations = jsonb_set(translations, '{eu}',
  '"Gipuzkoako arrantza-herri itsatsia, txakoli mahastien eta Balenciaga jaioterriaren egoitza. Kostaldeko ibilbide panoramikoak eta arrain freskoaren sukaldaritza."'::jsonb)
WHERE id = '11111111-1111-4111-8111-111111111201';

-- Hondarribia
UPDATE spots
SET translations = jsonb_set(translations, '{eu}',
  '"Gipuzkoako mugaldeko herri harresitua, alde zahar margosiarekin eta Jaizkibel mendiarekin. Frantzia-Espainia mugako arrantza-portu tradizionala."'::jsonb)
WHERE id = '11111111-1111-4111-8111-111111111203';

-- Oñati
UPDATE spots
SET translations = jsonb_set(translations, '{eu}',
  '"Debagoienako haran berdeko herri historikoa, Pizkundeko Unibertsitate Santua duena. Arantzazuko santutegia eta Garibai jauregia nabarmenak."'::jsonb)
WHERE id = '11111111-1111-4111-8111-111111111202';

-- Zumaia
UPDATE spots
SET translations = jsonb_set(translations, '{eu}',
  '"Gipuzkoako Itsaslaldeko flysch itsaslabarrak, 50 milioi urteko historia geologikoa erakusten dutenak Itzurun hondartzan. Algorri Interpretazio Zentroa."'::jsonb)
WHERE id = '11111111-1111-4111-8111-111111111301';

-- Aralar Range
UPDATE spots
SET translations = jsonb_set(translations, '{eu}',
  '"Gipuzkoako kareharrizko mendigune karstikoa, bizkar ikusgarriak, zaldi basatiak eta trikuharri neolitikoak dituena. Aketegi gailurra 1.551 m."'::jsonb)
WHERE id = '11111111-1111-4111-8111-111111111204';

-- Gorbeia
UPDATE spots
SET translations = jsonb_set(translations, '{eu}',
  '"Bizkaia eta Arabaren arteko mendi garaiena (1.482 m), pagadiak eta artzaintza tradizionala dituena. Gailurreko gurutzea ikur nabarmena."'::jsonb)
WHERE id = '11111111-1111-4111-8111-111111111302';

-- Biarritz
UPDATE spots
SET translations = jsonb_set(translations, '{eu}',
  '"Lapurdiko itsasaldeko surf-hiri dotorea, itsaslabar dramatikoekin eta arkitektura inperialarekin. Euskal Herriko surf kulturgune nagusia."'::jsonb)
WHERE id = '11111111-1111-4111-8111-111111111205';

-- Donibane Garazi
UPDATE spots
SET translations = jsonb_set(translations, '{eu}',
  '"Behe Nafarroako hiriburu historikoa, Donejakue bideko herri harresitu Erdi Arookoa, harrizko kale estu eta maldatsuekin."'::jsonb)
WHERE id = '11111111-1111-4111-8111-111111111304';

-- Bardenas Reales
UPDATE spots
SET translations = jsonb_set(translations, '{eu}',
  '"Nafarroako erdi-basamortu natur parkea, higadura-argil badlands, arroila eta goi-lautadak dituena. UNESCOren biosfera erreserba."'::jsonb)
WHERE id = '11111111-1111-4111-8111-111111111303';
