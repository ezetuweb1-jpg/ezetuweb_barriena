/*
# Add Regional Spot Clusters for Map Explorer Testing

## Purpose
The Map Explorer now filters spots by the visible map area. To make panning
between regions visually meaningful, we add clusters of 4-6 spots in several
European regions that currently have sparse coverage.

## New Data (INSERT only — no schema changes)
Spots are inserted with fixed UUIDs (prefix 11111111-1111-4111-8111-1111111112xx
and 11111111-1111-4111-8111-1111111113xx) so re-running is idempotent via
ON CONFLICT DO NOTHING.

Regional clusters added:
1. Basque Country / Euskal Herria (5 spots) — Bizkaia, Gipuzkoa, Araba, Lapurdi, Nafarroa
2. Pyrenees (5 spots) — Ordesa, Aneto, Aigüestortes, Gavarnie, Somport
3. Alps / Dolomites (6 spots) — Tre Cime, Lago di Carezza, Val Gardena, Matterhorn, Zugspitze, Grossglockner
4. Tuscany (5 spots) — Val d'Orcia, San Gimignano, Montepulciano, Siena countryside, Crete Senesi
5. Southern Spain (5 spots) — Ronda, Granada/Alhambra, Cabo de Gata, Cazorla, Grazalema

## Security
No new tables. RLS already enabled on spots with public read/insert/update policies.
All inserts respect existing constraints.
*/

INSERT INTO spots (id, name, country, country_code, region, category, latitude, longitude, elevation_m, protected_zone, euskal_herria, bayesian_rating, ratings_count, verified, description) VALUES
-- ===== Basque Country / Euskal Herria cluster =====
('11111111-1111-4111-8111-111111111201','Getaria','Spain','ES','Gipuzkoa','village',43.3038,-2.2039,0,false,'Gipuzkoa',4.6,38,true,'Coastal fishing village famous for txakoli vineyards and the Balenciaga museum.'),
('11111111-1111-4111-8111-111111111202','Oñati','Spain','ES','Gipuzkoa','village',43.0324,-2.4144,234,false,'Gipuzkoa',4.5,25,true,'Historic university town nestled in green valleys with Renaissance architecture.'),
('11111111-1111-4111-8111-111111111203','Hondarribia','Spain','ES','Gipuzkoa','village',43.3689,-1.7956,0,false,'Gipuzkoa',4.7,42,true,'Charming walled coastal town with a colorful old quarter and mount Jaizkibel.'),
('11111111-1111-4111-8111-111111111204','Aralar Range','Spain','ES','Gipuzkoa/Nafarroa','nature',43.0333,-2.0333,1361,true,'Gipuzkoa',4.5,19,true,'Limestone massif with sweeping ridge views, wild horses and Neolithic dolmens.'),
('11111111-1111-4111-8111-111111111205','Biarritz','France','FR','Lapurdi','city',43.4832,-1.5586,0,false,'Lapurdi',4.4,31,true,'Elegant Basque surf town with dramatic cliffs and grand imperial architecture.'),

-- ===== Pyrenees cluster =====
('11111111-1111-4111-8111-111111111206','Ordesa Valley','Spain','ES','Aragón','nature',42.6292,-0.0489,1300,true,null,4.8,55,true,'Glacial valley with dramatic limestone cliffs, waterfalls and alpine meadows.'),
('11111111-1111-4111-8111-111111111207','Aneto Peak','Spain','ES','Aragón','nature',42.6336,0.6572,3404,true,null,4.6,28,true,'Highest summit in the Pyrenees with the iconic Maladeta glacier.'),
('11111111-1111-4111-8111-111111111208','Aigüestortes i Estany de Sant Maurici','Spain','ES','Catalonia','nature',42.5722,0.9972,1900,true,null,4.7,34,true,'National park of crystalline lakes, pine forests and winding mountain streams.'),
('11111111-1111-4111-8111-111111111209','Cirque de Gavarnie','France','FR','Hautes-Pyrénées','nature',42.6997,0.0067,1600,true,null,4.8,41,true,'Majestic glacial cirque with the 422m Grande Cascade waterfall.'),
('11111111-1111-4111-8111-111111111210','Somport Pass','Spain','ES','Aragón','nature',42.7867,-0.5189,1640,false,null,4.2,12,true,'Historic Pyrenean mountain pass on the Camino de Santiago route.'),

-- ===== Alps / Dolomites cluster =====
('11111111-1111-4111-8111-111111111211','Tre Cime di Lavaredo','Italy','IT','Dolomiti','nature',46.6181,12.3094,2999,true,null,4.9,62,true,'Iconic three-peak dolomite formation, a UNESCO World Heritage landmark.'),
('11111111-1111-4111-8111-111111111212','Lago di Carezza','Italy','IT','Dolomiti','nature',46.4107,11.7447,1534,false,null,4.7,35,true,'Alpine lake with emerald waters reflecting the Latemar massif.'),
('11111111-1111-4111-8111-111111111213','Val Gardena','Italy','IT','Dolomiti','village',46.5558,11.8628,1560,false,null,4.6,29,true,'Ladin valley with alpine meadows, wooden chalets and dramatic peaks.'),
('11111111-1111-4111-8111-111111111214','Matterhorn','Switzerland','CH','Valais','nature',45.9763,7.6586,4478,true,null,4.9,58,true,'Iconic pyramid-shaped peak on the Swiss-Italian border.'),
('11111111-1111-4111-8111-111111111215','Zugspitze','Germany','DE','Bavaria','nature',47.4210,10.9855,2962,true,null,4.5,22,true,'Germany highest peak with panoramic views of 400 alpine summits.'),
('11111111-1111-4111-8111-111111111216','Grossglockner','Austria','AT','Tyrol','nature',47.0745,12.6946,3798,true,null,4.6,26,true,'Austria highest mountain with the Pasterze glacier on its eastern slope.'),

-- ===== Tuscany cluster =====
('11111111-1111-4111-8111-111111111217','Val d Orcia','Italy','IT','Tuscany','nature',43.0707,11.6158,407,true,null,4.8,48,true,'Rolling cypress hills and golden wheat fields, a UNESCO World Heritage landscape.'),
('11111111-1111-4111-8111-111111111218','San Gimignano','Italy','IT','Tuscany','village',43.4676,11.0417,324,false,null,4.7,39,true,'Medieval hill town famous for its soaring stone towers and Vernaccia wine.'),
('11111111-1111-4111-8111-111111111219','Montepulciano','Italy','IT','Tuscany','village',43.2593,11.7083,605,false,null,4.6,27,true,'Renaissance hill town renowned for Vino Nobile and sweeping valley views.'),
('11111111-1111-4111-8111-111111111220','Crete Senesi','Italy','IT','Tuscany','nature',43.2411,11.6181,400,false,null,4.4,18,true,'Lunar clay hills south of Siena with isolated cypress trees and farmhouses.'),
('11111111-1111-4111-8111-111111111221','Siena Countryside','Italy','IT','Tuscany','village',43.3188,11.3259,320,false,null,4.5,21,true,'Gentle hills dotted with olive groves and Romanesque abbey churches.'),

-- ===== Southern Spain cluster =====
('11111111-1111-4111-8111-111111111222','Ronda','Spain','ES','Andalucía','village',36.7421,-5.1664,723,false,null,4.7,44,true,'Dramatic clifftop town split by the 100m-deep El Tajo gorge.'),
('11111111-1111-4111-8111-111111111223','Alhambra de Granada','Spain','ES','Andalucía','city',37.1761,-3.5885,740,true,null,4.9,67,true,'Moorish palace and gardens on a hilltop, a UNESCO World Heritage site.'),
('11111111-1111-4111-8111-111111111224','Cabo de Gata','Spain','ES','Andalucía','nature',36.7336,-2.1858,0,true,null,4.6,30,true,'Volcanic coastal desert park with hidden coves and crystal-clear water.'),
('11111111-1111-4111-8111-111111111225','Sierra de Cazorla','Spain','ES','Andalucía','nature',37.9167,-2.9333,1600,true,null,4.5,20,true,'Spain largest protected area with pine forests and the Guadalquivir source.'),
('11111111-1111-4111-8111-111111111226','Grazalema','Spain','ES','Andalucía','village',36.7412,-5.3657,812,true,null,4.4,15,true,'Whitewashed village in the Sierra de Grazalema, the rainiest spot in Spain.')
ON CONFLICT (id) DO NOTHING;
