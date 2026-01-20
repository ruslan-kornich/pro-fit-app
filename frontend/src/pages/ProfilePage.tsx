import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../features/auth/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { updateCurrentUser } from '../api/users';
import { toast } from '../utils/toast';
import { cn } from '../utils/cn';
import type { Goal, Language } from '../types/user';

export default function ProfilePage() {
  const { t } = useTranslation('profile');
  const { t: tCommon } = useTranslation('common');
  const { user, logout, refreshUser } = useAuth();
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [activityLevel, setActivityLevel] = useState<number>(1.2);
  const [goal, setGoal] = useState<Goal>('maintain');
  const [language, setLanguage] = useState<Language>('uk');

  const ACTIVITY_LEVELS = [
    { value: 1.2, labelKey: 'activityLevel.sedentary', descKey: 'activityLevel.sedentaryDesc' },
    { value: 1.375, labelKey: 'activityLevel.lightlyActive', descKey: 'activityLevel.lightlyActiveDesc' },
    { value: 1.55, labelKey: 'activityLevel.moderatelyActive', descKey: 'activityLevel.moderatelyActiveDesc' },
    { value: 1.725, labelKey: 'activityLevel.veryActive', descKey: 'activityLevel.veryActiveDesc' },
    { value: 1.9, labelKey: 'activityLevel.extraActive', descKey: 'activityLevel.extraActiveDesc' },
  ];

  const GOALS: { value: Goal; labelKey: string; descKey: string }[] = [
    { value: 'lose', labelKey: 'goal.lose', descKey: 'goal.loseDesc' },
    { value: 'maintain', labelKey: 'goal.maintain', descKey: 'goal.maintainDesc' },
    { value: 'gain', labelKey: 'goal.gain', descKey: 'goal.gainDesc' },
  ];

  const LANGUAGES: { value: Language; label: string }[] = [
    { value: 'uk', label: 'Українська' },
    { value: 'en', label: 'English' },
  ];

  useEffect(() => {
    if (user?.profile) {
      setName(user.profile.name || '');
      setHeight(user.profile.height?.toString() || '');
      setWeight(user.profile.weight?.toString() || '');
      setAge(user.profile.age?.toString() || '');
      setGender(user.profile.gender || '');
      setActivityLevel(user.profile.activity_level || 1.2);
      setGoal(user.profile.goal || 'maintain');
      setLanguage(user.profile.language || 'uk');
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateCurrentUser({
        name: name || undefined,
        height: height ? parseFloat(height) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        age: age ? parseInt(age, 10) : undefined,
        gender: gender || undefined,
        activity_level: activityLevel,
        goal,
        language,
      });
      await refreshUser();
      toast.success(t('toast.updated'));
    } catch {
      toast.error(t('toast.updateFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-600 text-sm">{user?.email}</p>
      </header>

      {user?.profile?.daily_calorie_norm && (
        <Card className="bg-primary-50 border border-primary-200">
          <div className="text-center">
            <p className="text-sm text-primary-700">{t('dailyCalorieGoal')}</p>
            <p className="text-3xl font-bold text-primary-600">
              {user.profile.daily_calorie_norm} {tCommon('units.kcal')}
            </p>
          </div>
        </Card>
      )}

      <Card>
        <h2 className="font-semibold text-gray-900 mb-4">{t('personalInfo.title')}</h2>
        <div className="space-y-4">
          <Input
            label={t('personalInfo.name')}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t('personalInfo.namePlaceholder')}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('personalInfo.height')}
              type="number"
              value={height}
              onChange={(event) => setHeight(event.target.value)}
              placeholder="175"
            />
            <Input
              label={t('personalInfo.weight')}
              type="number"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
              placeholder="70"
            />
          </div>

          <Input
            label={t('personalInfo.age')}
            type="number"
            value={age}
            onChange={(event) => setAge(event.target.value)}
            placeholder="25"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('personalInfo.gender')}
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={cn(
                  'flex-1 py-2 px-4 rounded-lg border-2 text-sm font-medium transition-colors',
                  gender === 'male'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                )}
              >
                {t('personalInfo.male')}
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={cn(
                  'flex-1 py-2 px-4 rounded-lg border-2 text-sm font-medium transition-colors',
                  gender === 'female'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                )}
              >
                {t('personalInfo.female')}
              </button>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-gray-900 mb-4">{t('goal.title')}</h2>
        <div className="flex gap-2">
          {GOALS.map((goalOption) => (
            <button
              key={goalOption.value}
              type="button"
              onClick={() => setGoal(goalOption.value)}
              className={cn(
                'flex-1 py-3 px-2 rounded-lg border-2 text-center transition-colors',
                goal === goalOption.value
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <p className="font-medium text-gray-900 text-sm">{t(goalOption.labelKey)}</p>
              <p className="text-xs text-gray-500">{t(goalOption.descKey)}</p>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-gray-900 mb-4">{t('activityLevel.title')}</h2>
        <div className="space-y-2">
          {ACTIVITY_LEVELS.map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() => setActivityLevel(level.value)}
              className={cn(
                'w-full text-left p-3 rounded-lg border-2 transition-colors',
                activityLevel === level.value
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <p className="font-medium text-gray-900">{t(level.labelKey)}</p>
              <p className="text-sm text-gray-500">{t(level.descKey)}</p>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-gray-900 mb-4">{t('language.title')}</h2>
        <div className="flex gap-3">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.value}
              type="button"
              onClick={() => setLanguage(lang.value)}
              className={cn(
                'flex-1 py-2 px-4 rounded-lg border-2 text-sm font-medium transition-colors',
                language === lang.value
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-300 text-gray-600 hover:border-gray-400'
              )}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </Card>

      <Button className="w-full" onClick={handleSave} loading={saving}>
        {t('saveChanges')}
      </Button>

      <Button variant="secondary" className="w-full" onClick={logout}>
        {t('signOut')}
      </Button>
    </div>
  );
}
