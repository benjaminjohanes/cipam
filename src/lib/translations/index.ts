import { fr } from './fr';
import { en } from './en';

export type Language = 'fr' | 'en';
export type TranslationKey = typeof fr;

export const translations = {
  fr,
  en,
} as const;

export const languageLabels: Record<Language, { label: string; flag: string }> = {
  fr: { label: 'Français', flag: '🇫🇷' },
  en: { label: 'English', flag: '🇬🇧' },
};

export { fr, en };
