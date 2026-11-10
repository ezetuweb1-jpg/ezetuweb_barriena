/*
# Add Multilingual Translations for Spots and Tips

## Purpose
The app supports 6 languages (EUS, ES, EN, FR, DE, IT). Currently spot descriptions
and tip contents are stored as plain English strings. This migration adds a
`translations` JSONB column to both `spots` and `tips` tables, keyed by language
code (eu, es, en, fr, de, it), and populates translations for all existing data.

## Schema Changes
1. `spots` table: ADD COLUMN `translations` jsonb DEFAULT '{}'
2. `tips` table: ADD COLUMN `translations` jsonb DEFAULT '{}'

The original `description` (spots) and `content` (tips) columns remain as fallbacks.
The frontend will use `translations[currentLang] || translations['es'] || description`.

## Data Population
All 54 spots and 8 tips receive translations in all 6 languages.
For spots with euskal_herria set, Basque translations use proper Euskara place names.

## Security
No new tables. No RLS policy changes. Existing policies cover the new columns
since they are on already-accessible tables.
*/

-- Add translations columns (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'spots' AND column_name = 'translations') THEN
    ALTER TABLE spots ADD COLUMN translations jsonb NOT NULL DEFAULT '{}';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tips' AND column_name = 'translations') THEN
    ALTER TABLE tips ADD COLUMN translations jsonb NOT NULL DEFAULT '{}';
  END IF;
END $$;

-- ============================================================
-- SPOT TRANSLATIONS (all 54 spots) — using dollar-quoting $JSON$ to avoid apostrophe issues
-- ============================================================

-- Original 28 spots
UPDATE spots SET translations = $JSON${"eu":"Gaztelugatxeren gaineko ermita, 241 maila eta itsaslabar ikusgarriak.","es":"Ermita sobre el mar en Gaztelugatxe, 241 escalones y acantilados espectaculares.","en":"Hermitage perched above the sea at Gaztelugatxe, 241 steps and spectacular cliffs.","fr":"Ermitage perché au-dessus de la mer à Gaztelugatxe, 241 marches et falaises spectaculaires.","de":"Kapelle über dem Meer auf Gaztelugatxe, 241 Stufen und spektakuläre Klippen.","it":"Eremo sul mare a Gaztelugatxe, 241 gradini e scogliere spettacolari."}$JSON$
WHERE id = '11111111-1111-4111-8111-111111111101';

UPDATE spots SET translations = $JSON${"eu":"Herri gotiko muinotsua, arrosa koloreko harresiak, UNESCOko monumentu nazionala.","es":"Pueblo medieval sobre una colina con muros de tono rosado, Monumento Nacional de la UNESCO.","en":"Medieval hilltop village with pink-hued walls, a UNESCO national monument.","fr":"Village médiéval perché aux murs rosés, monument national de l'UNESCO.","de":"Mittelalterliches Bergdorf mit rötlichen Mauern, ein nationales UNESCO-Denkmal.","it":"Borgo medievale su una collina con mura rosate, monumento nazionale UNESCO."}$JSON$
WHERE id = '11111111-1111-4111-8111-111111111102';

UPDATE spots SET translations = $JSON${"eu":"Dolomitetako laku emeraldaduna, zurezko txalupak eta baso isila.","es":"Lago esmeralda en los Dolomitas con barcas de madera y bosque silencioso.","en":"Emerald lake in the Dolomites with wooden rowboats and silent forest.","fr":"Lac émeraude dans les Dolomites avec barques en bois et forêt silencieuse.","de":"Smaragdsee in den Dolomiten mit Holzbooten und stillem Wald.","it":"Lago smeraldo nelle Dolomiti con barche di legno e foresta silenziosa."}$JSON$
WHERE id = '11111111-1111-4111-8111-111111111103';

UPDATE spots SET translations = $JSON${"eu":"Badiako erdi-erdiko abadia, mareen arabera aldakorra.","es":"Abadía medieval en medio de la bahía, accesible según las mareas.","en":"Medieval abbey mid-bay, accessible by tides.","fr":"Abbaye médiévale au milieu de la baie, accessible selon les marées.","de":"Mittelalterliche Abtei mitten in der Bucht, zugänglich bei Ebbe.","it":"Abbazia medievale al centro della baia, accessibile con le maree."}$JSON$
WHERE id = '11111111-1111-4111-8111-111111111104';

UPDATE spots SET translations = $JSON${"eu":"Granitozko dorreak, glaziarrak eta Patagoniako betaurreko urdinak.","es":"Torres de granito, glaciares y los azules lentes de Patagonia.","en":"Granite towers, glaciers and Patagonia's blue eyeglasses.","fr":"Tours de granit, glaciers et lunettes bleues de Patagonie.","de":"Granittürme, Gletscher und Patagoniens blaue Brillen.","it":"Torri di granito, ghiacciai e occhiali blu della Patagonia."}$JSON$
WHERE id = '11111111-1111-4111-8111-111111111105';

UPDATE spots SET translations = $JSON${"eu":"Lastozko teilatuko etxola elurretan, argi-jaialdi tradizionala.","es":"Aldeas de casas con techo de paja entre montañas nevadas, festival de luces tradicional.","en":"Thatched-roof farmhouses in snowy mountains, traditional light festival.","fr":"Villages aux toits de chaume dans les montagnes enneigées, festival de lumières traditionnel.","de":"Dörfer mit Strohdächern in verschneiten Bergen, traditionelles Lichtfest.","it":"Villaggi con tetti di paglia tra montagne innevate, festival delle luci tradizionale."}$JSON$
WHERE id = '11111111-1111-4111-8111-111111111106';

UPDATE spots SET translations = $JSON${"eu":"Laku glazial urderrak eta Mendi Harritsuak Kanadako lehen parkean.","es":"Lagos glaciares turquesas y picos de las Montañas Rocosas en el primer parque de Canadá.","en":"Turquoise glacial lakes and Rocky Mountain peaks in Canada's first park.","fr":"Lacs glaciaires turquoise et sommets des Rocheuses dans le premier parc du Canada.","de":"Türkise Gletscherseen und Rocky-Mountain-Gipfel in Kanadas erstem Park.","it":"Laghi glaciali turchese e picchi delle Montagne Rocciose nel primo parco del Canada."}$JSON$
WHERE id = '11111111-1111-4111-8111-111111111107';

UPDATE spots SET translations = $JSON${"eu":"Dolomitetako gailur okerrak, UNESCOren ondarea, alpetar ibilbideak.","es":"Cumbres dentadas de los Dolomitas, patrimonio UNESCO, rutas alpinas.","en":"Jagged Dolomites peaks, UNESCO heritage, alpine trails.","fr":"Sommets déchiquetés des Dolomites, patrimoine UNESCO, sentiers alpins.","de":"Zackige Dolomitengipfel, UNESCO-Welterbe, alpine Wege.","it":"Cime frastagliate delle Dolomiti, patrimonio UNESCO, sentieri alpini."}$JSON$
WHERE id = '11111111-1111-4111-8111-111111111108';

UPDATE spots SET translations = $JSON${"eu":"Basaltozko itsaslabarrak, arroken artean belar berde paregabea.","es":"Acantilados de basalto con césped verde impecable entre rocas volcánicas.","en":"Basalt sea cliffs with impossibly green grass between volcanic rocks.","fr":"Falaises de basalte avec une herbe vert immaculé entre les roches volcaniques.","de":"Basalt-Klippen mit makellosem grünem Gras zwischen vulkanischem Gestein.","it":"Scogliere di basalto con erba verde impeccabile tra rocce vulcaniche."}$JSON$
WHERE id = '11111111-1111-4111-8111-111111111109';

UPDATE spots SET translations = $JSON${"eu":"Alpetar herri txikia Hallstatt lakuaren ertzean, gatz-meategi historikoak.","es":"Pueblo alpino junto al lago Hallstatt con minas de sal históricas.","en":"Alpine village on Lake Hallstatt's shore with historic salt mines.","fr":"Village alpin au bord du lac Hallstatt avec mines de sel historiques.","de":"Alpines Dorf am Hallstätter See mit historischen Salzbergwerken.","it":"Villaggio alpino sulla sponda del lago Hallstatt con miniere di sale storiche."}$JSON$
WHERE id = '11111111-1111-4111-8111-111111111110';

UPDATE spots SET translations = $JSON${"eu":"Bost herri itsasertzeko koloretsuak, Liguriako bidexka malkartsua.","es":"Cinco pueblos costeros de colores unidos por un sendero escarpado en Liguria.","en":"Five colorful coastal villages linked by a steep cliffside trail in Liguria.","fr":"Cinq villages côtiers colorés reliés par un sentier escarpé en Ligurie.","de":"Fünf farbenfrohe Küstendörfer verbunden durch einen steilen Klippenpfad in Ligurien.","it":"Cinque borghi costieri colorati uniti da un sentiero a strapiombo in Liguria."}$JSON$
WHERE id = '11111111-1111-4111-8111-111111111111';

UPDATE spots SET translations = $JSON${"eu":"Islandiako mendia errotundoa, iparraldeko argien aurrean.","es":"Montaña cónica en Islandia, telón de fondo perfecto para auroras boreales.","en":"Conical mountain in Iceland, perfect backdrop for northern lights.","fr":"Montagne conique en Islande, toile de fond parfaite pour les aurores boréales.","de":"Kegelberg in Island, perfekte Kulisse für Polarlichter.","it":"Montagna conica in Islanda, perfetto sfondo per le aurore boreali."}$JSON$
WHERE id = '11111111-1111-4111-8111-111111111112';

UPDATE spots SET translations = $JSON${"eu":"Edinburgheko gaztelua, kale harritsuak eta festa gogoa.","es":"Castillo sobre colina volcánica, calles empedradas y espíritu festivo.","en":"Castle on a volcanic crag, cobbled streets and festival spirit.","fr":"Château sur un crag volcanique, rues pavées et esprit de festival.","de":"Burg auf einem Vulkanfelsen, gepflasterte Gassen und Festivität.","it":"Castello su un rilievo vulcanico, strade acciottolate e spirito festivaliero."}$JSON$
WHERE id = '11111111-1111-4111-8111-111111111113';

UPDATE spots SET translations = $JSON${"eu":"Bambu basoa Kyoton, tenpluak eta lorategi isilak.","es":"Bosque de bambú en Kioto con templos y jardines silenciosos.","en":"Bamboo grove in Kyoto with temples and serene gardens.","fr":"Forêt de bambous à Kyoto avec temples et jardins paisibles.","de":"Bambushain in Kyoto mit Tempeln und ruhigen Gärten.","it":"Bosco di bambù a Kyoto con templi e giardini sereni."}$JSON$
WHERE id = '11111111-1111-4111-8111-111111111114';

UPDATE spots SET translations = $JSON${"eu":"Fiordorako ur-jauzi ikusgarriak, itsasontziz ibiltzeko ibilbidea.","es":"Fiordo con cascadas verticales y rutas en ferry por acantilados.","en":"Fjord with sheer waterfalls and ferry routes past cliffs.","fr":"Fjord avec cascades verticales et routes en ferry passant les falaises.","de":"Fjord mit senkrechten Wasserfällen und Fährrouten an Klippen vorbei.","it":"Fiordo con cascate verticali e percorsi in traghetto lungo le scogliere."}$JSON$
WHERE id = '11111111-1111-4111-8111-111111111115';

UPDATE spots SET translations = $JSON${"eu":"Txipres muinoak, garai lor sariak, Toskanako ondarea.","es":"Colinas de cipreses, campos dorados, paisaje patrimonio de la Toscana.","en":"Cypress hills, golden fields, heritage Tuscan landscape.","fr":"Collines de cyprès, champs dorés, paysage toscan patrimoine.","de":"Zypressenhügel, goldene Felder, toskanische Kulturlandschaft.","it":"Colline di cipressi, campi dorati, paesaggio patrimonio toscano."}$JSON$
WHERE id = '11111111-1111-4111-8111-111111111116';

UPDATE spots SET translations = $JSON${"eu":"Kalderra zuriko herria, Egeo itsasoko portuan, ilunabarra.","es":"Pueblo blanco sobre el Egeo con cúpulas azules y atardeceres de postal.","en":"White village above the Aegean with blue domes and postcard sunsets.","fr":"Village blanc sur l'Égée aux dômes bleus et couchers de soleil de carte postale.","de":"Weißes Dorf über der Ägäis mit blauen Kuppeln und Postkarten-Sonnenuntergängen.","it":"Villaggio bianco sull'Egeo con cupole blu e tramonti da cartolina."}$JSON$
WHERE id = '11111111-1111-4111-8111-111111111117';

UPDATE spots SET translations = $JSON${"eu":"72 ur-jauziko harana, Alpeetako herrixka paregabea.","es":"Valle de 72 cascadas con pueblo alpino en un circo glaciar.","en":"Valley of 72 waterfalls with alpine village in a glacial cirque.","fr":"Vallée de 72 cascades avec village alpin dans un cirque glaciaire.","de":"Tal mit 72 Wasserfällen und alpines Dorf in einem Gletscherzirkus.","it":"Valle di 72 cascate con villaggio alpino in un circo glaciale."}$JSON$
WHERE id = '11111111-1111-4111-8111-111111111118';

UPDATE spots SET translations = $JSON${"eu":"Harresitutako hiria itsasertzean, teilatu gorriak Adriatikoan.","es":"Ciudad amurallada junto al mar con tejados rojos sobre el Adriático.","en":"Walled city by the sea with red rooftops above the Adriatic.","fr":"Cité fortifiée au bord de la mer aux toits rouges sur l'Adriatique.","de":"Befestigte Stadt am Meer mit roten Dächern über der Adria.","it":"Città fortificata sul mare con tetti rossi sull'Adriatico."}$JSON$
WHERE id = '11111111-1111-4111-8111-111111111119';

UPDATE spots SET translations = $JSON${"eu":"Mont Blanc mendiaren hegoaldeko teleferikoa, Chamonixetik.","es":"Cima en telecabina sobre Chamonix frente a la cara sur del Mont Blanc.","en":"Cable-car summit above Chamonix facing Mont Blanc's south face.","fr":"Sommet en téléphérique au-dessus de Chamonix face au Mont Blanc.","de":"Gipfel per Seilbahn über Chamonix gegenüber der Mont-Blanc-Südseite.","it":"Cima in funivia sopra Chamonix di fronte alla facciata sud del Mont Blanc."}$JSON$
WHERE id = '11111111-1111-4111-8111-111111111120';

UPDATE spots SET translations = $JSON${"eu":"Erdi Aroko herria, kanalak eta mahastiak, Alsaziakoa.","es":"Pueblo medieval con canales y viñedos en la ruta de Alsacia.","en":"Medieval town with canals and vineyards on the Alsace wine route.","fr":"Village médiéval avec canaux et vignobles sur la route des vins d'Alsace.","de":"Mittelalterliche Stadt mit Kanälen und Weinbergen an der Elsässer Weinstraße.","it":"Borgo medievale con canali e vigneti sulla ruta dei vini d'Alsazia."}$JSON$
WHERE id = '11111111-1111-4111-8111-111111111121';

UPDATE spots SET translations = $JSON${"eu":"Bryggeneko zurezko etxe koloretsuak, fiordoen artean.","es":"Casas de madera coloridas de Bryggen entre fiordos y siete colinas.","en":"Colorful Bryggen wharf between fjords and seven hills.","fr":"Quai coloré de Bryggen entre fjords et sept collines.","de":"Farbenfrohes Bryggen-Kai zwischen Fjorden und sieben Hügeln.","it":"Colorato molo di Bryggen tra fiordi e sette colline."}$JSON$
WHERE id = '11111111-1111-4111-8111-111111111122';

UPDATE spots SET translations = $JSON${"eu":"Terraza mineraleko ur-jauzi zuriak, terma naturalak.","es":"Cascadas blancas en terrazas minerales con piscinas termales naturales.","en":"White travertine terraces with cascading thermal pools.","fr":"Terrasses de travertin blanc avec bassins thermaux en cascade.","de":"Weiße Travertinterrassen mit kaskadierenden Thermalbecken.","it":"Terrazze di travertino bianco con piscine termali a cascata."}$JSON$
WHERE id = '11111111-1111-4111-8111-111111111123';

UPDATE spots SET translations = $JSON${"eu":"Herri urdina Atlas iparraldean, kale labirintikoak.","es":"Pueblo azul en el Atlas septentrional con callejones laberínticos.","en":"Blue village in the Rif mountains with labyrinthine alleys.","fr":"Village bleu dans le Rif avec ruelles labyrinthiques.","de":"Blaues Dorf im Rif mit labyrinthischen Gassen.","it":"Villaggio blu nel Rif con vicoli labirintici."}$JSON$
WHERE id = '11111111-1111-4111-8111-111111111124';

UPDATE spots SET translations = $JSON${"eu":"16 laku kaskada, ur-jauziak eta baso trinkoa.","es":"16 lagos en cascada con cataratas y bosque denso protegido.","en":"16 cascading lakes with waterfalls and dense protected forest.","fr":"16 lacs en cascade avec cascades et forêt dense protégée.","de":"16 kaskadierende Seen mit Wasserfällen und dichtem geschütztem Wald.","it":"16 laghi a cascata con cascate e fitta foresta protetta."}$JSON$
WHERE id = '11111111-1111-4111-8111-111111111125';

UPDATE spots SET translations = $JSON${"eu":"Bavariako gaztelu fairy-tale, ur-jauzi eta baso artean.","es":"Castillo de cuento de hadas en Baviera entre cascadas y bosques.","en":"Fairytale castle in Bavaria between waterfalls and forests.","fr":"Château de conte de fées en Bavière entre cascades et forêts.","de":"Märchenschloss in Bayern zwischen Wasserfällen und Wäldern.","it":"Castello da fiaba in Baviera tra cascate e foreste."}$JSON$
WHERE id = '11111111-1111-4111-8111-111111111126';

UPDATE spots SET translations = $JSON${"eu":"Orratz gotikoak, Karlosen zubia eta muino gaineko gaztelua Moldava ibaiaren gainean.","es":"Agujas góticas, el Puente de Carlos y un castillo sobre el río Moldava.","en":"Gothic spires, Charles Bridge and a hilltop castle over the Vltava.","fr":"Flèches gothiques, le pont Charles et un château dominant la Vltava.","de":"Gotische Türme, Karlsbrücke und eine Burg über der Moldau.","it":"Guglie gotiche, Ponte Carlo e un castello sopra la Moldava."}$JSON$
WHERE id = '11111111-1111-4111-8111-111111111127';

UPDATE spots SET translations = $JSON${"eu":"Kanalak, jauretiak eta zubien isilunea.","es":"Canales, palacios y el silencio de los puentes sobre el agua.","en":"Canals, palaces and the silence of bridges over water.","fr":"Canaux, palais et le silence des ponts au-dessus de l'eau.","de":"Kanäle, Paläste und die Stille der Brücken über dem Wasser.","it":"Canali, palazzi e il silenzio dei ponti sull'acqua."}$JSON$
WHERE id = '11111111-1111-4111-8111-111111111128';

-- Basque Country cluster (5 spots)
UPDATE spots SET translations = $JSON${"eu":"Arrantza-herri kosta, txakolindoko mahastiak eta Balenciaga museoa.","es":"Pueblo pesquero costero famoso por sus viñedos de txakoli y el museo Balenciaga.","en":"Coastal fishing village famous for txakoli vineyards and the Balenciaga museum.","fr":"Village de pêcheurs côtier célèbre pour ses vignobles de txakoli et le musée Balenciaga.","de":"Küstenfischerdorf, berühmt für Txakoli-Weinberge und das Balenciaga-Museum.","it":"Villaggio di pescatori costiero famoso per i vigneti di txakoli e il museo Balenciaga."}$JSON$
WHERE id = '11111111-1111-4111-8111-111111111201';

UPDATE spots SET translations = $JSON${"eu":"Unibertsitate historikoa haran berdeetan, Pizkundeko arkitektura.","es":"Pueblo universitario histórico en valles verdes con arquitectura renacentista.","en":"Historic university town nestled in green valleys with Renaissance architecture.","fr":"Bourg universitaire historique niché dans des vallées vertes avec architecture Renaissance.","de":"Historische Universitätsstadt in grünen Tälern mit Renaissance-Architektur.","it":"Borgo universitario storico tra valli verdi con architettura rinascimentale."}$JSON$
WHERE id = '11111111-1111-4111-8111-111111111202';

UPDATE spots SET translations = $JSON${"eu":"Herri harresitua itsasertzean, alde zahar koloretsua eta Jaizkibel mendiarekin.","es":"Pueblo amurallado costero con casco antiguo colorido y monte Jaizkibel.","en":"Charming walled coastal town with a colorful old quarter and mount Jaizkibel.","fr":"Village fortifié côtier avec vieux quartier coloré et mont Jaizkibel.","de":"Befestigter Küstenort mit buntem Altstadtviertel und Berg Jaizkibel.","it":"Borgo costiero fortificato con quartiere storico colorato e monte Jaizkibel."}$JSON$
WHERE id = '11111111-1111-4111-8111-111111111203';

UPDATE spots SET translations = $JSON${"eu":"Kareharrizko mendigunea, bizkar ikusgarriak, zaldi basatiak eta trikuharriak.","es":"Macizo calizo con vistas de cresta, caballos salvajes y dólmenes neolíticos.","en":"Limestone massif with sweeping ridge views, wild horses and Neolithic dolmens.","fr":"Massif calcaire avec vues de crête, chevaux sauvages et dolmens néolithiques.","de":"Kalksteinmassiv mit Panoramakammsichten, Wildpferden und neolithischen Dolmen.","it":"Massiccio calcareo con viste di cresta, cavalli selvatici e dolmen neolitici."}$JSON$
WHERE id = '11111111-1111-4111-8111-111111111204';

UPDATE spots SET translations = $JSON${"eu":"Euskal surfa harriz itsaslabarretan, arkitektura inperiala.","es":"Elegante pueblo surfista vasco con acantilados dramáticos y arquitectura imperial.","en":"Elegant Basque surf town with dramatic cliffs and grand imperial architecture.","fr":"Élégante station de surf basque aux falaises dramatiques et architecture impériale.","de":"Elegantes baskisches Surfdorf mit dramatischen Klippen und imperialer Architektur.","it":"Elegante città basca del surf con scogliere drammatiche e architettura imperiale."}$JSON$
WHERE id = '11111111-1111-4111-8111-111111111205';

-- Pyrenees cluster (5 spots)
UPDATE spots SET translations = $JSON${"eu":"Haran glaziala, kareharrizko labarrak, ur-jauziak eta alpetar belardiak.","es":"Valle glaciar con impresionantes acantilados calizos, cascadas y prados alpinos.","en":"Glacial valley with dramatic limestone cliffs, waterfalls and alpine meadows.","fr":"Vallée glaciaire avec falaises calcaires spectaculaires, cascades et prairies alpines.","de":"Gletschertal mit dramatischen Kalksteinklippen, Wasserfällen und Almwiesen.","it":"Valle glaciale con drammatiche scogliere calcaree, cascate e prati alpini."}$JSON$
WHERE id = '11111111-1111-4111-8111-111111111206';

UPDATE spots SET translations = $JSON${"eu":"Pirinioetako gorena, Maladeta glaziarrarekin.","es":"Cumbre más alta de los Pirineos con el icónico glaciar de Maladeta.","en":"Highest summit in the Pyrenees with the iconic Maladeta glacier.","fr":"Plus haut sommet des Pyrénées avec le glacier emblématique de Maladeta.","de":"Höchster Gipfel der Pyrenäen mit dem markanten Maladeta-Gletscher.","it":"Cima più alta dei Pirenei con l'iconico ghiacciaio del Maladeta."}$JSON$
WHERE id = '11111111-1111-4111-8111-111111111207';

UPDATE spots SET translations = $JSON${"eu":"Parke nazionala, laku gardenak, pinudiak eta mendiko errekak.","es":"Parque nacional de lagos cristalinos, bosques de pino y arroyos de montaña.","en":"National park of crystalline lakes, pine forests and winding mountain streams.","fr":"Parc national de lacs cristallins, forêts de pins et ruisseaux de montagne.","de":"Nationalpark mit kristallklaren Seen, Kiefernwäldern und Bergbächen.","it":"Parco nazionale di laghi cristallini, pinete e ruscelli montani."}$JSON$
WHERE id = '11111111-1111-4111-8111-111111111208';

UPDATE spots SET translations = $JSON${"eu":"Zirku glazial ikusgarria, 422m-ko Grande Cascade ur-jauzia.","es":"Circo glaciar majestuoso con la cascada Grande de 422 metros.","en":"Majestic glacial cirque with the 422m Grande Cascade waterfall.","fr":"Cirque glaciaire majestueux avec la Grande Cascade de 422 m.","de":"Majestätischer Gletscherzirkus mit dem 422 m hohen Grande-Cascade-Wasserfall.","it":"Circo glaciale maestoso con la cascata Grande di 422 m."}$JSON$
WHERE id = '11111111-1111-4111-8111-111111111209';

UPDATE spots SET translations = $JSON${"eu":"Pirinioetako mendate historikoa, Donejakue bidean.","es":"Histórico puerto de montaña pirenaico en la ruta del Camino de Santiago.","en":"Historic Pyrenean mountain pass on the Camino de Santiago route.","fr":"Col pyrénéen historique sur la route du Chemin de Saint-Jacques.","de":"Historischer Pyrenäenpass auf dem Jakobsweg.","it":"Storico passo pirenaico sulla via del Cammino di Santiago."}$JSON$
WHERE id = '11111111-1111-4111-8111-111111111210';

-- Alps / Dolomites cluster (6 spots)
UPDATE spots SET translations = $JSON${"eu":"Dolomitetako hiru gailur ikonikoak, UNESCOren ondarea.","es":"Tres cumbres dolomíticas icónicas, patrimonio mundial de la UNESCO.","en":"Iconic three-peak dolomite formation, a UNESCO World Heritage landmark.","fr":"Emblématique formation de trois sommets dolomitiques, patrimoine UNESCO.","de":"Ikonische drei Dolomitengipfel, UNESCO-Welterbe.","it":"Iconica formazione di tre cime dolomitiche, patrimonio UNESCO."}$JSON$
WHERE id = '11111111-1111-4111-8111-111111111211';

UPDATE spots SET translations = $JSON${"eu":"Alpetar laku emeraldaduna, Latemar mendigunearen isla.","es":"Lago alpino de aguas esmeralda que refleja el macizo del Latemar.","en":"Alpine lake with emerald waters reflecting the Latemar massif.","fr":"Lac alpin aux eaux émeraude reflétant le massif du Latemar.","de":"Alpiner See mit smaragdgrünem Wasser, der die Latemar-Gruppe spiegelt.","it":"Lago alpino con acque smeraldine che riflettono il massiccio del Latemar."}$JSON$
WHERE id = '11111111-1111-4111-8111-111111111212';

UPDATE spots SET translations = $JSON${"eu":"Ladindar harana, alpetar belardiak, zurezko etxolak eta gailur ikusgarriak.","es":"Valle ladino con prados alpinos, cabañas de madera y picos dramáticos.","en":"Ladin valley with alpine meadows, wooden chalets and dramatic peaks.","fr":"Vallée ladine avec prairies alpines, chalets en bois et sommets dramatiques.","de":"Ladinisches Tal mit Almwiesen, Holzchalets und dramatischen Gipfeln.","it":"Valle ladina con prati alpini, chalet in legno e cime drammatiche."}$JSON$
WHERE id = '11111111-1111-4111-8111-111111111213';

UPDATE spots SET translations = $JSON${"eu":"Piramide formako mendi ikonikoa Suitza eta Italiaren arteko mugan.","es":"Icónico pico piramidal en la frontera entre Suiza e Italia.","en":"Iconic pyramid-shaped peak on the Swiss-Italian border.","fr":"Emblématique pic pyramidal à la frontière sino-italienne.","de":"Ikonischer pyramidenförmiger Gipfel an der Schweizer-Italienischen Grenze.","it":"Iconica vetta a forma di piramide al confine tra Svizzera e Italia."}$JSON$
WHERE id = '11111111-1111-4111-8111-111111111214';

UPDATE spots SET translations = $JSON${"eu":"Alemaniako gorena, 400 alpetar gailurren ikuspegia.","es":"Pico más alto de Alemania con vistas panorámicas de 400 cumbres alpinas.","en":"Germany's highest peak with panoramic views of 400 alpine summits.","fr":"Plus haut sommet d'Allemagne avec vue panoramique sur 400 sommets alpins.","de":"Deutschlands höchster Gipfel mit Panoramablick auf 400 Alpengipfel.","it":"Cima più alta della Germania con vista panoramica su 400 vette alpine."}$JSON$
WHERE id = '11111111-1111-4111-8111-111111111215';

UPDATE spots SET translations = $JSON${"eu":"Austriako gorena, Pasterze glaziarrarekin.","es":"Montaña más alta de Austria con el glaciar Pasterze en su ladera este.","en":"Austria's highest mountain with the Pasterze glacier on its eastern slope.","fr":"Plus haute montagne d'Autriche avec le glacier Pasterze sur son versant est.","de":"Österreichs höchster Berg mit dem Pasterze-Gletscher an der Ostflanke.","it":"Montagna più alta d'Austria con il ghiacciaio Pasterze sul versante orientale."}$JSON$
WHERE id = '11111111-1111-4111-8111-111111111216';

-- Tuscany cluster (5 spots)
UPDATE spots SET translations = $JSON${"eu":"Txipres muino gorak eta garai-lor-sariak, UNESCOren ondarea.","es":"Colinas de cipreses y campos dorados, paisaje patrimonio de la UNESCO.","en":"Rolling cypress hills and golden wheat fields, a UNESCO World Heritage landscape.","fr":"Collines de cyprès ondulantes et champs de blé dorés, paysage patrimoine UNESCO.","de":"Sanfte Zypressenhügel und goldene Weizenfelder, UNESCO-Kulturlandschaft.","it":"Colline di cipressi ondulate e campi di grano dorati, paesaggio patrimonio UNESCO."}$JSON$
WHERE id = '11111111-1111-4111-8111-111111111217';

UPDATE spots SET translations = $JSON${"eu":"Erdi Aroko herria, dorre harritsuak eta Vernaccia ardoa.","es":"Pueblo medieval sobre una colina famoso por sus torres de piedra y vino Vernaccia.","en":"Medieval hill town famous for its soaring stone towers and Vernaccia wine.","fr":"Bourg médiéval perché célèbre pour ses tours de pierre et son vin Vernaccia.","de":"Mittelalterlicher Bergort berühmt für seine steinernen Türme und Vernaccia-Wein.","it":"Borgo medievale su una collina famoso per le sue torri di pietra e il vino Vernaccia."}$JSON$
WHERE id = '11111111-1111-4111-8111-111111111218';

UPDATE spots SET translations = $JSON${"eu":"Pizkundeko herria, Vino Nobile ardoa eta haraneko ikuspegia.","es":"Pueblo renacentista reconocido por Vino Nobile y vistas del valle.","en":"Renaissance hill town renowned for Vino Nobile and sweeping valley views.","fr":"Bourg renaissance réputé pour le Vino Nobile et vue panoramique sur la vallée.","de":"Renaissance-Bergort, bekannt für Vino Nobile und Panoramablick ins Tal.","it":"Borgo rinascimentale rinomato per il Vino Nobile e vista panoramica sulla valle."}$JSON$
WHERE id = '11111111-1111-4111-8111-111111111219';

UPDATE spots SET translations = $JSON${"eu":"Ilargiko muino buztintsuak, Sienaren hegoaldean, txipres isolatuekin.","es":"Colinas arcillosas lunares al sur de Siena con cipreses aislados y caseríos.","en":"Lunar clay hills south of Siena with isolated cypress trees and farmhouses.","fr":"Collines d'argile lunaires au sud de Sienne avec cyprès isolés et fermes.","de":"Mondähnliche Lehmhügel südlich von Siena mit isolierten Zypressen und Bauernhöfen.","it":"Colline di argilla lunari a sud di Siena con cipressi isolati e casolari."}$JSON$
WHERE id = '11111111-1111-4111-8111-111111111220';

UPDATE spots SET translations = $JSON${"eu":"Muino leunak, olibondoz beteak, erromaniko elizak.","es":"Colinas suaves salpicadas de olivares y abadías románicas.","en":"Gentle hills dotted with olive groves and Romanesque abbey churches.","fr":"Collines douces parsemées d'oliveraies et d'abbayes romanes.","de":"Sanfte Hügel mit Olivenhainen und romanischen Abteikirchen.","it":"Colline dolli punteggiate di oliveti e abbazie romaniche."}$JSON$
WHERE id = '11111111-1111-4111-8111-111111111221';

-- Southern Spain cluster (5 spots)
UPDATE spots SET translations = $JSON${"eu":"Labar gaineko herria, El Tajo arrailaren gainean.","es":"Pueblo sobre un precipicio dividido por el desfiladero de El Tajo de 100 metros.","en":"Dramatic clifftop town split by the 100m-deep El Tajo gorge.","fr":"Village perché sur une falaise, divisé par la gorge d'El Tajo de 100 m.","de":"Dramatisches Klippendorf, geteilt durch die 100 m tiefe El-Tajo-Schlucht.","it":"Drammatico borgo su uno strapiombo, diviso dalla gola di El Tajo di 100 m."}$JSON$
WHERE id = '11111111-1111-4111-8111-111111111222';

UPDATE spots SET translations = $JSON${"eu":"Jauregi eta lorategi mairuak muino gainean, UNESCOren ondarea.","es":"Palacio moro y jardines sobre una colina, patrimonio mundial de la UNESCO.","en":"Moorish palace and gardens on a hilltop, a UNESCO World Heritage site.","fr":"Palais et jardins moresques sur une colline, patrimoine mondial UNESCO.","de":"Maurischer Palast und Gärten auf einem Hügel, UNESCO-Welterbe.","it":"Palazzo e giardini moreschi su una collina, patrimonio mondiale UNESCO."}$JSON$
WHERE id = '11111111-1111-4111-8111-111111111223';

UPDATE spots SET translations = $JSON${"eu":"Parke basati itsasertz bolkanikoa, kala ezkutuak eta ur gardenak.","es":"Parque desértico volcánico costero con calas ocultas y agua cristalina.","en":"Volcanic coastal desert park with hidden coves and crystal-clear water.","fr":"Parc désertique volcanique côtier avec criques cachées et eau cristalline.","de":"Vulkanischer Küstenwüstenpark mit versteckten Buchten und kristallklarem Wasser.","it":"Parco desertico vulcanico costiero con calette nascoste e acqua cristallina."}$JSON$
WHERE id = '11111111-1111-4111-8111-111111111224';

UPDATE spots SET translations = $JSON${"eu":"Espainiako eremu babestu handiena, pinudiak eta Guadalquivir iturria.","es":"Mayor zona protegida de España con bosques de pino y el nacimiento del Guadalquivir.","en":"Spain's largest protected area with pine forests and the Guadalquivir source.","fr":"Plus grande zone protégée d'Espagne avec forêts de pins et la source du Guadalquivir.","de":"Spaniens größtes Schutzgebiet mit Kiefernwäldern und der Quelle des Guadalquivir.","it":"La più grande area protetta di Spagna con pinete e la sorgente del Guadalquivir."}$JSON$
WHERE id = '11111111-1111-4111-8111-111111111225';

UPDATE spots SET translations = $JSON${"eu":"Herri zuria Grazalema mendigunean, Espainiako euri-gune handiena.","es":"Pueblo blanco en la Sierra de Grazalema, el punto más lluvioso de España.","en":"Whitewashed village in the Sierra de Grazalema, the rainiest spot in Spain.","fr":"Village blanc dans la Sierra de Grazalema, l'endroit le plus pluvieux d'Espagne.","de":"Weißes Dorf in der Sierra de Grazalema, dem regenreichsten Ort Spaniens.","it":"Villaggio bianco nella Sierra de Grazalema, il luogo più piovoso di Spagna."}$JSON$
WHERE id = '11111111-1111-4111-8111-111111111226';

-- ============================================================
-- TIP TRANSLATIONS (all 8 tips)
-- ============================================================

UPDATE tips SET translations = $JSON${"eu":"Joan egunsentian — txalupak isilak dira eta ura ispilu bihurtzen da 7:00etatik aurretik.","es":"Ve al amanecer — las barcas están tranquilas y el agua se convierte en espejo antes de las 7am.","en":"Go at sunrise — the boats are quiet and the water turns to glass before 7am.","fr":"Allez-y au lever du soleil — les barques sont calmes et l'eau devient miroir avant 7h.","de":"Geh bei Sonnenaufgang — die Boote sind ruhig und das Wasser wird vor 7 Uhr spiegelglatt.","it":"Vai all'alba — le barche sono tranquille e l'acqua diventa uno specchio prima delle 7."}$JSON$
WHERE id = 'c8634b60-6a89-4aeb-a71b-9082120e872d';

UPDATE tips SET translations = $JSON${"eu":"Aparcamendua goiko aparkalekuan dago. Ekarri ura 241 mailentzat, guztiz estalia baitago.","es":"El aparcamiento está en el lote de arriba. Lleva agua para los 241 escalones, está totalmente expuesto.","en":"Parking is at the top lot. Bring water for the 241 steps, it is fully exposed.","fr":"Le parking est en haut. Apportez de l'eau pour les 241 marches, c'est entièrement exposé.","de":"Parken ist oben. Bring Wasser für die 241 Stufen, es ist vollkommen exponiert.","it":"Il parcheggio è in alto. Porta acqua per i 241 gradini, è completamente esposto."}$JSON$
WHERE id = '497bc091-9d2f-4ec1-9a09-63b1f66d58c7';

UPDATE tips SET translations = $JSON${"eu":"Refugio Las Torres da kanpamendu baserik onena. Erreserbatu W ibilbidea hilabeteak aurretik.","es":"Refugio Las Torres es el mejor campamento base. Reserva el trek W con meses de antelación.","en":"Refugio Las Torres is the best basecamp. Book the W trek months in advance.","fr":"Le Refugio Las Torres est le meilleur camp de base. Réservez le trek W des mois à l'avance.","de":"Refugio Las Torres ist das beste Basecamp. Buche den W-Trek Monate im Voraus.","it":"Il Refugio Las Torres è il miglior campo base. Prenota il trek W con mesi di anticipo."}$JSON$
WHERE id = 'aacc1ac4-5005-4913-94d7-b17ffc955975';

UPDATE tips SET translations = $JSON${"eu":"Moraine Lakuera bidea neguan ixten da. Garraioa beharrezkoa da udako denboraldi gorenean.","es":"La carretera al lago Moraine cierra en invierno. Se necesita lanzadera en la temporada alta de verano.","en":"Moraine Lake road closes in winter. Shuttle required in peak summer season.","fr":"La route du lac Moraine ferme en hiver. Navette requise en pleine saison estivale.","de":"Die Moraine-See-Straße ist im Winter gesperrt. In der Hauptsaison ist ein Shuttle erforderlich.","it":"La strada per il lago Moraine chiude in inverno. Navetta obbligatoria in alta stagione estiva."}$JSON$
WHERE id = '37c1f4d8-3a42-4fd7-a72f-aa84b57e2f8a';

UPDATE tips SET translations = $JSON${"eu":"Awa Odori jaialdia maiatzean argiztatzen ditu lastategiak ilunabarran — magikoa.","es":"El festival Awa Odori en mayo ilumina los techos de paja al anochecer — mágico.","en":"Awa Odori festival in May lights up the thatched roofs at dusk — magical.","fr":"Le festival Awa Odori en mai illumine les toits de chaume au crépuscule — magique.","de":"Das Awa-Odori-Fest im Mai beleuchtet die Strohdächer in der Dämmerung — magisch.","it":"Il festival Awa Odori a maggio illumina i tetti di paglia al tramonto — magico."}$JSON$
WHERE id = 'a0405df2-7196-4404-a81b-d151554e9c85';

UPDATE tips SET translations = $JSON${"eu":"Oiako ilunabarra ikonikoa da, baina Imerovigli lasaiagoa da kalderaren ikuspegia berdinarekin.","es":"El atardecer de Oia es icónico pero Imerovigli es más tranquilo con la misma vista de la caldera.","en":"Oia sunset is iconic but Imerovigli is quieter with the same caldera view.","fr":"Le coucher de soleil d'Oia est emblématique mais Imerovigli est plus calme avec la même vue de la caldeira.","de":"Der Sonnenuntergang in Oia ist ikonisch, aber Imerovigli ist ruhiger mit derselben Caldera-Sicht.","it":"Il tramonto di Oia è iconico ma Imerovigli è più tranquillo con la stessa vista della caldera."}$JSON$
WHERE id = '7f3b6ee6-1725-4d4c-b2dd-42d8a9c64a88';

UPDATE tips SET translations = $JSON${"eu":"Ipar argen sasoi iraila-martxoa da. Kirkjufellsfoss da argazkien aurrealdea.","es":"La temporada de auroras es de septiembre a marzo. Kirkjufellsfoss es el primer plano para las fotos.","en":"Aurora season is Sept-Mar. Kirkjufellsfoss is the foreground for the shots.","fr":"La saison des aurores est de septembre à mars. Kirkjufellsfoss est le premier plan pour les photos.","de":"Aurora-Saison ist September bis März. Kirkjufellsfoss ist der Vordergrund für die Aufnahmen.","it":"La stagione delle aurore è da settembre a marzo. Kirkjufellsfoss è il primo piano per le foto."}$JSON$
WHERE id = 'ab2bb221-580c-4973-91f4-44a94625856b';

UPDATE tips SET translations = $JSON${"eu":"Staubbach ur-jauzia gauez argiztatzen dute abenduan — begiratu herriko egutegia.","es":"La cascada Staubbach se ilumina de noche en diciembre — consulta el calendario del pueblo.","en":"Staubbach Fall is lit at night in December — check the village calendar.","fr":"La cascade Staubbach est illuminée la nuit en décembre — vérifiez le calendrier du village.","de":"Der Staubbach-Wasserfall wird im Dezember nachts beleuchtet — checke den Dorffahrplan.","it":"La cascata Staubbach è illuminata di notte a dicembre — controlla il calendario del villaggio."}$JSON$
WHERE id = '1d90af50-4597-49d1-a159-9bec93075571';
