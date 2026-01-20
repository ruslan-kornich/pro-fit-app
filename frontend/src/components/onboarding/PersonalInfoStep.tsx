import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/cn';

interface PersonalInfoStepProps {
  age: string;
  gender: string;
  onAgeChange: (age: string) => void;
  onGenderChange: (gender: string) => void;
  errors?: { age?: string; gender?: string };
}

export default function PersonalInfoStep({
  age,
  gender,
  onAgeChange,
  onGenderChange,
  errors,
}: PersonalInfoStepProps) {
  const { t } = useTranslation('onboarding');

  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <h1 className="text-3xl font-bold text-white mb-2">
        {t('personalInfo.title')}
      </h1>
      <p className="text-white/80 mb-8">
        {t('personalInfo.subtitle')}
      </p>

      <div className="w-full max-w-sm space-y-6">
        <div>
          <label className="block text-left text-white/90 text-sm font-medium mb-2">
            {t('personalInfo.age')}
          </label>
          <input
            type="number"
            value={age}
            onChange={(e) => onAgeChange(e.target.value)}
            placeholder={t('personalInfo.agePlaceholder')}
            className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent text-lg"
            min="10"
            max="120"
          />
          {errors?.age && <p className="text-red-300 text-sm mt-2 text-left">{errors.age}</p>}
        </div>

        <div>
          <label className="block text-left text-white/90 text-sm font-medium mb-2">
            {t('personalInfo.gender')}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onGenderChange('male')}
              className={cn(
                'py-4 px-4 rounded-xl border-2 font-medium transition-all',
                gender === 'male'
                  ? 'border-white bg-white/20 text-white'
                  : 'border-white/30 text-white/70 hover:border-white/50'
              )}
            >
              {t('personalInfo.male')}
            </button>
            <button
              type="button"
              onClick={() => onGenderChange('female')}
              className={cn(
                'py-4 px-4 rounded-xl border-2 font-medium transition-all',
                gender === 'female'
                  ? 'border-white bg-white/20 text-white'
                  : 'border-white/30 text-white/70 hover:border-white/50'
              )}
            >
              {t('personalInfo.female')}
            </button>
          </div>
          {errors?.gender && <p className="text-red-300 text-sm mt-2 text-left">{errors.gender}</p>}
        </div>
      </div>
    </div>
  );
}
