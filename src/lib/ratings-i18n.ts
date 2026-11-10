import type { LangCode, Category } from './types';

type LangKey = 'es' | 'eu' | 'en' | 'fr' | 'de' | 'it';

const LANG_MAP: Record<LangCode, LangKey> = {
  EUS: 'eu',
  ES: 'es',
  EN: 'en',
  FR: 'fr',
  DE: 'de',
  IT: 'it',
};

export interface CriterionText {
  name: Record<LangKey, string>;
  tooltip: Record<LangKey, string>;
}

export interface CategoryCriteria {
  c1: CriterionText;
  c2: CriterionText;
  c3: CriterionText;
}

type GeneralQuestionByCategory = Record<Category, Record<LangKey, string>>;

export const RATINGS_I18N = {
  generalTitle: {
    es: 'Puntuación general',
    eu: 'Balorazio orokorra',
    en: 'Overall rating',
    fr: 'Note globale',
    de: 'Gesamtbewertung',
    it: 'Valutazione complessiva',
  } as Record<LangKey, string>,

  generalQuestion: {
    nature: {
      es: '¿Cuál es tu valoración de este paisaje natural?',
      eu: 'Zein da paisaia natural honi ematen diozun balorazioa?',
      en: 'What is your overall rating of this natural landscape?',
      fr: 'Quelle est votre note globale pour ce paysage naturel ?',
      de: 'Wie ist Ihre Gesamtbewertung dieser Naturlandschaft?',
      it: 'Qual è la tua valutazione complessiva di questo paesaggio naturale?',
    } as Record<LangKey, string>,
    village: {
      es: '¿Cuál es tu valoración de este pueblo como destino?',
      eu: 'Zein da herri honi ematen diozun balorazioa?',
      en: 'What is your overall rating of this village?',
      fr: 'Quelle est votre note globale pour ce village ?',
      de: 'Wie ist Ihre Gesamtbewertung dieses Dorfes?',
      it: 'Qual è la tua valutazione complessiva di questo borgo?',
    } as Record<LangKey, string>,
    city: {
      es: '¿Cuál es tu valoración de esta ciudad como destino?',
      eu: 'Zein da hiri honi ematen diozun balorazioa?',
      en: 'What is your overall rating of this city?',
      fr: 'Quelle est votre note globale pour cette ville ?',
      de: 'Wie ist Ihre Gesamtbewertung dieser Stadt?',
      it: 'Qual è la tua valutazione complessiva di questa città?',
    } as Record<LangKey, string>,
  } as GeneralQuestionByCategory,

  nature: {
    c1: {
      name: {
        es: 'Paisaje',
        eu: 'Paisaia',
        en: 'Scenery',
        fr: 'Paysage',
        de: 'Landschaft',
        it: 'Paesaggio',
      },
      tooltip: {
        es: 'Espectacularidad visual, magnitud y belleza natural del entorno.',
        eu: 'Ikusgarritasun bisuala eta ingurunearen edertasun naturala.',
        en: 'Visual spectacularity, scale, and natural beauty of the environment.',
        fr: 'Spectacularité visuelle, ampleur et beauté naturelle du cadre.',
        de: 'Visuelle Spektakularität, Größe und natürliche Schönheit der Umgebung.',
        it: 'Spettacolarità visiva, ampiezza e bellezza naturale dell\'ambiente.',
      },
    },
    c2: {
      name: {
        es: 'Accesibilidad',
        eu: 'Irisgarritasuna',
        en: 'Accessibility',
        fr: 'Accessibilité',
        de: 'Erreichbarkeit',
        it: 'Accessibilità',
      },
      tooltip: {
        es: 'Facilidad de acceso físico. 5★ = acceso llano o en coche; 1★ = sendero técnico exigente de montaña.',
        eu: 'Irisgarritasun fisikoa. 5★ = sarbide erraza edo autoz; 1★ = mendiko bide tekniko eta zorrotza.',
        en: 'Ease of physical access. 5★ = flat walk or by car; 1★ = demanding technical mountain trail.',
        fr: 'Facilité d\'accès physique. 5★ = accès plat ou en voiture ; 1★ = sentier de montagne technique et exigeant.',
        de: 'Leichtigkeit des physischen Zugangs. 5★ = flacher Weg oder mit dem Auto; 1★ = anspruchsvoller technischer Bergpfad.',
        it: 'Facilità di accesso fisico. 5★ = percorso pianeggiante o in auto; 1★ = sentiero di montagna tecnico e impegnativo.',
      },
    },
    c3: {
      name: {
        es: 'Masificación',
        eu: 'Masifikazioa',
        en: 'Crowding',
        fr: 'Affluence',
        de: 'Überfüllung',
        it: 'Affollamento',
      },
      tooltip: {
        es: 'Preservación del entorno. 5★ = salvaje, virgen y en soledad; 1★ = masificación y colas de visitantes.',
        eu: 'Ingurunearen kontserbazioa. 5★ = basatia, birjina eta bakardadean; 1★ = masifikazioa eta jende-ilarak.',
        en: 'Preservation of the setting. 5★ = wild, untouched and peaceful; 1★ = overcrowded with visitor queues.',
        fr: 'Préservation du cadre. 5★ = sauvage, intact et paisible ; 1★ = surpeuplé avec des files d\'attente.',
        de: 'Erhaltung der Umgebung. 5★ = wild, unberührt und friedlich; 1★ = überlaufen mit Besucherstaus.',
        it: 'Conservazione dell\'ambiente. 5★ = selvaggio, intatto e tranquillo; 1★ = sovraffollato con code di visitatori.',
      },
    },
  } as CategoryCriteria,

  village: {
    c1: {
      name: {
        es: 'Fotogenia',
        eu: 'Fotogenia',
        en: 'Charm',
        fr: 'Charme',
        de: 'Charme',
        it: 'Fascino',
      },
      tooltip: {
        es: 'Rincones de postal, fachadas tradicionales y armonía estética del conjunto.',
        eu: 'Postalezko txokoak, fatxada tradizionalak eta multzoaren harmonia estetikoa.',
        en: 'Picture-postcard corners, traditional facades, and overall aesthetic harmony.',
        fr: 'Coins de carte postale, façades traditionnelles et harmonie esthétique d\'ensemble.',
        de: 'Postkartenwinkel, traditionelle Fassaden und ästhetische Gesamtharmonie.',
        it: 'Angoli da cartolina, facciate tradizionali e armonia estetica generale.',
      },
    },
    c2: {
      name: {
        es: 'Masificación turística',
        eu: 'Masifikazio turistikoa',
        en: 'Tourist crowding',
        fr: 'Affluence touristique',
        de: 'Touristenüberfüllung',
        it: 'Affollamento turistico',
      },
      tooltip: {
        es: '¿Pueblo tranquilo o masificado de turismo? 5★ = paz, sosiego y paseo relajado sin agobios; 1★ = saturado de turistas, colas y autobuses.',
        eu: 'Herri lasaia da ala masifikazio turistikoak jota dago? 5★ = bakea, patxada eta ibilaldi lasaia; 1★ = turismoz gainezka, ilarak eta autobusak.',
        en: 'Peaceful village or overrun by tourists? 5★ = calm, relaxing stroll; 1★ = overcrowded with tour buses and queues.',
        fr: 'Village paisible ou envahi par les touristes ? 5★ = balade calme et reposante ; 1★ = saturé de touristes, files et bus.',
        de: 'Ruhiges Dorf oder von Touristen überlaufen? 5★ = ruhiger, entspannter Spaziergang; 1★ = überlaufen mit Touristenbussen und Schlangen.',
        it: 'Borgo tranquillo o invaso dai turisti? 5★ = passeggiata calma e rilassante; 1★ = sovraffollato di pullman turistici e code.',
      },
    },
    c3: {
      name: {
        es: 'Vida local',
        eu: 'Tokiko bizitza',
        en: 'Local life',
        fr: 'Vie locale',
        de: 'Lokales Leben',
        it: 'Vita locale',
      },
      tooltip: {
        es: 'Ambiente acogedor, plazas con vida, tradición y gastronomía típica de calidad.',
        eu: 'Giro atsegina, enparantza biziak, tradizioa eta kalitatezko bertako gastronomia.',
        en: 'Welcoming atmosphere, lively town squares, living traditions, and authentic regional food.',
        fr: 'Ambiance accueillante, places vivantes, traditions vivantes et gastronomie locale de qualité.',
        de: 'Einladende Atmosphäre, lebendige Plätze, Traditionen und authentische regionale Küche.',
        it: 'Atmosfera accogliente, piazze vivaci, tradizioni vive e gastronomia locale autentica.',
      },
    },
  } as CategoryCriteria,

  city: {
    c1: {
      name: {
        es: 'Fotogenia',
        eu: 'Fotogenia',
        en: 'Photogenic',
        fr: 'Photogénie',
        de: 'Fotogenität',
        it: 'Fotogenia',
      },
      tooltip: {
        es: 'Belleza visual: arquitectura, perspectivas de sus calles y miradores urbanos.',
        eu: 'Edertasun bisuala: arkitektura, kaleen ikuspegiak eta hiriko begiratokiak.',
        en: 'Visual beauty: architecture, urban perspectives, and city viewpoints.',
        fr: 'Beauté visuelle : architecture, perspectives de rues et points de vue urbains.',
        de: 'Visuelle Schönheit: Architektur, Straßenperspektiven und städtische Aussichtspunkte.',
        it: 'Bellezza visiva: architettura, prospettive stradali e punti panoramici cittadini.',
      },
    },
    c2: {
      name: {
        es: 'Comodidad urbana',
        eu: 'Erosotasun urbanoa',
        en: 'Walkability',
        fr: 'Marchabilité',
        de: 'Begehbarkeit',
        it: 'Percorribilità',
      },
      tooltip: {
        es: 'Facilidad para recorrerla a pie de forma agradable, fluida y sin agobios de tráfico.',
        eu: 'Oinez erraz, atsegin eta auto-ilararik edo estutasunik gabe ibiltzeko aukera.',
        en: 'Ease of exploring on foot, pedestrian areas, and smooth mobility without traffic stress.',
        fr: 'Facilité de parcours à pied, zones piétonnes et mobilité fluide sans stress de circulation.',
        de: 'Leichtigkeit der Erkundung zu Fuß, Fußgängerzonen und fließende Mobilität ohne Verkehrsstress.',
        it: 'Facilità di esplorazione a piedi, aree pedonali e mobilità scorrevole senza stress del traffico.',
      },
    },
    c3: {
      name: {
        es: 'Cultura y ambiente',
        eu: 'Kultura eta giroa',
        en: 'Culture & Vibe',
        fr: 'Culture & Ambiance',
        de: 'Kultur & Atmosphäre',
        it: 'Cultura e Atmosfera',
      },
      tooltip: {
        es: 'Oferta de museos, monumentos, historia viva, ocio callejero y vida de terrazas.',
        eu: 'Museoak, monumentuak, historia bizia, kaleko aisialdia eta terrazetako giroa.',
        en: 'Museums, monuments, living history, vibrant street life, and cafe terrace culture.',
        fr: 'Musées, monuments, histoire vivante, vie de rue animée et culture des terrasses de cafés.',
        de: 'Museen, Monumente, lebendige Geschichte, lebendiges Straßenleben und Café-Terrassen-Kultur.',
        it: 'Musei, monumenti, storia viva, vita di strada vibrante e cultura delle terrazze dei caffè.',
      },
    },
  } as CategoryCriteria,
} as const;

export function langKey(lang: LangCode): LangKey {
  return LANG_MAP[lang] ?? 'en';
}

export function criterionName(category: Category, index: 0 | 1 | 2, lang: LangCode): string {
  const key = `c${index + 1}` as 'c1' | 'c2' | 'c3';
  return RATINGS_I18N[category][key].name[langKey(lang)];
}

export function criterionTooltip(category: Category, index: 0 | 1 | 2, lang: LangCode): string {
  const key = `c${index + 1}` as 'c1' | 'c2' | 'c3';
  return RATINGS_I18N[category][key].tooltip[langKey(lang)];
}

export function generalTitle(lang: LangCode): string {
  return RATINGS_I18N.generalTitle[langKey(lang)];
}

export function generalQuestion(category: Category, lang: LangCode): string {
  return RATINGS_I18N.generalQuestion[category][langKey(lang)];
}

export type CriterionIndex = 0 | 1 | 2;
