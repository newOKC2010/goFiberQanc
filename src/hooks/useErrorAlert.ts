'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { showAlert } from '@/global/globalSwal';
import { useLang } from '@/global/globalLang';
import tr, { t } from '@/global/translations';

export function useErrorAlert() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { lang } = useLang();

  useEffect(() => {
    const error = searchParams.get('error');
    if (!error) return;

    const e = tr.errors;
    switch (error) {
      case 'no_token':
        showAlert(t(e.noToken.title, lang), t(e.noToken.desc, lang), 'warning', {}, undefined, lang);
        break;
      case 'auth_failed':
        showAlert(t(e.authFailed.title, lang), t(e.authFailed.desc, lang), 'warning', {}, undefined, lang);
        break;
      case 'no_permission':
        showAlert(t(e.noPermission.title, lang), t(e.noPermission.desc, lang), 'error', {}, undefined, lang);
        break;
      case 'network_error':
        showAlert(t(e.network.title, lang), t(e.network.desc, lang), 'error', {}, undefined, lang);
        break;
      default:
        showAlert(t(e.unknown.title, lang), t(e.unknown.desc, lang), 'error', {}, undefined, lang);
    }

    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete('error');
    router.replace(newUrl.pathname + newUrl.search, { scroll: false });
  }, [searchParams, router, lang]);
}