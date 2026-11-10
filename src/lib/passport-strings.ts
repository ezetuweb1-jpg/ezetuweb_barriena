import type { LangCode } from './types';

export type PassportLang = 'es' | 'eu' | 'en';

const STRINGS = {
  passportTitle: { es: 'Mi Pasaporte', eu: 'Nire Pasaportea', en: 'My Passport' },
  passportSubtitle: { es: 'Tu viaje, tu progreso y tus fotos en un solo lugar', eu: 'Zure bidaia, zure aurrerapena eta zure argazkiak leku bakarrean', en: 'Your travels, progress and photos in one place' },
  changePhoto: { es: 'Cambiar foto', eu: 'Aldatu argazkia', en: 'Change photo' },
  removePhoto: { es: 'Quitar foto', eu: 'Kendu argazkia', en: 'Remove photo' },
  levelHelp: { es: '¿Cómo subir de nivel?', eu: 'Nola igo mailaz?', en: 'How do I level up?' },
  levelHelpTitle: { es: 'Cómo subir de nivel', eu: 'Nola igo mailaz', en: 'How to level up' },
  xpRulesTitle: { es: 'Cómo ganas XP', eu: 'Nola irabazten duzun XP', en: 'How you earn XP' },
  ruleVisit: { es: 'Rincón visitado', eu: 'Bisitatutako lekua', en: 'Spot visited' },
  ruleReview: { es: 'Reseña escrita', eu: 'Idatzitako iritzia', en: 'Review written' },
  rulePhoto: { es: 'Foto subida', eu: 'Igotako argazkia', en: 'Photo uploaded' },
  rulePhotoLike: { es: 'Like en tus fotos', eu: 'Zure argazkien like-a', en: 'Like on your photos' },
  rulePioneer: { es: 'Rincón nuevo registrado', eu: 'Erregistratutako leku berria', en: 'New spot registered' },
  levelsTitle: { es: 'Niveles', eu: 'Mailak', en: 'Levels' },
  levelLabel: { es: 'Nivel {n}', eu: '{n}. maila', en: 'Level {n}' },
  xpCurrent: { es: '{xp} XP', eu: '{xp} XP', en: '{xp} XP' },
  xpNext: { es: 'Te faltan {n} XP para {level}', eu: '{n} XP falta zaizkizu {level} mailara', en: '{n} XP to go until {level}' },
  xpMax: { es: 'Has alcanzado el nivel máximo', eu: 'Maila gorena lortu duzu', en: 'You have reached the top level' },
  followersBtn: { es: 'Seguidores', eu: 'Jarraitzaileak', en: 'Followers' },
  followingBtn: { es: 'Siguiendo', eu: 'Jarraitzen', en: 'Following' },
  followersTitle: { es: 'Tus seguidores', eu: 'Zure jarraitzaileak', en: 'Your followers' },
  followingTitle: { es: 'A quién sigues', eu: 'Nor jarraitzen duzun', en: 'Who you follow' },
  viewProfile: { es: 'Ver perfil', eu: 'Profila ikusi', en: 'View profile' },
  unfollow: { es: 'Dejar de seguir', eu: 'Utzi jarraitzeari', en: 'Unfollow' },
  emptyList: { es: 'No hay nadie en esta lista', eu: 'Zerrenda honetan ez dago inor', en: 'Nobody in this list' },
  followingEmpty: { es: "Aún no sigues a ningún viajero. Descubre fotógrafos en la galería y pulsa 'Seguir'.", eu: "Oraindik ez duzu bidaiaririk jarraitzen. Arakatu galeria eta sakatu 'Jarraitu'.", en: "You are not following any travelers yet. Explore the gallery and tap 'Follow'." },
  close: { es: 'Cerrar', eu: 'Itxi', en: 'Close' },
  loadError: { es: 'No pudimos cargar tus datos. Inténtalo de nuevo más tarde.', eu: 'Ezin izan ditugu zure datuak kargatu. Saiatu berriro geroago.', en: 'We could not load your data. Please try again later.' },
  levelBadge: { es: 'Nivel {level}: {levelName} ({xp} XP)', eu: '{level}. Maila: {levelName} ({xp} XP)', en: 'Level {level}: {levelName} ({xp} XP)' },

  conquestTitle: { es: 'Metas de conquista', eu: 'Konkista helburuak', en: 'Conquest goals' },
  continentsMetric: { es: 'Continentes', eu: 'Kontinenteak', en: 'Continents' },
  capitalsMetric: { es: 'Capitales del mundo', eu: 'Munduko hiriburuak', en: 'World capitals' },
  worldMetric: { es: 'Mundo conquistado', eu: 'Munduaren konkista', en: 'World conquered' },
  likesMetric: { es: 'Likes totales de la comunidad', eu: 'Komunitatearen like guztiak', en: 'Total community likes' },
  countriesSuffix: { es: 'países (%{pct})', eu: 'herrialde (%{pct})', en: 'countries (%{pct})' },
  countriesModalTitle: { es: '{total} Países del Mundo', eu: '{total} Munduko Herrialdeak', en: '{total} Countries of the World' },
  mapTitle: { es: 'Mi mapa', eu: 'Nire mapa', en: 'My map' },
  searchPlaceholder: { es: 'Buscar país o capital', eu: 'Bilatu herrialdea edo hiriburua', en: 'Search country or capital' },
  noResults: { es: 'No hay resultados para tu búsqueda', eu: 'Ez dago emaitzarik zure bilaketarako', en: 'No results for your search' },
  lockedHint: { es: 'Explora para desbloquear', eu: 'Esploratu desblokeatzeko', en: 'Explore to unlock' },
  likesHint: { es: 'Suma de likes en todas tus fotos', eu: 'Zure argazki guztien like-en batura', en: 'Sum of likes on all your photos' },
  checklistVisited: { es: 'Visitados', eu: 'Bisitatuak', en: 'Visited' },
  checklistPending: { es: 'Pendientes', eu: 'Falta direnak', en: 'Pending' },
  exploreBtn: { es: 'Explorar en el mapa', eu: 'Esploratu mapan', en: 'Explore on the map' },
  continentsModalTitle: { es: 'Continentes', eu: 'Kontinenteak', en: 'Continents' },
  capitalsModalTitle: { es: 'Capitales del mundo', eu: 'Munduko hiriburuak', en: 'World capitals' },
  cont_eu: { es: 'Europa', eu: 'Europa', en: 'Europe' },
  cont_as: { es: 'Asia', eu: 'Asia', en: 'Asia' },
  cont_af: { es: 'África', eu: 'Afrika', en: 'Africa' },
  cont_am: { es: 'América', eu: 'Amerika', en: 'Americas' },
  cont_oc: { es: 'Oceanía', eu: 'Ozeania', en: 'Oceania' },
  cont_an: { es: 'Antártida', eu: 'Antartika', en: 'Antarctica' },

  retosTitle: { es: 'Retos', eu: 'Erronkak', en: 'Challenges' },
  retoName_cabra: { es: 'Cabra Montés', eu: 'Ahuntz basatia', en: 'Mountain Goat' },
  retoDesc_cabra: { es: 'Cumbres', eu: 'Goi-mendiak', en: 'Summits' },
  retoName_alma: { es: 'Alma de Pueblo', eu: 'Herriaren arima', en: 'Village Soul' },
  retoDesc_alma: { es: 'Pueblos', eu: 'Herriak', en: 'Villages' },
  retoName_calas: { es: 'Cazador de Calas', eu: 'Kala ehiztaria', en: 'Cove Hunter' },
  retoDesc_calas: { es: 'Costas', eu: 'Kostaldeak', en: 'Coastlines' },
  retoName_pionero: { es: 'Pionero del Atlas', eu: 'Atlasaren aitzindaria', en: 'Atlas Pioneer' },
  retoDesc_pionero: { es: 'Nuevos rincones registrados', eu: 'Erregistratutako leku berriak', en: 'New spots registered' },
  retoName_ojo: { es: 'Ojo de Fotógrafo', eu: 'Argazkilariaren begia', en: 'Photographer Eye' },
  retoDesc_ojo: { es: 'Likes recibidos', eu: 'Jasotako like-ak', en: 'Likes received' },
  retoName_trotamundos: { es: 'Trotamundos', eu: 'Mundubilaria', en: 'Globetrotter' },
  retoDesc_trotamundos: { es: 'Países pisados', eu: 'Zapaldutako herrialdeak', en: 'Countries visited' },
  tierBronze: { es: 'Bronce', eu: 'Brontzea', en: 'Bronze' },
  tierSilver: { es: 'Plata', eu: 'Zilarra', en: 'Silver' },
  tierGold: { es: 'Oro', eu: 'Urrea', en: 'Gold' },
  nextTier: { es: '{value} / {total} para {tier}', eu: '{value} / {total} {tier} lortzeko', en: '{value} / {total} to {tier}' },
  tierDone: { es: 'Reto completado', eu: 'Erronka osatuta', en: 'Challenge completed' },
  tierNone: { es: 'Sin medalla todavía', eu: 'Oraindik domina gabe', en: 'No medal yet' },

  portfolioTitle: { es: 'Mi portafolio y palmarés', eu: 'Nire Argazkiak', en: 'My Photography & Awards' },
  trophiesTitle: { es: 'Palmarés', eu: 'Sarituak', en: 'Awards' },
  noTrophies: { es: 'Aún no tienes premios', eu: 'Oraindik ez duzu sari irabazirik', en: 'No awards yet' },
  awardMonth: { es: 'Foto del Mes', eu: 'Hilabeteko argazkia', en: 'Photo of the Month' },
  awardYear: { es: 'Foto del Año', eu: 'Urteko argazkia', en: 'Photo of the Year' },
  medalGold: { es: 'Oro', eu: 'Urrezkoa', en: 'Gold' },
  medalSilver: { es: 'Plata', eu: 'Zilarrezkoa', en: 'Silver' },
  medalBronze: { es: 'Bronce', eu: 'Brontzezkoa', en: 'Bronze' },
  masterpieceTitle: { es: 'Obra Maestra', eu: 'Obra maisua', en: 'Masterpiece' },
  likesCount: { es: '{n} likes', eu: '{n} like', en: '{n} likes' },
  noPhotos: { es: 'Aún no has subido fotos', eu: 'Oraindik ez duzu argazkirik igo', en: 'You have not uploaded any photos yet' },
  sortVotes: { es: 'Más votadas', eu: 'Gehien bozkatuak', en: 'Most voted' },
  sortAwards: { es: 'Premiadas', eu: 'Sarituak', en: 'Awarded' },
  sortRecent: { es: 'Recientes', eu: 'Berrienak', en: 'Recent' },

  rankingTitle: { es: 'Mis rincones conquistados en el ranking mundial', eu: 'Nire lekuak rankingaren arabera', en: 'My conquered spots in the world ranking' },
  filterAll: { es: 'Todos', eu: 'Guztiak', en: 'All' },
  filterCities: { es: 'Ciudades', eu: 'Hiriak', en: 'Cities' },
  filterVillages: { es: 'Pueblos', eu: 'Herriak', en: 'Villages' },
  filterNature: { es: 'Naturaleza', eu: 'Natura', en: 'Nature' },
  viewOnMapBtn: { es: 'Ver en el mapa', eu: 'Ikusi mapan', en: 'View on map' },
  emptySpots: { es: 'Aún no has visitado ningún rincón', eu: 'Oraindik ez duzu lekurik bisitatu', en: 'You have not visited any spots yet' },
  noMatches: { es: 'No hay rincones en esta categoría', eu: 'Kategoria honetan ez dago lekurik', en: 'No spots in this category' },
} as const;

export type PassportKey = keyof typeof STRINGS;

export function toPassportLang(code: LangCode): PassportLang {
  if (code === 'EUS') return 'eu';
  if (code === 'ES') return 'es';
  return 'en';
}

export function passportLocale(lang: PassportLang): string {
  return lang === 'es' ? 'es-ES' : lang === 'eu' ? 'eu-ES' : 'en-US';
}

export function createPassportT(lang: PassportLang) {
  return (key: PassportKey, vars?: Record<string, string | number>): string => {
    let text: string = STRINGS[key][lang];
    if (vars) for (const [name, value] of Object.entries(vars)) text = text.split(`{${name}}`).join(String(value));
    return text;
  };
}

export type PassportT = ReturnType<typeof createPassportT>;
