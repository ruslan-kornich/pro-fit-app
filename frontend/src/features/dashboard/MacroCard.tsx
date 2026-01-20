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
      <h3 className="font-medium text-gray-900 mb-3 text-sm">{t('macros.protein')} / {t('macros.fat')} / {t('macros.carbs')}</h3>
      <div className="space-y-3">
        <ProgressBar
          label={t('macros.protein')}
          value={protein}
          max={proteinGoal}
          color="blue"
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
          color="green"
          size="sm"
        />
      </div>
    </Card>
  );
}
