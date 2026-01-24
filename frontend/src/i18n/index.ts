import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ukCommon from './locales/uk/common.json';
import ukAuth from './locales/uk/auth.json';
import ukDashboard from './locales/uk/dashboard.json';
import ukFood from './locales/uk/food.json';
import ukProfile from './locales/uk/profile.json';
import ukRecommendations from './locales/uk/recommendations.json';
import ukOnboarding from './locales/uk/onboarding.json';
import ukStatistics from './locales/uk/statistics.json';

import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enDashboard from './locales/en/dashboard.json';
import enFood from './locales/en/food.json';
import enProfile from './locales/en/profile.json';
import enRecommendations from './locales/en/recommendations.json';
import enOnboarding from './locales/en/onboarding.json';
import enStatistics from './locales/en/statistics.json';

const resources = {
  uk: {
    common: ukCommon,
    auth: ukAuth,
    dashboard: ukDashboard,
    food: ukFood,
    profile: ukProfile,
    recommendations: ukRecommendations,
    onboarding: ukOnboarding,
    statistics: ukStatistics,
  },
  en: {
    common: enCommon,
    auth: enAuth,
    dashboard: enDashboard,
    food: enFood,
    profile: enProfile,
    recommendations: enRecommendations,
    onboarding: enOnboarding,
    statistics: enStatistics,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'uk',
  fallbackLng: 'uk',
  defaultNS: 'common',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
