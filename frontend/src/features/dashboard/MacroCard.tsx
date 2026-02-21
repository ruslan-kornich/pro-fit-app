import { useTranslation } from 'react-i18next';
import Card from '../../components/Card';
import ProgressBar from '../../components/ProgressBar';

interface MacroCardProps {
  protein: number;
  fat: number;
  carbs: number;
}

export default function MacroCard({ protein, fat, carbs }: MacroCardProps) {
  const { t } = useTranslation('dashboard');
  const proteinGoal = 150;
  const fatGoal = 65;
  const carbsGoal = 250;

  return (
    <Card className="py-3">
      <div className="space-y-3">
        <ProgressBar
          label={t('macros.protein')}
          value={protein}
          max={proteinGoal}
          color="indigo"
          size="sm"
        />
        <ProgressBar
          label={t('macros.fat')}
          value={fat}
          max={fatGoal}
          color="yellow"
          size="sm"
        />
        <ProgressBar
          label={t('macros.carbs')}
          value={carbs}
          max={carbsGoal}
          color="primary"
          size="sm"
        />
      </div>
    </Card>
  );
}
