import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../features/auth/AuthContext';
import { updateCurrentUser } from '../api/users';
import { getOnboarding, updateOnboardingStep, completeOnboarding } from '../api/onboarding';
import { toast } from '../utils/toast';
import Loading from '../components/Loading';
import {
  OnboardingProgress,
  WelcomeStep,
  PhysicalDataStep,
  PersonalInfoStep,
  ActivityLevelStep,
  GoalStep,
  CalorieResultStep,
} from '../components/onboarding';
import type { Goal } from '../types/user';

const TOTAL_STEPS = 6;

interface FormData {
  name: string;
  height: string;
  weight: string;
  age: string;
  gender: string;
  activityLevel: number;
  goal: Goal;
}

interface FormErrors {
  name?: string;
  height?: string;
  weight?: string;
  age?: string;
  gender?: string;
}

function calculateCalories(
  weight: number,
  height: number,
  age: number,
  gender: string,
  activityLevel: number,
  goal: Goal
): number {
  const baseBmr = 10 * weight + 6.25 * height - 5 * age;
  const bmr = gender === 'male' ? baseBmr + 5 : baseBmr - 161;
  const tdee = bmr * activityLevel;

  const goalAdjustments: Record<Goal, number> = {
    lose: -500,
    maintain: 0,
    gain: 300,
  };

  return Math.round(tdee + goalAdjustments[goal]);
}

export default function OnboardingPage() {
  const { t } = useTranslation('onboarding');
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<FormData>({
    name: '',
    height: '',
    weight: '',
    age: '',
    gender: '',
    activityLevel: 1.2,
    goal: 'maintain',
  });

  const [finalCalories, setFinalCalories] = useState<number | null>(null);

  useEffect(() => {
    const loadOnboarding = async () => {
      try {
        const onboarding = await getOnboarding();
        setCurrentStep(onboarding.current_step);

        if (user?.profile) {
          setFormData({
            name: user.profile.name || '',
            height: user.profile.height?.toString() || '',
            weight: user.profile.weight?.toString() || '',
            age: user.profile.age?.toString() || '',
            gender: user.profile.gender || '',
            activityLevel: user.profile.activity_level || 1.2,
            goal: user.profile.goal || 'maintain',
          });
        }
      } catch {
        // If failed to fetch, start from step 1
      } finally {
        setLoading(false);
      }
    };

    loadOnboarding();
  }, [user]);

  const calculatedCalories =
    formData.height && formData.weight && formData.age && formData.gender
      ? calculateCalories(
          parseFloat(formData.weight),
          parseFloat(formData.height),
          parseInt(formData.age, 10),
          formData.gender,
          formData.activityLevel,
          formData.goal
        )
      : 2000;

  const validateStep = (): boolean => {
    const newErrors: FormErrors = {};

    switch (currentStep) {
      case 1:
        if (!formData.name.trim()) {
          newErrors.name = t('validation.nameRequired');
        }
        break;
      case 2:
        if (!formData.height) {
          newErrors.height = t('validation.heightRequired');
        }
        if (!formData.weight) {
          newErrors.weight = t('validation.weightRequired');
        }
        break;
      case 3:
        if (!formData.age) {
          newErrors.age = t('validation.ageRequired');
        }
        if (!formData.gender) {
          newErrors.gender = t('validation.genderRequired');
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveCurrentStepData = async () => {
    const updateData: Record<string, unknown> = {};

    switch (currentStep) {
      case 1:
        updateData.name = formData.name;
        break;
      case 2:
        updateData.height = parseFloat(formData.height);
        updateData.weight = parseFloat(formData.weight);
        break;
      case 3:
        updateData.age = parseInt(formData.age, 10);
        updateData.gender = formData.gender;
        break;
      case 4:
        updateData.activity_level = formData.activityLevel;
        break;
      case 5:
        updateData.goal = formData.goal;
        break;
    }

    if (Object.keys(updateData).length > 0) {
      await updateCurrentUser(updateData);
    }
  };

  const handleNext = async () => {
    if (!validateStep()) return;

    setSaving(true);
    try {
      await saveCurrentStepData();

      const nextStep = currentStep + 1;
      await updateOnboardingStep(nextStep);
      setCurrentStep(nextStep);
      setErrors({});
    } catch {
      toast.error('Failed to save progress');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = async () => {
    if (currentStep > 1) {
      setSaving(true);
      try {
        const prevStep = currentStep - 1;
        await updateOnboardingStep(prevStep);
        setCurrentStep(prevStep);
        setErrors({});
      } catch {
        toast.error('Failed to go back');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      const calorieValue = finalCalories ?? calculatedCalories;

      await updateCurrentUser({
        daily_calorie_norm: calorieValue,
        is_calorie_goal_manual: finalCalories !== null,
      });

      await completeOnboarding();
      await refreshUser();
      navigate('/', { replace: true });
    } catch {
      toast.error('Failed to complete onboarding');
    } finally {
      setSaving(false);
    }
  };

  const handleCaloriesChange = (calories: number) => {
    setFinalCalories(calories);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <WelcomeStep
            name={formData.name}
            onNameChange={(name) => setFormData({ ...formData, name })}
            error={errors.name}
          />
        );
      case 2:
        return (
          <PhysicalDataStep
            height={formData.height}
            weight={formData.weight}
            onHeightChange={(height) => setFormData({ ...formData, height })}
            onWeightChange={(weight) => setFormData({ ...formData, weight })}
            errors={{ height: errors.height, weight: errors.weight }}
          />
        );
      case 3:
        return (
          <PersonalInfoStep
            age={formData.age}
            gender={formData.gender}
            onAgeChange={(age) => setFormData({ ...formData, age })}
            onGenderChange={(gender) => setFormData({ ...formData, gender })}
            errors={{ age: errors.age, gender: errors.gender }}
          />
        );
      case 4:
        return (
          <ActivityLevelStep
            activityLevel={formData.activityLevel}
            onActivityLevelChange={(activityLevel) => setFormData({ ...formData, activityLevel })}
          />
        );
      case 5:
        return (
          <GoalStep goal={formData.goal} onGoalChange={(goal) => setFormData({ ...formData, goal })} />
        );
      case 6:
        return (
          <CalorieResultStep
            calculatedCalories={finalCalories ?? calculatedCalories}
            onCaloriesChange={handleCaloriesChange}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="h-full bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 flex flex-col overflow-hidden relative">
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="p-4 pt-8 flex-shrink-0 relative z-10">
        <OnboardingProgress currentStep={currentStep} totalSteps={TOTAL_STEPS} />
      </div>

      <div className="flex-1 flex flex-col justify-center px-4 overflow-y-auto relative z-10">
        <div className="animate-fadeIn" key={currentStep}>{renderStep()}</div>
      </div>

      <div className="px-4 pt-4 pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)] flex gap-3 flex-shrink-0 relative z-10">
        {currentStep > 1 && (
          <button
            type="button"
            onClick={handleBack}
            disabled={saving}
            className="flex-1 py-4 px-6 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-[16px] font-semibold transition-all disabled:opacity-50 active:scale-[0.97]"
          >
            {t('back')}
          </button>
        )}
        <button
          type="button"
          onClick={currentStep === TOTAL_STEPS ? handleFinish : handleNext}
          disabled={saving}
          className="flex-1 py-4 px-6 bg-white text-primary-700 rounded-[16px] font-bold transition-all hover:bg-white/90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-float active:scale-[0.97]"
        >
          {saving && (
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
          {currentStep === TOTAL_STEPS ? t('finish') : t('next')}
        </button>
      </div>
    </div>
  );
}
