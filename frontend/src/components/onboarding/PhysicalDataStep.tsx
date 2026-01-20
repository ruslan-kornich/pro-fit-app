import { useTranslation } from 'react-i18next';

interface PhysicalDataStepProps {
  height: string;
  weight: string;
  onHeightChange: (height: string) => void;
  onWeightChange: (weight: string) => void;
  errors?: { height?: string; weight?: string };
}

export default function PhysicalDataStep({
  height,
  weight,
  onHeightChange,
  onWeightChange,
  errors,
}: PhysicalDataStepProps) {
  const { t } = useTranslation('onboarding');

  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>

      <h1 className="text-3xl font-bold text-white mb-2">
        {t('physicalData.title')}
      </h1>
      <p className="text-white/80 mb-8">
        {t('physicalData.subtitle')}
      </p>

      <div className="w-full max-w-sm space-y-4">
        <div>
          <label className="block text-left text-white/90 text-sm font-medium mb-2">
            {t('physicalData.height')}
          </label>
          <input
            type="number"
            value={height}
            onChange={(e) => onHeightChange(e.target.value)}
            placeholder={t('physicalData.heightPlaceholder')}
            className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent text-lg"
            min="100"
            max="250"
          />
          {errors?.height && <p className="text-red-300 text-sm mt-2 text-left">{errors.height}</p>}
        </div>

        <div>
          <label className="block text-left text-white/90 text-sm font-medium mb-2">
            {t('physicalData.weight')}
          </label>
          <input
            type="number"
            value={weight}
            onChange={(e) => onWeightChange(e.target.value)}
            placeholder={t('physicalData.weightPlaceholder')}
            className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent text-lg"
            min="30"
            max="300"
          />
          {errors?.weight && <p className="text-red-300 text-sm mt-2 text-left">{errors.weight}</p>}
        </div>
      </div>
    </div>
  );
}
