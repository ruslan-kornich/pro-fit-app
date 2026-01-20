import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/cn';
import type { Goal } from '../../types/user';

interface GoalStepProps {
  goal: Goal;
  onGoalChange: (goal: Goal) => void;
}

const GOALS: { value: Goal; labelKey: string; descKey: string; icon: string }[] = [
  { value: 'lose', labelKey: 'goal.lose', descKey: 'goal.loseDesc', icon: '↓' },
  { value: 'maintain', labelKey: 'goal.maintain', descKey: 'goal.maintainDesc', icon: '→' },
  { value: 'gain', labelKey: 'goal.gain', descKey: 'goal.gainDesc', icon: '↑' },
];

export default function GoalStep({ goal, onGoalChange }: GoalStepProps) {
  const { t } = useTranslation('onboarding');

  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>

      <h1 className="text-3xl font-bold text-white mb-2">
        {t('goal.title')}
      </h1>
      <p className="text-white/80 mb-8">
        {t('goal.subtitle')}
      </p>

      <div className="w-full max-w-sm space-y-3">
        {GOALS.map((goalOption) => (
          <button
            key={goalOption.value}
            type="button"
            onClick={() => onGoalChange(goalOption.value)}
            className={cn(
              'w-full p-5 rounded-xl border-2 transition-all flex items-center gap-4',
              goal === goalOption.value
                ? 'border-white bg-white/20'
                : 'border-white/30 hover:border-white/50'
            )}
          >
            <span className="text-3xl">{goalOption.icon}</span>
            <div className="text-left">
              <p className="font-semibold text-white text-lg">{t(goalOption.labelKey)}</p>
              <p className="text-sm text-white/70">{t(goalOption.descKey)}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
