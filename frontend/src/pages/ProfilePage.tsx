import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../features/auth/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
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

  const GOALS: { value: Goal; labelKey: string; descKey: string; emoji: string }[] = [
    { value: 'lose', labelKey: 'goal.lose', descKey: 'goal.loseDesc', emoji: '🔥' },
    { value: 'maintain', labelKey: 'goal.maintain', descKey: 'goal.maintainDesc', emoji: '⚖️' },
    { value: 'gain', labelKey: 'goal.gain', descKey: 'goal.gainDesc', emoji: '💪' },
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
    <div className="p-4 space-y-4">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 text-sm">{user?.email}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="p-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors disabled:opacity-50"
          title={t('saveChanges')}
        >
          {saving ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3h10l4 4v12a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 3v4h6V3" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 14a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          )}
        </button>
      </header>

      <Card className={cn(
        "border",
        isCalorieGoalManual ? "bg-amber-50 border-amber-200" : "bg-primary-50 border-primary-200"
      )}>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <p className={cn(
              "text-sm",
              isCalorieGoalManual ? "text-amber-700" : "text-primary-700"
            )}>{t('dailyCalorieGoal')}</p>
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full font-medium",
              isCalorieGoalManual
                ? "bg-amber-200 text-amber-800"
                : "bg-primary-200 text-primary-800"
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
                className="w-24 text-2xl font-bold text-center border rounded-lg p-1"
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
              "text-3xl font-bold",
              isCalorieGoalManual ? "text-amber-600" : "text-primary-600"
            )}>
              {calorieGoal || user?.profile?.daily_calorie_norm || '—'} {tCommon('units.kcal')}
            </p>
          )}

          <div className="flex items-center justify-center gap-2 mt-3">
            <button
              type="button"
              onClick={() => setIsEditingCalories(!isEditingCalories)}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              {isEditingCalories ? t('calorieGoal.done') : t('calorieGoal.edit')}
            </button>
            <button
              type="button"
              onClick={() => setShowAIModal(true)}
              className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14.5a6.5 6.5 0 110-13 6.5 6.5 0 010 13zm.75-9.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM10 9a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 9z" />
              </svg>
              {t('calorieGoal.askAI')}
            </button>
            {isCalorieGoalManual && (
              <button
                type="button"
                onClick={handleResetToAuto}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                {t('calorieGoal.resetToAuto')}
              </button>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('personalInfo.weight')}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={weight}
                  onChange={(event) => setWeight(event.target.value)}
                  placeholder="70"
                  className="flex-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowWeightModal(true)}
                  className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  title={t('personalInfo.recordWeight')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
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
                'flex-1 py-3 px-2 rounded-button border-2 text-center transition-all duration-200',
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
        <h2 className="font-semibold text-gray-900 mb-4">🏃 {t('activityLevel.title')}</h2>
        <div className="space-y-2">
          {ACTIVITY_LEVELS.map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() => setActivityLevel(level.value)}
              className={cn(
                'w-full text-left p-3 rounded-button border-2 transition-all duration-200',
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
        <h2 className="font-semibold text-gray-900 mb-4">🌐 {t('language.title')}</h2>
        <div className="flex gap-3">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.value}
              type="button"
              onClick={() => setLanguage(lang.value)}
              className={cn(
                'flex-1 py-2 px-4 rounded-button border-2 text-sm font-medium transition-all duration-200',
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

      <Button variant="secondary" className="w-full" onClick={logout}>
        {t('signOut')}
      </Button>

      <WeightEntryModal
        isOpen={showWeightModal}
        onClose={() => setShowWeightModal(false)}
        onSubmit={handleSaveWeight}
      />
    </div>
  );
}
