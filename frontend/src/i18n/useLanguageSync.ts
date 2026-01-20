import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../features/auth/AuthContext';

export function useLanguageSync() {
  const { i18n } = useTranslation();
  const { user } = useAuth();

  useEffect(() => {
    const userLanguage = user?.profile?.language;
    if (userLanguage && i18n.language !== userLanguage) {
      i18n.changeLanguage(userLanguage);
    }
  }, [user?.profile?.language, i18n]);
}
