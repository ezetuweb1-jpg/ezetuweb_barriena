/*
# Update Gaztelugatxe Hero Translations

## Purpose
The Hero Banner on the Gallery view features Gaztelugatxe as the "Photo of the Day".
This migration updates its translations to use the exact approved copy for the hero
description across all 6 languages.

## Changes
- UPDATE spots.translations for Gaztelugatxe (id ...111101)
- Only the eu/es/en/fr fields change to the approved hero copy; de/it remain.

## Security
No schema or policy changes.
*/

UPDATE spots SET translations = $JSON${"eu":"Euskal kostaldeko harkaitz-uharteko baseliza, 241 mailako zubi bihurgunetsu baten bidez lotua.","es":"Ermita sobre un islote rocoso en la costa vasca, accesible por un serpenteante puente de 241 escalones.","en":"Hermitage on a rocky islet off the Basque coast, reached by a winding 241-step bridge.","fr":"Ermitage sur un îlot rocheux de la côte basque, accessible par un pont sinueux de 241 marches.","de":"Kapelle auf einer Felseninsel vor der baskischen Küste, erreichbar über eine gewundene Brücke mit 241 Stufen.","it":"Eremo su un'isoletta rocciosa al largo della costa basca, raggiungibile tramite un ponte serpeggiante di 241 gradini."}$JSON$
WHERE id = '11111111-1111-4111-8111-111111111101';
