import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/cn';

interface ActivityLevelStepProps {
  activityLevel: number;
  onActivityLevelChange: (level: number) => void;
}

const ACTIVITY_LEVELS = [
  { value: 1.2, labelKey: 'activityLevel.sedentary', descKey: 'activityLevel.sedentaryDesc' },
  { value: 1.375, labelKey: 'activityLevel.lightlyActive', descKey: 'activityLevel.lightlyActiveDesc' },
  { value: 1.55, labelKey: 'activityLevel.moderatelyActive', descKey: 'activityLevel.moderatelyActiveDesc' },
  { value: 1.725, labelKey: 'activityLevel.veryActive', descKey: 'activityLevel.veryActiveDesc' },
  { value: 1.9, labelKey: 'activityLevel.extraActive', descKey: 'activityLevel.extraActiveDesc' },
];

export default function ActivityLevelStep({ activityLevel, onActivityLevelChange }: ActivityLevelStepProps) {
  const { t } = useTranslation('onboarding');

  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>

      <h1 className="text-3xl font-bold text-white mb-2">
        {t('activityLevel.title')}
      </h1>
      <p className="text-white/80 mb-6">
        {t('activityLevel.subtitle')}
      </p>

      <div className="w-full max-w-sm space-y-3">
        {ACTIVITY_LEVELS.map((level) => (
          <button
            key={level.value}
            type="button"
            onClick={() => onActivityLevelChange(level.value)}
            className={cn(
              'w-full text-left p-4 rounded-xl border-2 transition-all',
              activityLevel === level.value
                ? 'border-white bg-white/20'
                : 'border-white/30 hover:border-white/50'
            )}
          >
            <p className="font-medium text-white">{t(level.labelKey)}</p>
            <p className="text-sm text-white/70">{t(level.descKey)}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
