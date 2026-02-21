import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../features/auth/AuthContext';
import Card from '../components/Card';
import Input from '../components/Input';
import AIRecommendationModal from '../components/AIRecommendationModal';
import WeightEntryModal from '../features/statistics/WeightEntryModal';
import { updateCurrentUser } from '../api/users';
import { createWeightEntry } from '../api/weight';
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
  const [calorieGoal, setCalorieGoal] = useState('');
  const [isCalorieGoalManual, setIsCalorieGoalManual] = useState(false);
  const [isEditingCalories, setIsEditingCalories] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);

  const ACTIVITY_LEVELS = [
    { value: 1.2, labelKey: 'activityLevel.sedentary', descKey: 'activityLevel.sedentaryDesc' },
    { value: 1.375, labelKey: 'activityLevel.lightlyActive', descKey: 'activityLevel.lightlyActiveDesc' },
    { value: 1.55, labelKey: 'activityLevel.moderatelyActive', descKey: 'activityLevel.moderatelyActiveDesc' },
    { value: 1.725, labelKey: 'activityLevel.veryActive', descKey: 'activityLevel.veryActiveDesc' },
    { value: 1.9, labelKey: 'activityLevel.extraActive', descKey: 'activityLevel.extraActiveDesc' },
  ];

  const GOALS: { value: Goal; labelKey: string; descKey: string; icon: React.ReactNode }[] = [
    {
      value: 'lose',
      labelKey: 'goal.lose',
      descKey: 'goal.loseDesc',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
        </svg>
      ),
    },
    {
      value: 'maintain',
      labelKey: 'goal.maintain',
      descKey: 'goal.maintainDesc',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
        </svg>
      ),
    },
    {
      value: 'gain',
      labelKey: 'goal.gain',
      descKey: 'goal.gainDesc',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      ),
    },
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
      setCalorieGoal(user.profile.daily_calorie_norm?.toString() || '');
      setIsCalorieGoalManual(user.profile.is_calorie_goal_manual || false);
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
        daily_calorie_norm: isCalorieGoalManual && calorieGoal ? parseInt(calorieGoal, 10) : undefined,
        is_calorie_goal_manual: isCalorieGoalManual,
      });
      await refreshUser();
      setIsEditingCalories(false);
      toast.success(t('toast.updated'));
    } catch {
      toast.error(t('toast.updateFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleResetToAuto = () => {
    setIsCalorieGoalManual(false);
    setIsEditingCalories(false);
  };

  const handleApplyAIRecommendation = (calories: number) => {
    setCalorieGoal(calories.toString());
    setIsCalorieGoalManual(true);
    setShowAIModal(false);
  };

  const handleSaveWeight = async (data: { weight: number; recorded_date: string; note?: string | null }) => {
    await createWeightEntry(data);
    setWeight(data.weight.toString());
    toast.success(t('toast.weightRecorded'));
  };

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <header className="flex justify-between items-start pt-1">
        <div>
          <h1 className="text-xl font-bold text-surface-900 tracking-tight">{t('title')}</h1>
          <p className="text-surface-400 text-sm font-medium">{user?.email}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-[12px] font-semibold text-sm shadow-button hover:shadow-button-hover transition-all active:scale-[0.97] disabled:opacity-50"
        >
          {saving ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          )}
          {t('saveChanges')}
        </button>
      </header>

      <Card className={cn(
        "border",
        isCalorieGoalManual ? "bg-amber-50/80 border-amber-200/60" : "bg-primary-50/80 border-primary-200/60"
      )}>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <p className={cn(
              "text-sm font-medium",
              isCalorieGoalManual ? "text-amber-700" : "text-primary-700"
            )}>{t('dailyCalorieGoal')}</p>
            <span className={cn(
              "text-[10px] px-2 py-0.5 rounded-pill font-semibold uppercase tracking-wide",
              isCalorieGoalManual
                ? "bg-amber-200/80 text-amber-800"
                : "bg-primary-200/80 text-primary-800"
            )}>
              {isCalorieGoalManual ? t('calorieGoal.custom') : t('calorieGoal.auto')}
            </span>
          </div>

          {isEditingCalories ? (
            <div className="flex items-center justify-center gap-2">
              <input
                type="number"
                value={calorieGoal}
                onChange={(event) => {
                  setCalorieGoal(event.target.value);
                  setIsCalorieGoalManual(true);
                }}
                className="w-24 text-2xl font-bold text-center bg-white border border-surface-200 rounded-[12px] p-1 focus:outline-none focus:ring-2 focus:ring-primary-400"
                min="500"
                max="10000"
              />
              <span className={cn(
                "text-xl font-bold",
                isCalorieGoalManual ? "text-amber-600" : "text-primary-600"
              )}>{tCommon('units.kcal')}</span>
            </div>
          ) : (
            <p className={cn(
              "text-3xl font-bold tracking-tight",
              isCalorieGoalManual ? "text-amber-600" : "text-primary-600"
            )}>
              {calorieGoal || user?.profile?.daily_calorie_norm || '—'} <span className="text-lg">{tCommon('units.kcal')}</span>
            </p>
          )}

          <div className="flex items-center justify-center gap-3 mt-3">
            <button
              type="button"
              onClick={() => setIsEditingCalories(!isEditingCalories)}
              className="text-sm text-surface-500 hover:text-surface-700 font-medium transition-colors"
            >
              {isEditingCalories ? t('calorieGoal.done') : t('calorieGoal.edit')}
            </button>
            <span className="text-surface-200">|</span>
            <button
              type="button"
              onClick={() => setShowAIModal(true)}
              className="flex items-center gap-1 text-sm text-accent-600 hover:text-accent-700 font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              {t('calorieGoal.askAI')}
            </button>
            {isCalorieGoalManual && (
              <>
                <span className="text-surface-200">|</span>
                <button
                  type="button"
                  onClick={handleResetToAuto}
                  className="text-sm text-surface-400 hover:text-surface-600 font-medium transition-colors"
                >
                  {t('calorieGoal.resetToAuto')}
                </button>
              </>
            )}
          </div>
        </div>
      </Card>

      <AIRecommendationModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onApply={handleApplyAIRecommendation}
      />

      <Card>
        <h2 className="font-bold text-surface-900 mb-4">{t('personalInfo.title')}</h2>
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
            <div>
              <label className="block text-sm font-medium text-surface-600 mb-1.5">
                {t('personalInfo.weight')}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={weight}
                  onChange={(event) => setWeight(event.target.value)}
                  placeholder="70"
                  className="flex-1 w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-input focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowWeightModal(true)}
                  className="px-3 py-2 gradient-primary text-white rounded-input hover:shadow-button transition-all active:scale-[0.97]"
                  title={t('personalInfo.recordWeight')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <Input
            label={t('personalInfo.age')}
            type="number"
            value={age}
            onChange={(event) => setAge(event.target.value)}
            placeholder="25"
          />

          <div>
            <label className="block text-sm font-medium text-surface-600 mb-2">
              {t('personalInfo.gender')}
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={cn(
                  'flex-1 py-2.5 px-4 rounded-[12px] border-2 text-sm font-semibold transition-all duration-200 ease-spring',
                  gender === 'male'
                    ? 'border-primary-400 bg-primary-50 text-primary-700'
                    : 'border-surface-200 text-surface-500 hover:border-surface-300'
                )}
              >
                {t('personalInfo.male')}
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={cn(
                  'flex-1 py-2.5 px-4 rounded-[12px] border-2 text-sm font-semibold transition-all duration-200 ease-spring',
                  gender === 'female'
                    ? 'border-primary-400 bg-primary-50 text-primary-700'
                    : 'border-surface-200 text-surface-500 hover:border-surface-300'
                )}
              >
                {t('personalInfo.female')}
              </button>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="font-bold text-surface-900 mb-4">{t('goal.title')}</h2>
        <div className="flex gap-2">
          {GOALS.map((goalOption) => (
            <button
              key={goalOption.value}
              type="button"
              onClick={() => setGoal(goalOption.value)}
              className={cn(
                'flex-1 py-3 px-2 rounded-button border-2 text-center transition-all duration-200 ease-spring',
                goal === goalOption.value
                  ? 'border-primary-400 bg-primary-50'
                  : 'border-surface-200 hover:border-surface-300'
              )}
            >
              <div className={cn(
                'mx-auto mb-1.5',
                goal === goalOption.value ? 'text-primary-600' : 'text-surface-400'
              )}>
                {goalOption.icon}
              </div>
              <p className="font-semibold text-surface-900 text-sm">{t(goalOption.labelKey)}</p>
              <p className="text-[10px] text-surface-400 mt-0.5">{t(goalOption.descKey)}</p>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
          <h2 className="font-bold text-surface-900">{t('activityLevel.title')}</h2>
        </div>
        <div className="space-y-2">
          {ACTIVITY_LEVELS.map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() => setActivityLevel(level.value)}
              className={cn(
                'w-full text-left p-3 rounded-button border-2 transition-all duration-200 ease-spring',
                activityLevel === level.value
                  ? 'border-primary-400 bg-primary-50'
                  : 'border-surface-200 hover:border-surface-300'
              )}
            >
              <p className="font-semibold text-surface-900 text-sm">{t(level.labelKey)}</p>
              <p className="text-xs text-surface-400">{t(level.descKey)}</p>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
          </svg>
          <h2 className="font-bold text-surface-900">{t('language.title')}</h2>
        </div>
        <div className="flex gap-3">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.value}
              type="button"
              onClick={() => setLanguage(lang.value)}
              className={cn(
                'flex-1 py-2.5 px-4 rounded-button border-2 text-sm font-semibold transition-all duration-200 ease-spring',
                language === lang.value
                  ? 'border-primary-400 bg-primary-50 text-primary-700'
                  : 'border-surface-200 text-surface-500 hover:border-surface-300'
              )}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </Card>

      <button
        onClick={logout}
        className="w-full py-3 px-4 bg-surface-100 hover:bg-surface-200 text-surface-600 font-semibold rounded-button transition-all active:scale-[0.98] flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
        </svg>
        {t('signOut')}
      </button>

      <WeightEntryModal
        isOpen={showWeightModal}
        onClose={() => setShowWeightModal(false)}
        onSubmit={handleSaveWeight}
      />
    </div>
  );
}
