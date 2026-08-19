'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { type Lang } from '@/global/translations';

interface LangContextType {
  lang: Lang;
  toggleLang: () => void;
}

const LangContext = createContext<LangContextType>({
  lang: 'th',
  toggleLang: () => {},
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('th');
  const toggleLang = () => setLang((prev) => (prev === 'th' ? 'en' : 'th'));
  return <LangContext.Provider value={{ lang, toggleLang }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
