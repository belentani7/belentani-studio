const LANGUAGES = {
  es: 'Español', en: 'English', ca: 'Català', pt: 'Português', fr: 'Français',
  de: 'Deutsch', it: 'Italiano', pl: 'Polski', ro: 'Română', ar: 'العربية',
  zh: '中文', ja: '日本語', ko: '한국어', hi: 'हिन्दी', bn: 'বাংলা',
  ru: 'Русский', uk: 'Українська', tr: 'Türkçe', vi: 'Tiếng Việt', th: 'ไทย',
  id: 'Bahasa Indonesia', ms: 'Bahasa Melayu', tl: 'Tagalog', fa: 'فارسی', ur: 'اردو',
  sw: 'Kiswahili', am: 'አማርኛ', so: 'Soomaali', ne: 'नेपाली', ta: 'தமிழ்',
  te: 'తెలుగు', ml: 'മലയാളം', kn: 'ಕನ್ನಡ', gu: 'ગુજરાતી', mr: 'मराठी', bg: 'Български', cs: 'Čeština', hu: 'Magyar', el: 'Ελληνικά'
};

export function getLanguages() {
  return LANGUAGES;
}

export function getLanguageName(code: string): string {
  return LANGUAGES[code as keyof typeof LANGUAGES] || code;
}
