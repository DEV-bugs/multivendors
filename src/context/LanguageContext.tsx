import React, { createContext, useContext, useState, useEffect } from 'react';
import { Locale, translations } from '../translations';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: keyof typeof translations['en'], replacements?: Record<string, string | number>) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>(() => {
    const saved = localStorage.getItem('marketsaas_locale');
    if (saved === 'ar' || saved === 'en') return saved;
    return 'en'; // default
  });

  useEffect(() => {
    localStorage.setItem('marketsaas_locale', locale);
    // Dynamically adjust root HTML dir and lang properties
    const root = document.documentElement;
    root.setAttribute('lang', locale);
    if (locale === 'ar') {
      root.setAttribute('dir', 'rtl');
    } else {
      root.setAttribute('dir', 'ltr');
    }
  }, [locale]);

  const isRTL = locale === 'ar';

  const t = (key: keyof typeof translations['en'], replacements?: Record<string, string | number>): string => {
    const translationSet = translations[locale];
    let text = (translationSet && translationSet[key]) || translations['en'][key] || String(key);
    
    if (replacements) {
      Object.entries(replacements).forEach(([placeholder, val]) => {
        text = text.replace(`{${placeholder}}`, String(val));
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, isRTL }}>
      <div dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'font-sans text-right' : 'font-sans text-left'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
