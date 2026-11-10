export const PASSPORT_OWNER = { name: 'Jon Arratia', handle: 'jon_travels' } as const;

export const FOLLOWERS_TOTAL = 142;

export interface SocialProfile {
  name: string;
  handle: string;
  hue: number;
}

const FIRST_NAMES = ['Ane', 'Mikel', 'Leire', 'Iker', 'Maite', 'Unai', 'Nerea', 'Aitor', 'Itziar', 'Gorka', 'Miren', 'Eneko', 'Lucía', 'Pablo', 'Sara', 'Hugo', 'Clara', 'Diego', 'Marta', 'Álvaro'];
const LAST_NAMES = ['Etxeberria', 'Zubizarreta', 'Mendia', 'Aguirre', 'Ugarte', 'Larrea', 'Ibarra', 'Garmendia', 'Olaizola', 'Urquijo', 'Lekuona', 'Arbelaiz', 'Goikoetxea', 'Solaun', 'Amezaga', 'Beloki', 'Ruiz', 'Vidal', 'Ferrer', 'Castro'];

function makeProfile(index: number): SocialProfile {
  const first = FIRST_NAMES[(index * 3) % FIRST_NAMES.length];
  const last = LAST_NAMES[(index * 7) % LAST_NAMES.length];
  const handle = `${first}_${last}${index + 1}`.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return { name: `${first} ${last}`, handle, hue: (index * 47) % 360 };
}

export function seedFollowers(): SocialProfile[] {
  return Array.from({ length: FOLLOWERS_TOTAL }, (_, i) => makeProfile(i));
}
