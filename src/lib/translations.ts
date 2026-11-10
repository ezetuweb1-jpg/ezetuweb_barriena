import type { LangCode } from './types';

export type SocialLangKey = 'es' | 'eu' | 'en' | 'fr' | 'de' | 'it';

type Localized = Record<SocialLangKey, string>;

export const SOCIAL_LANG_KEY: Record<LangCode, SocialLangKey> = {
  EUS: 'eu',
  ES: 'es',
  EN: 'en',
  FR: 'fr',
  DE: 'de',
  IT: 'it',
};

export const SOCIAL_I18N = {
  followBtn: {
    notFollowing: { es: "Seguir", eu: "Jarraitu", en: "Follow", fr: "Suivre", de: "Folgen", it: "Segui" },
    following: { es: "Siguiendo", eu: "Jarraitzen", en: "Following", fr: "Suivi(e)", de: "Gefolgt", it: "Seguito" },
    unfollow: { es: "Dejar de seguir", eu: "Utzi jarraitzeari", en: "Unfollow", fr: "Ne plus suivre", de: "Entfolgen", it: "Smetti di seguire" },
  },
  followersLabel: { es: "seguidores", eu: "jarraitzaile", en: "followers", fr: "abonnés", de: "Follower", it: "follower" },
  followingTab: { es: "Siguiendo", eu: "Jarraitzen", en: "Following", fr: "Abonnements", de: "Gefolgt", it: "Seguiti" },
  followingEmpty: {
    es: "Aún no sigues a ningún viajero. Descubre fotógrafos en la galería y pulsa 'Seguir'.",
    eu: "Oraindik ez duzu argazkilaririk jarraitzen. Arakatu galeria eta egin klik 'Jarraitu' botoian haien azken argazkiak hemen ikusteko.",
    en: "You are not following any photographers yet. Explore the gallery and follow creators to see their latest shots here.",
    fr: "Vous ne suivez aucun photographe pour le moment. Explorez la galerie pour voir leurs photos ici.",
    de: "Du folgst noch keinen Fotografen. Entdecke die Galerie, um ihre Fotos hier zu sehen.",
    it: "Non segui ancora nessun fotografo. Esplora la galleria per vedere le loro foto qui.",
  },
  travelerBadge: {
    es: (percent: number, count: number) => `${percent}% del mundo explorado · ${count} rincones`,
    eu: (percent: number, count: number) => `%${percent} mundua esploratua · ${count} leku`,
    en: (percent: number, count: number) => `${percent}% of world explored · ${count} spots`,
    fr: (percent: number, count: number) => `${percent}% du monde exploré · ${count} lieux`,
    de: (percent: number, count: number) => `${percent}% der Welt erkundet · ${count} Orte`,
    it: (percent: number, count: number) => `${percent}% del mondo esplorato · ${count} luoghi`,
  } satisfies Record<SocialLangKey, (percent: number, count: number) => string>,
  searchAuthorsHeader: { es: "Fotógrafos", eu: "Argazkilariak", en: "Photographers", fr: "Photographes", de: "Fotografen", it: "Fotografi" },
  followFailed: { es: "No se pudo actualizar. Inténtalo de nuevo.", eu: "Ezin izan da eguneratu. Saiatu berriro.", en: "Could not update. Please try again.", fr: "Mise à jour impossible. Réessaie.", de: "Konnte nicht aktualisiert werden. Bitte erneut versuchen.", it: "Impossibile aggiornare. Riprova." },
  followedToast: {
    es: (name: string) => `Siguiendo a ${name}`,
    eu: (name: string) => `${name} jarraitzen duzu`,
    en: (name: string) => `Following ${name}`,
    fr: (name: string) => `Vous suivez ${name}`,
    de: (name: string) => `Du folgst ${name}`,
    it: (name: string) => `Ora segui ${name}`,
  } satisfies Record<SocialLangKey, (name: string) => string>,
  unfollowedToast: {
    es: (name: string) => `Has dejado de seguir a ${name}`,
    eu: (name: string) => `${name} jarraitzeari utzi diozu`,
    en: (name: string) => `You unfollowed ${name}`,
    fr: (name: string) => `Vous ne suivez plus ${name}`,
    de: (name: string) => `Du folgst ${name} nicht mehr`,
    it: (name: string) => `Non segui più ${name}`,
  } satisfies Record<SocialLangKey, (name: string) => string>,
};

export const AVATAR_I18N = {
  changePhoto: { es: "Cambiar foto de perfil", eu: "Aldatu profileko argazkia", en: "Change profile picture", fr: "Changer la photo de profil", de: "Profilbild ändern", it: "Cambia foto profilo" },
  removePhoto: { es: "Eliminar foto", eu: "Kendu argazkia", en: "Remove picture", fr: "Supprimer la photo", de: "Foto entfernen", it: "Rimuovi foto" },
  uploadFailed: { es: "No se pudo cargar la imagen. Prueba con otra.", eu: "Ezin izan da irudia kargatu. Saiatu beste batekin.", en: "Could not load the image. Try another one.", fr: "Impossible de charger l'image. Essaie une autre.", de: "Das Bild konnte nicht geladen werden. Versuche ein anderes.", it: "Impossibile caricare l'immagine. Prova con un'altra." },
};

export function avatarText(lang: LangCode) {
  const key = SOCIAL_LANG_KEY[lang];
  return {
    changePhoto: AVATAR_I18N.changePhoto[key],
    removePhoto: AVATAR_I18N.removePhoto[key],
    uploadFailed: AVATAR_I18N.uploadFailed[key],
  };
}

export function socialText(lang: LangCode) {
  const key = SOCIAL_LANG_KEY[lang];
  return {
    follow: SOCIAL_I18N.followBtn.notFollowing[key],
    following: SOCIAL_I18N.followBtn.following[key],
    unfollow: SOCIAL_I18N.followBtn.unfollow[key],
    followersLabel: SOCIAL_I18N.followersLabel[key],
    followingTab: SOCIAL_I18N.followingTab[key],
    followingEmpty: SOCIAL_I18N.followingEmpty[key],
    searchAuthorsHeader: SOCIAL_I18N.searchAuthorsHeader[key],
    followFailed: SOCIAL_I18N.followFailed[key],
    followedToast: SOCIAL_I18N.followedToast[key],
    unfollowedToast: SOCIAL_I18N.unfollowedToast[key],
    travelerBadge: SOCIAL_I18N.travelerBadge[key],
  };
}
