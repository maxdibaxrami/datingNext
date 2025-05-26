export const defaultLocale = 'en';

export const timeZone = 'Europe/Amsterdam';

export const locales = [defaultLocale, 'ru', 'fa', 'ar'] as const;

export const localesMap = [
  { key: 'en', title: 'English', flag:'/assets/gb.svg' },
  { key: 'ru', title: 'Русский', flag:'/assets/ru.svg' },
  { key: 'fa', title: 'فارسی', flag:'/assets/ir.svg' },
  { key: 'ar', title: 'العربية', flag:'/assets/sa.svg' },

];
