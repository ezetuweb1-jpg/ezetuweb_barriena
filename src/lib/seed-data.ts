import type { Spot, Photo, Season, Category, Translations } from './types';

/**
 * Frontend fallback seed data. Used when Supabase env vars aren't available
 * at runtime (e.g. dev server didn't pick up .env). Mirrors the DB seed.
 */

function spot(
  id: string, name: string, country: string, cc: string, region: string | null,
  cat: Category, lat: number, lng: number, elev: number | null,
  protected_zone: boolean, euskal: string | null, rating: number, count: number,
  desc: string, translations: Translations, iconic: string[] | null,
): Spot {
  return {
    id, name, country, country_code: cc, region, category: cat,
    latitude: lat, longitude: lng, elevation_m: elev, protected_zone,
    euskal_herria: euskal, province: euskal ?? region, provinces: [euskal ?? region].filter((p): p is string => !!p),
    comarca: euskal ? region : null,
    bayesian_rating: rating, ratings_count: count,
    verified: true, description: desc, translations, iconic_spots: iconic,
  };
}

function photo(
  id: string, spotId: string, url: string, w: number, h: number,
  author: string, season: Season, likes: number, trend: number, isHero = false,
  exif?: { camera_model: string; lens: string; aperture: string; shutter_speed: string; iso: number },
): Photo {
  return {
    id, spot_id: spotId, image_url: url, width: w, height: h,
    author, device_id: null, season, likes, trend_score: trend,
    is_hero: isHero, created_at: '2026-01-01T00:00:00Z',
    camera_model: exif?.camera_model ?? null,
    lens: exif?.lens ?? null,
    aperture: exif?.aperture ?? null,
    shutter_speed: exif?.shutter_speed ?? null,
    iso: exif?.iso ?? null,
  };
}

const SEED_SPOT_LIST: Spot[] = [
  spot('11111111-1111-4111-8111-111111111101', 'Gaztelugatxe', 'Spain', 'ES', 'Bizkaia', 'nature', 43.4466, -2.3089, 150, true, 'Bizkaia', 4.8, 12,
    'Hermitage on a rocky islet connected by a narrow stone bridge along the Basque coast.',
    { es: 'Ermita sobre un islote rocoso conectado por un estrecho puente de piedra en la costa vasca.', en: 'Hermitage on a rocky islet connected by a narrow stone bridge along the Basque coast.', eu: 'Euskal kostaldeko harkaitz-uharteko baseliza ezaguna, 241 mailako zubi bihurgunetsu baten bidez lotua. Bizkaiko parajerik ikusgarrienetako bat.' },
    ['San Juan de Gaztelugatxe', 'Puente de piedra', 'Costa de Bizkaia']),
  spot('11111111-1111-4111-8111-111111111102', 'Lago di Braies', 'Italy', 'IT', 'Bolzano', 'nature', 46.6933, 12.0944, 1469, false, null, 4.8, 10,
    'Emerald alpine lake in the Dolomites surrounded by towering peaks.',
    { es: 'Lago alpino esmeralda en los Dolomitas rodeado de picos imponentes.', en: 'Emerald alpine lake in the Dolomites surrounded by towering peaks.', eu: 'Dolomitetako laku alpino esmeralda, gailur ikusgarriez inguratua.' },
    ['Lago di Braies', 'Dolomiti', 'Pragser Wildsee']),
  spot('11111111-1111-4111-8111-111111111103', 'Mont Saint-Michel', 'France', 'FR', 'Normandie', 'village', 48.6361, -1.5114, 80, true, null, 4.8, 11,
    'Medieval abbey on a tidal island off the Normandy coast.',
    { es: 'Abadía medieval en una isla de mareas frente a la costa de Normandía.', en: 'Medieval abbey on a tidal island off the Normandy coast.', eu: 'Normandiako kostatik kanpo dagoen marearteko uharte bateko abadia Erdi Arokoa.' },
    ['Abbaye du Mont Saint-Michel', 'Tidal causeway', 'Normandy']),
  spot('11111111-1111-4111-8111-111111111104', 'Neuschwanstein', 'Germany', 'DE', 'Bayern', 'village', 47.5575, 10.7497, 800, false, null, 4.7, 9,
    'Fairytale castle perched on a rugged hill above Hohenschwangau village in Bavaria.',
    { es: 'Castillo de cuento de hadas sobre una colina escarpada en Baviera.', en: 'Fairytale castle perched on a rugged hill above Hohenschwangau village in Bavaria.', eu: 'Ipuinetako gaztelu bat Bavariako muino harritsu batean.' },
    ['Schloss Neuschwanstein', 'Hohenschwangau', 'Bavaria Alps']),
  spot('11111111-1111-4111-8111-111111111105', 'Lauterbrunnen', 'Switzerland', 'CH', 'Bernese Oberland', 'nature', 46.5939, 7.9089, 802, false, null, 4.7, 8,
    'Valley of 72 waterfalls with sheer cliff walls in the Swiss Alps.',
    { es: 'Valle de 72 cascadas con paredes verticales en los Alpes suizos.', en: 'Valley of 72 waterfalls with sheer cliff walls in the Swiss Alps.', eu: '72 ur-jauziko harana, labar bertikalekin Alpe suitzarretan.' },
    ['Staubbach Falls', 'Trümmelbach Falls', 'Lauterbrunnen Valley']),
  spot('11111111-1111-4111-8111-111111111106', 'Torres del Paine', 'Chile', 'CL', 'Patagonia', 'nature', -51.0, -73.0833, 2500, true, null, 4.9, 14,
    'Dramatic granite peaks rising from the Patagonian steppe in Chilean Patagonia.',
    { es: 'Picos de granito dramáticos que se elevan desde la estepa patagónica.', en: 'Dramatic granite peaks rising from the Patagonian steppe in Chilean Patagonia.', eu: 'Granitoko gailur dramatikoak Patagoniako ordokietatik altxatzen direnak.' },
    ['Cuernos del Paine', 'Lago Grey', 'Torres del Paine']),
  spot('11111111-1111-4111-8111-111111111107', 'Kyoto', 'Japan', 'JP', 'Kansai', 'city', 35.0116, 135.7681, 200, false, null, 4.8, 15,
    'Ancient capital of Japan famed for temples, bamboo groves, and autumn foliage.',
    { es: 'Antigua capital de Japón famosa por templos, bosques de bambú y follaje otoñal.', en: 'Ancient capital of Japan famed for temples, bamboo groves, and autumn foliage.', eu: 'Japoniako antzinako hiriburua, tenplu, banbu eta udazkeneko hostoeengatik ezaguna.' },
    ['Fushimi Inari', 'Kinkaku-ji', 'Arashiyama Bamboo Grove']),
  spot('11111111-1111-4111-8111-111111111108', 'Albarracín', 'Spain', 'ES', 'Teruel', 'village', 40.4083, -1.4444, 1162, false, null, 4.7, 10,
    'Pink-walled medieval village perched on a cliff above the Guadalquivir river.',
    { es: 'Pueblo medieval de muros rosados sobre un acantilado junto al río Guadalquivir.', en: 'Pink-walled medieval village perched on a cliff above the Guadalquivir river.', eu: 'Horma arroxekako herri Erdi Arokoa, amildegi baten gainean.' },
    ['Murallas de Albarracín', 'Calle del Azabal', 'Iglesia de Santa María']),
  spot('11111111-1111-4111-8111-111111111211', 'Tre Cime di Lavaredo', 'Italy', 'IT', 'Dolomiti', 'nature', 46.6181, 12.3094, 2999, false, null, 4.9, 13,
    'Three iconic peaks of the Dolomites, a UNESCO World Heritage site.',
    { es: 'Tres picos icónicos de los Dolomitas, Patrimonio de la Humanidad UNESCO.', en: 'Three iconic peaks of the Dolomites, a UNESCO World Heritage site.', eu: 'Dolomitetako hiru gailur ikonikoak, UNESCOren ondarea.' }, null),
  spot('11111111-1111-4111-8111-111111111223', 'Granada', 'Spain', 'ES', 'Granada', 'city', 37.1773, -3.5986, 738, false, null, 4.9, 14,
    'Moorish palace city at the foot of the Sierra Nevada mountains.',
    { es: 'Ciudad palaciega mora al pie de Sierra Nevada.', en: 'Moorish palace city at the foot of the Sierra Nevada mountains.', eu: 'Sierra Nevadaren oinean dagoen hiri palazio moroa.' },
    ['Alhambra', 'Albaicín', 'Generalife']),
  spot('11111111-1111-4111-8111-111111111214', 'Matterhorn', 'Switzerland', 'CH', 'Valais', 'nature', 45.9765, 7.6586, 4478, false, null, 4.9, 13,
    'Iconic pyramid peak of the Alps on the Swiss-Italian border.',
    { es: 'Pico piramidal icónico de los Alpes en la frontera suizo-italiana.', en: 'Iconic pyramid peak of the Alps on the Swiss-Italian border.', eu: 'Alpeetako gailur piramidal ikonikoa Suitza eta Italiaren arteko mugan.' }, null),
  spot('11111111-1111-4111-8111-111111111209', 'Cirque de Gavarnie', 'France', 'FR', 'Hautes-Pyrénées', 'nature', 42.7033, 0.0094, 3248, true, null, 4.8, 10,
    'Massive glacial cirque in the Pyrenees with Europe\'s tallest waterfall.',
    { es: 'Circo glacial enorme en los Pirineos con la cascada más alta de Europa.', en: 'Massive glacial cirque in the Pyrenees with Europe\'s tallest waterfall.', eu: 'Pirinioetako zirkuito glazial handia, Europako ur-jauzirik altuenarekin.' }, null),
  spot('11111111-1111-4111-8111-111111111217', 'Val d Orcia', 'Italy', 'IT', 'Siena', 'nature', 43.07, 11.6, 407, false, null, 4.8, 11,
    'Rolling Tuscan hills with cypress-lined roads and medieval hilltop towns.',
    { es: 'Colinas toscanas ondulantes con carreteras bordeadas de cipreses.', en: 'Rolling Tuscan hills with cypress-lined roads and medieval hilltop towns.', eu: 'Toskanako muino lasaiak, ziprez-ihintzdun bideekin.' }, null),
  spot('11111111-1111-4111-8111-111111111206', 'Ordesa Valley', 'Spain', 'ES', 'Huesca', 'nature', 42.6486, 0.0317, 2500, true, null, 4.8, 11,
    'Glacial valley in the Pyrenees with dramatic cliffs and waterfalls.',
    { es: 'Valle glaciar en los Pirineos con acantilados dramáticos y cascadas.', en: 'Glacial valley in the Pyrenees with dramatic cliffs and waterfalls.', eu: 'Pirinioetako haran glaziala, labar ikusgarri eta ur-jauziekin.' }, null),
  spot('11111111-1111-4111-8111-111111111203', 'Hondarribia', 'Spain', 'ES', 'Gipuzkoa', 'village', 43.3684, -1.7964, 10, false, 'Gipuzkoa', 4.7, 9,
    'Colorful Basque fishing village on the French-Spanish border.',
    { es: 'Pueblo pesquero vasco colorido en la frontera franco-española.', en: 'Colorful Basque fishing village on the French-Spanish border.', eu: 'Gipuzkoako mugaldeko herri harresitua, alde zahar margosiarekin eta Jaizkibel mendiarekin. Frantzia-Espainia mugako arrantza-portu tradizionala.' }, null),
  spot('11111111-1111-4111-8111-111111111218', 'San Gimignano', 'Italy', 'IT', 'Siena', 'village', 43.4677, 11.0428, 324, false, null, 4.7, 10,
    'Medieval Manhattan of Tuscany with its iconic stone towers.',
    { es: 'Manhattan medieval de la Toscana con sus icónicas torres de piedra.', en: 'Medieval Manhattan of Tuscany with its iconic stone towers.', eu: 'Toskanako Manhattan Erdi Arokoa, harrizko dorre ikonikoekin.' }, null),
  spot('11111111-1111-4111-8111-111111111208', 'Aigüestortes i Estany de Sant Maurici', 'Spain', 'ES', 'Lleida', 'nature', 42.5722, 0.9956, 1900, true, null, 4.7, 9,
    'Catalan Pyrenees national park with turquoise mountain lakes.',
    { es: 'Parque nacional pirenaico con lagos de montaña turquesa.', en: 'Catalan Pyrenees national park with turquoise mountain lakes.', eu: 'Pirinioetako parke nazionala aintzira turkesekin.' }, null),
  spot('11111111-1111-4111-8111-111111111222', 'Ronda', 'Spain', 'ES', 'Málaga', 'village', 36.7421, -5.1664, 723, false, null, 4.7, 11,
    'Dramatic clifftop town split by the El Tajo gorge in Andalusia.',
    { es: 'Pueblo dramático sobre un acantilado dividido por el desfiladero El Tajo.', en: 'Dramatic clifftop town split by the El Tajo gorge in Andalusia.', eu: 'Andaluziako herri dramatikoa, El Tajo arroilak zatitua.' }, null),
  spot('11111111-1111-4111-8111-111111111212', 'Lago di Carezza', 'Italy', 'IT', 'Dolomiti', 'nature', 46.4167, 11.75, 1534, false, null, 4.7, 9,
    'Rainbow lake in the Dolomites with reflections of the Latemar massif.',
    { es: 'Lago arcoíris en los Dolomitas con reflejos del macizo Latemar.', en: 'Rainbow lake in the Dolomites with reflections of the Latemar massif.', eu: 'Dolomitetako ortziral lakuaren isla Latemar masiboaren isla.' }, null),
  spot('11111111-1111-4111-8111-111111111201', 'Getaria', 'Spain', 'ES', 'Gipuzkoa', 'village', 43.3039, -2.2039, 10, false, 'Gipuzkoa', 4.6, 8,
    'Basque coastal village famous for txakoli wine and Balenciaga\'s birthplace.',
    { es: 'Pueblo costero vasco famoso por el txakoli y cuna de Balenciaga.', en: 'Basque coastal village famous for txakoli wine and Balenciaga\'s birthplace.', eu: 'Gipuzkoako arrantza-herri itsatsia, txakoli mahastien eta Balenciaga jaioterriaren egoitza. Kostaldeko ibilbide panoramikoak eta arrain freskoaren sukaldaritza.' }, null),
  spot('11111111-1111-4111-8111-111111111207', 'Aneto Peak', 'Spain', 'ES', 'Huesca', 'nature', 42.6319, 0.6567, 3404, false, null, 4.6, 8,
    'Highest peak in the Pyrenees at 3,404 m in the Maladeta massif.',
    { es: 'El pico más alto de los Pirineos a 3.404 m en el macizo de la Maladeta.', en: 'Highest peak in the Pyrenees at 3,404 m in the Maladeta massif.', eu: 'Pirinioetako gailur garaiena, 3.404 m Maladeta maseiboan.' }, null),
  spot('11111111-1111-4111-8111-111111111213', 'Val Gardena', 'Italy', 'IT', 'Dolomiti', 'village', 46.5547, 11.7833, 1560, false, null, 4.6, 8,
    'Ladin alpine valley in the Dolomites surrounded by jagged peaks.',
    { es: 'Valle alpino ladino en los Dolomitas rodeado de picos dentados.', en: 'Ladin alpine valley in the Dolomites surrounded by jagged peaks.', eu: 'Dolomitetako haran alpino ladinoa, gailur zorrotzez inguratua.' }, null),
  spot('11111111-1111-4111-8111-111111111216', 'Grossglockner', 'Austria', 'AT', 'Tyrol', 'nature', 47.0742, 12.6944, 3798, false, null, 4.6, 8,
    'Austria\'s highest peak at 3,798 m with a famous alpine road.',
    { es: 'El pico más alto de Austria a 3.798 m con una famosa carretera alpina.', en: 'Austria\'s highest peak at 3,798 m with a famous alpine road.', eu: 'Austriako gailur garaiena, 3.798 m, alpeetako bide ezagunarekin.' }, null),
  spot('11111111-1111-4111-8111-111111111219', 'Montepulciano', 'Italy', 'IT', 'Siena', 'village', 43.0914, 11.6272, 605, false, null, 4.6, 8,
    'Renaissance hill town in Tuscany famed for Vino Nobile wine.',
    { es: 'Pueblo renacentista en la Toscana famoso por el Vino Nobile.', en: 'Renaissance hill town in Tuscany famed for Vino Nobile wine.', eu: 'Toskanako herri pizkundetarra, Vino Nobile ardoagatik ezaguna.' }, null),
  spot('11111111-1111-4111-8111-111111111224', 'Cabo de Gata', 'Spain', 'ES', 'Almería', 'nature', 36.7333, -2.1833, 100, true, null, 4.6, 8,
    'Volcanic coastal desert in Almería with hidden coves and crystal water.',
    { es: 'Desierto costero volcánico en Almería con calas ocultas y aguas cristalinas.', en: 'Volcanic coastal desert in Almería with hidden coves and crystal water.', eu: 'Almeriako basamortu kostaldea bolkanikoa, kalak ezkutuekin.' }, null),
  spot('11111111-1111-4111-8111-111111111301', 'Zumaia', 'Spain', 'ES', 'Gipuzkoa', 'nature', 43.2969, -2.2622, 10, false, 'Gipuzkoa', 4.6, 9,
    'Dramatic flysch cliffs on the Basque coast revealing 50 million years of geology.',
    { es: 'Acantilados de flysch dramáticos en la costa vasca revelando 50 millones de años.', en: 'Dramatic flysch cliffs on the Basque coast revealing 50 million years of geology.', eu: 'Gipuzkoako Itsaslaldeko flysch itsaslabarrak, 50 milioi urteko historia geologikoa erakusten dutenak Itzurun hondartzan. Algorri Interpretazio Zentroa.' }, null),
  spot('11111111-1111-4111-8111-111111111305', 'Donostia', 'Spain', 'ES', 'Donostialdea', 'city', 43.3183, -1.9806, 6, false, 'Gipuzkoa', 4.5, 10,
    'Elegant Basque seaside city famous for La Concha bay and pintxos culture.',
    { es: 'Elegante ciudad costera vasca famosa por la bahía de La Concha y los pintxos.', en: 'Elegant Basque seaside city famous for La Concha bay and pintxos culture.', eu: 'Euskal itsasaldeko hiri dotorea, La Concha badiarengatik eta pintxo gastronomiarengatik ezaguna. Haizearen Orrazia eskultura eta Parte Zaharra nabarmentzen dira.' },
    ['La Concha', 'Parte Zaharra', 'Monte Igueldo']),
  spot('11111111-1111-4111-8111-111111111202', 'Oñati', 'Spain', 'ES', 'Debagoiena', 'village', 43.0324, -2.4144, 234, false, 'Gipuzkoa', 4.5, 7,
    'Green valley village in the Basque highlands with a Renaissance university.',
    { es: 'Pueblo de valle verde en el interior vasco con universidad renacentista.', en: 'Green valley village in the Basque highlands with a Renaissance university.', eu: 'Debagoienako haran berdeko herri historikoa, Pizkundeko Unibertsitate Santua duena. Arantzazuko santutegia eta Garibai jauregia nabarmenak.' }, null),
  spot('11111111-1111-4111-8111-111111111225', 'Sierra de Cazorla', 'Spain', 'ES', 'Jaén', 'nature', 37.9167, -2.9333, 1200, true, null, 4.5, 8,
    'Spain\'s largest protected area with pine forests, waterfalls and rivers.',
    { es: 'La mayor zona protegida de España con bosques de pino, cascadas y ríos.', en: 'Spain\'s largest protected area with pine forests, waterfalls and rivers.', eu: 'Espainiako babes-gunerik handiena, pinudi, ur-jauzi eta ibaiekin.' }, null),
  spot('11111111-1111-4111-8111-111111111215', 'Zugspitze', 'Germany', 'DE', 'Bavaria', 'nature', 47.4210, 10.9851, 2962, false, null, 4.5, 8,
    'Germany\'s highest mountain at 2,962 m with panoramic Alps views.',
    { es: 'La montaña más alta de Alemania a 2.962 m con vistas panorámicas de los Alpes.', en: 'Germany\'s highest mountain at 2,962 m with panoramic Alps views.', eu: 'Alemaniako mendirik altuena, 2.962 m, Alpeen ikuspegi panoramikoekin.' }, null),
  spot('11111111-1111-4111-8111-111111111221', 'Siena Countryside', 'Italy', 'IT', 'Siena', 'village', 43.3188, 11.3308, 322, false, null, 4.5, 7,
    'Clay hills and cypress avenues around medieval Siena.',
    { es: 'Colinas de arcilla y avenidas de cipreses alrededor de la Siena medieval.', en: 'Clay hills and cypress avenues around medieval Siena.', eu: 'Buztin-muinoak eta ipuru-etorbideak Siena Erdi Arokoaren inguruan.' }, null),
  spot('11111111-1111-4111-8111-111111111204', 'Aralar Range', 'Spain', 'ES', 'Goierri', 'nature', 43.0, -2.0, 1400, false, 'Gipuzkoa', 4.5, 7,
    'Limestone karst mountains in the Basque Country with wild horses.',
    { es: 'Montañas kársticas de caliza en el País Vasco con caballos salvajes.', en: 'Limestone karst mountains in the Basque Country with wild horses.', eu: 'Gipuzkoako kareharrizko mendigune karstikoa, bizkar ikusgarriak, zaldi basatiak eta trikuharri neolitikoak dituena. Aketegi gailurra 1.551 m.' }, null),
  spot('11111111-1111-4111-8111-111111111220', 'Crete Senesi', 'Italy', 'IT', 'Siena', 'nature', 43.2, 11.6, 400, false, null, 4.4, 6,
    'Lunar badlands of grey clay hills in southern Tuscany.',
    { es: 'Badlands lunares de colinas de arcilla gris en el sur de la Toscana.', en: 'Lunar badlands of grey clay hills in southern Tuscany.', eu: 'Toskanako hegoaldeko buztin-grey muinoetako badlands lunarrak.' }, null),
  spot('11111111-1111-4111-8111-111111111226', 'Grazalema', 'Spain', 'ES', 'Cádiz', 'village', 36.7583, -5.3675, 830, true, null, 4.4, 7,
    'Whitewashed village in Spain\'s rainiest mountain range.',
    { es: 'Pueblo encalado en la sierra más lluviosa de España.', en: 'Whitewashed village in Spain\'s rainiest mountain range.', eu: 'Espainiako sierra euritsueneako herri zuria.' }, null),
  spot('11111111-1111-4111-8111-111111111205', 'Biarritz', 'France', 'FR', 'Lapurdi', 'city', 43.4833, -1.5583, 10, false, 'Lapurdi', 4.4, 7,
    'Elegant surf town on the Basque coast with imperial palaces.',
    { es: 'Elegante pueblo surfista en la costa vasca con palacios imperiales.', en: 'Elegant surf town on the Basque coast with imperial palaces.', eu: 'Lapurdiko itsasaldeko surf-hiri dotorea, itsaslabar dramatikoekin eta arkitektura inperialarekin. Euskal Herriko surf kulturgune nagusia.' }, null),
  spot('11111111-1111-4111-8111-111111111303', 'Bardenas Reales', 'Spain', 'ES', 'Erribera', 'nature', 42.1833, -1.4167, 400, true, 'Nafarroa', 4.4, 8,
    'Moonlike semi-desert in Navarra with sculpted clay badlands.',
    { es: 'Semidesierto lunar en Navarra con badlands de arcilla esculpida.', en: 'Moonlike semi-desert in Navarra with sculpted clay badlands.', eu: 'Nafarroako erdi-basamortu natur parkea, higadura-argil badlands, arroila eta goi-lautadak dituena. UNESCOren biosfera erreserba.' }, null),
  spot('11111111-1111-4111-8111-111111111302', 'Cruz del Gorbeia / Gorbeiako Gurutzea', 'España', 'ES', 'Arratia', 'nature', 43.0, -2.8, 1482, false, 'Bizkaia', 4.3, 6,
    'Basque summit between two provinces with cross at the top.',
    { es: 'Cumbre vasca entre dos provincias con cruz en la cima.', en: 'Basque summit between two provinces with cross at the top.', eu: 'Bizkaia eta Arabaren arteko mendi garaiena (1.482 m), pagadiak eta artzaintza tradizionala dituena. Gailurreko gurutzea ikur nabarmena.' }, null),
  spot('11111111-1111-4111-8111-111111111304', 'Donibane Garazi', 'France', 'FR', 'Behe Nafarroa', 'village', 43.1644, -1.2381, 175, false, 'Behe Nafarroa', 4.2, 5,
    'Medieval Basque pilgrimage town on the Camino de Santiago.',
    { es: 'Pueblo medieval vasco peregrino en el Camino de Santiago.', en: 'Medieval Basque pilgrimage town on the Camino de Santiago.', eu: 'Behe Nafarroako hiriburu historikoa, Donejakue bideko herri harresitu Erdi Arookoa, harrizko kale estu eta maldatsuekin.' }, null),
  spot('11111111-1111-4111-8111-111111111210', 'Somport Pass', 'Spain', 'ES', 'Huesca', 'nature', 42.7917, -0.5167, 1640, false, null, 4.2, 5,
    'Historic Pyrenees mountain pass connecting Aragon and France.',
    { es: 'Histórico puerto pirenaico que conecta Aragón y Francia.', en: 'Historic Pyrenees mountain pass connecting Aragon and France.', eu: 'Pirinioetako mendate historikoa Aragoi eta Frantzia lotzen.' }, null),
];

type SeedGeo = Pick<Spot, 'province' | 'provinces' | 'comarca'>;

const SEED_GEO_OVERRIDES: Record<string, SeedGeo> = {
  '11111111-1111-4111-8111-111111111101': { province: 'Bizkaia', provinces: ['Bizkaia'], comarca: 'Busturialdea' },
  '11111111-1111-4111-8111-111111111102': { province: 'Trentino-Alto Ádige', provinces: ['Trentino-Alto Ádige'], comarca: 'Dolomiti' },
  '11111111-1111-4111-8111-111111111211': { province: 'Belluno', provinces: ['Belluno', 'Bolzano'], comarca: 'Dolomiti' },
  '11111111-1111-4111-8111-111111111212': { province: 'Bolzano', provinces: ['Bolzano'], comarca: 'Dolomiti' },
  '11111111-1111-4111-8111-111111111213': { province: 'Bolzano', provinces: ['Bolzano'], comarca: 'Dolomiti' },
  '11111111-1111-4111-8111-111111111217': { province: 'Toscana', provinces: ['Toscana'], comarca: "Val d'Orcia" },
  '11111111-1111-4111-8111-111111111218': { province: 'Toscana', provinces: ['Toscana'], comarca: null },
  '11111111-1111-4111-8111-111111111219': { province: 'Toscana', provinces: ['Toscana'], comarca: null },
  '11111111-1111-4111-8111-111111111220': { province: 'Toscana', provinces: ['Toscana'], comarca: null },
  '11111111-1111-4111-8111-111111111221': { province: 'Toscana', provinces: ['Toscana'], comarca: null },
  '11111111-1111-4111-8111-111111111206': { province: 'Huesca', provinces: ['Huesca'], comarca: 'Pirinioak (Sobrarbe)' },
  '11111111-1111-4111-8111-111111111302': { province: 'Bizkaia', provinces: ['Bizkaia', 'Araba'], comarca: 'Arratia' },
  '11111111-1111-4111-8111-111111111108': { province: 'Teruel', provinces: ['Teruel'], comarca: null },
};

export const SEED_SPOTS: Spot[] = SEED_SPOT_LIST.map((s) => ({ ...s, ...SEED_GEO_OVERRIDES[s.id] }));


export const SEED_PHOTOS: Photo[] = [
  photo('s101', '11111111-1111-4111-8111-111111111101', 'https://images.pexels.com/photos/29809979/pexels-photo-29809979.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 5964, 3976, 'Mikel Etxebarria', 'summer', 3420, 98.5, true, { camera_model: 'Sony A7 IV', lens: 'FE 24-70mm f/2.8 GM', aperture: 'f/8.0', shutter_speed: '1/250s', iso: 100 }),
  photo('s101b', '11111111-1111-4111-8111-111111111101', 'https://images.pexels.com/photos/6648372/pexels-photo-6648372.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 6000, 4000, 'Enrique', 'spring', 2800, 88.3),
  photo('s102', '11111111-1111-4111-8111-111111111102', 'https://images.pexels.com/photos/40039366/pexels-photo-40039366.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 8064, 4536, 'Harsh Kukadiya', 'summer', 2890, 92.3, false, { camera_model: 'Canon EOS R5', lens: 'RF 15-35mm f/2.8L', aperture: 'f/11', shutter_speed: '1/125s', iso: 200 }),
  photo('s103', '11111111-1111-4111-8111-111111111103', 'https://images.pexels.com/photos/35257273/pexels-photo-35257273.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 6205, 4160, 'Diego HG', 'autumn', 2750, 89.1),
  photo('s104', '11111111-1111-4111-8111-111111111104', 'https://images.pexels.com/photos/11348493/pexels-photo-11348493.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 6480, 4320, 'Gildo Cancelli', 'autumn', 2600, 86.7),
  photo('s105', '11111111-1111-4111-8111-111111111105', 'https://images.pexels.com/photos/34242011/pexels-photo-34242011.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 4928, 3264, 'Adrian Limani', 'summer', 2400, 83.2),
  photo('s106', '11111111-1111-4111-8111-111111111106', 'https://images.pexels.com/photos/30359266/pexels-photo-30359266.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 5144, 2803, 'Marek Piwnicki', 'winter', 3100, 95.1, false, { camera_model: 'Nikon Z9', lens: 'Z 24-70mm f/2.8 S', aperture: 'f/9.0', shutter_speed: '1/200s', iso: 100 }),
  photo('s106b', '11111111-1111-4111-8111-111111111106', 'https://images.pexels.com/photos/7499998/pexels-photo-7499998.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 3780, 2623, 'Tom D\'Arby', 'autumn', 2700, 87.6),
  photo('s107', '11111111-1111-4111-8111-111111111107', 'https://images.pexels.com/photos/35323182/pexels-photo-35323182.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 6000, 4000, 'Emiliano Lara', 'autumn', 3200, 94.8, false, { camera_model: 'Fujifilm X-T5', lens: 'XF 16-55mm f/2.8 R', aperture: 'f/5.6', shutter_speed: '1/320s', iso: 400 }),
  photo('s107b', '11111111-1111-4111-8111-111111111107', 'https://images.pexels.com/photos/33229939/pexels-photo-33229939.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 5472, 3078, 'Lorenzo Castellino', 'autumn', 2900, 90.2),
  photo('s108', '11111111-1111-4111-8111-111111111108', 'https://images.pexels.com/photos/5205782/pexels-photo-5205782.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 5336, 3558, 'Manuel', 'summer', 1850, 78.5),
  photo('s211', '11111111-1111-4111-8111-111111111211', 'https://images.pexels.com/photos/32713329/pexels-photo-32713329.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 5184, 3888, 'Dirk Pothen', 'summer', 2900, 91.2),
  photo('s211b', '11111111-1111-4111-8111-111111111211', 'https://images.pexels.com/photos/3039336/pexels-photo-3039336.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 6322, 4215, 'Thomas Vitali', 'winter', 2500, 84.5),
  photo('s223', '11111111-1111-4111-8111-111111111223', 'https://images.pexels.com/photos/11829134/pexels-photo-11829134.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 6048, 4024, 'Zekai Zhu', 'spring', 3050, 93.5, false, { camera_model: 'Canon EOS R5', lens: 'RF 24-105mm f/4L', aperture: 'f/8.0', shutter_speed: '1/160s', iso: 200 }),
  photo('s214', '11111111-1111-4111-8111-111111111214', 'https://images.pexels.com/photos/29734968/pexels-photo-29734968.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 6000, 4000, 'Ilia Bronskiy', 'summer', 2800, 90.1),
  photo('s209', '11111111-1111-4111-8111-111111111209', 'https://images.pexels.com/photos/12020794/pexels-photo-12020794.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 4272, 2848, 'arnaud audoin', 'summer', 2200, 82.3),
  photo('s217', '11111111-1111-4111-8111-111111111217', 'https://images.pexels.com/photos/37666468/pexels-photo-37666468.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 9504, 5346, 'Phil Evenden', 'spring', 2400, 85.7),
  photo('s206', '11111111-1111-4111-8111-111111111206', 'https://images.pexels.com/photos/27729412/pexels-photo-27729412.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 6000, 4000, 'SilBaBum', 'summer', 2100, 80.5),
  photo('s203', '11111111-1111-4111-8111-111111111203', 'https://images.pexels.com/photos/14423261/pexels-photo-14423261.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 5184, 3456, 'Guerrero De la Luz', 'summer', 1700, 72.3),
  photo('s218', '11111111-1111-4111-8111-111111111218', 'https://images.pexels.com/photos/7717507/pexels-photo-7717507.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 3872, 2592, 'Siegfried Poepperl', 'summer', 2300, 84.1),
  photo('s208', '11111111-1111-4111-8111-111111111208', 'https://images.pexels.com/photos/13314730/pexels-photo-13314730.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 5620, 3819, 'Manu Edition', 'summer', 1900, 76.8),
  photo('s222', '11111111-1111-4111-8111-111111111222', 'https://images.pexels.com/photos/11829157/pexels-photo-11829157.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 6048, 4024, 'Zekai Zhu', 'autumn', 2500, 86.9),
  photo('s212', '11111111-1111-4111-8111-111111111212', 'https://images.pexels.com/photos/34797482/pexels-photo-34797482.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 5272, 2962, 'Ken Cheung', 'autumn', 2600, 87.5),
  photo('s201', '11111111-1111-4111-8111-111111111201', 'https://images.pexels.com/photos/13153777/pexels-photo-13153777.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 5568, 3712, 'Emilio Sánchez Hernández', 'summer', 1500, 68.2),
  photo('s207', '11111111-1111-4111-8111-111111111207', 'https://images.pexels.com/photos/14096999/pexels-photo-14096999.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 6016, 4000, 'Ye Baiq', 'winter', 1800, 74.6),
  photo('s213', '11111111-1111-4111-8111-111111111213', 'https://images.pexels.com/photos/33786361/pexels-photo-33786361.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 5472, 3648, 'Igor Passchier', 'winter', 2000, 79.3),
  photo('s216', '11111111-1111-4111-8111-111111111216', 'https://images.pexels.com/photos/23358699/pexels-photo-23358699.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 3280, 2464, 'Dmitry Romanoff', 'summer', 1900, 77.1),
  photo('s219', '11111111-1111-4111-8111-111111111219', 'https://images.pexels.com/photos/14373361/pexels-photo-14373361.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 4032, 3024, 'Vlado Paunovic', 'summer', 1750, 71.8),
  photo('s224', '11111111-1111-4111-8111-111111111224', 'https://images.pexels.com/photos/28353887/pexels-photo-28353887.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 6000, 4000, 'Antonio Porras Llopis', 'summer', 1950, 78.9),
  photo('s301', '11111111-1111-4111-8111-111111111301', 'https://images.pexels.com/photos/33183368/pexels-photo-33183368.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 5860, 3907, 'Daniel Ledesma', 'spring', 2100, 81.4),
  photo('s305', '11111111-1111-4111-8111-111111111305', 'https://images.pexels.com/photos/29283772/pexels-photo-29283772.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 2846, 1991, 'luis Peralta', 'summer', 2200, 83.7),
  photo('s202', '11111111-1111-4111-8111-111111111202', 'https://images.pexels.com/photos/38037238/pexels-photo-38037238.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 4416, 2488, 'J MAD', 'spring', 1600, 69.5),
  photo('s225', '11111111-1111-4111-8111-111111111225', 'https://images.pexels.com/photos/37415920/pexels-photo-37415920.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 6097, 4065, 'Emilio Sánchez Hernández', 'spring', 1700, 72.1),
  photo('s215', '11111111-1111-4111-8111-111111111215', 'https://images.pexels.com/photos/20755851/pexels-photo-20755851.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 6240, 3510, 'Bastian Riccardi', 'winter', 1850, 75.3),
  photo('s221', '11111111-1111-4111-8111-111111111221', 'https://images.pexels.com/photos/27659795/pexels-photo-27659795.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 6000, 3376, 'YIYANG LIU', 'spring', 1900, 76.4),
  photo('s204', '11111111-1111-4111-8111-111111111204', 'https://images.pexels.com/photos/9518092/pexels-photo-9518092.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 5184, 2920, 'Sébastien Vincon', 'summer', 1550, 67.8),
  photo('s220', '11111111-1111-4111-8111-111111111220', 'https://images.pexels.com/photos/35376543/pexels-photo-35376543.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 5184, 3456, 'Rino Adamo', 'autumn', 1650, 70.2),
  photo('s226', '11111111-1111-4111-8111-111111111226', 'https://images.pexels.com/photos/39464132/pexels-photo-39464132.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 8192, 4096, 'Quentin Martinez', 'spring', 1450, 65.1),
  photo('s205', '11111111-1111-4111-8111-111111111205', 'https://images.pexels.com/photos/23105775/pexels-photo-23105775.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 6130, 4087, 'Mathias Reding', 'summer', 1750, 73.2),
  photo('s303', '11111111-1111-4111-8111-111111111303', 'https://images.pexels.com/photos/11186841/pexels-photo-11186841.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 4539, 3026, 'Sébastien Vincon', 'autumn', 2000, 79.8),
  photo('s302', '11111111-1111-4111-8111-111111111302', 'https://images.pexels.com/photos/20543360/pexels-photo-20543360.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 5184, 2657, 'Jose Prada', 'autumn', 1400, 63.5),
  photo('s304', '11111111-1111-4111-8111-111111111304', 'https://images.pexels.com/photos/24568237/pexels-photo-24568237.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 5120, 2880, 'SlimMars 13', 'summer', 1300, 61.2),
  photo('s210', '11111111-1111-4111-8111-111111111210', 'https://images.pexels.com/photos/38339399/pexels-photo-38339399.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 4000, 3000, 'Scott Fenwick', 'summer', 1200, 58.7),
];

export const SEED_SPOTS_BY_ID = new Map(SEED_SPOTS.map((s) => [s.id, s]));

export function getSeedSpots(): Spot[] {
  return [...SEED_SPOTS].sort((a, b) => b.bayesian_rating - a.bayesian_rating);
}

export function getSeedPhotos(filters?: {
  season?: string; category?: string; time?: string;
}): (Photo & { spot?: Spot })[] {
  let result = SEED_PHOTOS.map((p) => ({ ...p, spot: SEED_SPOTS_BY_ID.get(p.spot_id) }));
  if (filters?.season && filters.season !== 'all') {
    result = result.filter((p) => p.season === filters.season);
  }
  if (filters?.category && filters.category !== 'all') {
    result = result.filter((p) => p.spot?.category === filters.category);
  }
  if (filters?.time === 'trending') {
    result.sort((a, b) => b.trend_score - a.trend_score);
  } else if (filters?.time === 'new') {
    result.sort((a, b) => b.created_at.localeCompare(a.created_at));
  } else {
    result.sort((a, b) => b.likes - a.likes);
  }
  return result.slice(0, 48);
}

export function getSeedHeroPhoto(): (Photo & { spot?: Spot }) | null {
  const hero = SEED_PHOTOS.find((p) => p.is_hero);
  if (!hero) return null;
  return { ...hero, spot: SEED_SPOTS_BY_ID.get(hero.spot_id) };
}
