'use client';

import { LangProvider } from '@/global/globalLang';

export default function Providers({ children }: { children: React.ReactNode }) {
  return <LangProvider>{children}</LangProvider>;
}
