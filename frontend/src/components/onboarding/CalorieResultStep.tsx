import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAICalorieRecommendation } from '../../api/users';
import type { AICalorieRecommendation } from '../../types/user';

interface CalorieResultStepProps {
  calculatedCalories: number;
  onCaloriesChange: (calories: number) => void;
}

export default function CalorieResultStep({ calculatedCalories, onCaloriesChange }: CalorieResultStepProps) {
  const { t } = useTranslation('onboarding');
  const [aiRecommendation, setAiRecommendation] = useState<AICalorieRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [showAIResult, setShowAIResult] = useState(false);

  const handleGetAIRecommendation = async () => {
    setLoading(true);
    setError(false);
    try {
      const recommendation = await getAICalorieRecommendation();
      setAiRecommendation(recommendation);
      setShowAIResult(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyAIRecommendation = () => {
    if (aiRecommendation) {
      onCaloriesChange(aiRecommendation.recommended_calories_optimal);
    }
  };

  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <h1 className="text-3xl font-bold text-white mb-2">
        {t('result.title')}
      </h1>
      <p className="text-white/80 mb-8">
        {t('result.subtitle')}
      </p>

      <div className="w-full max-w-sm">
        <div className="bg-white/10 rounded-2xl p-6 mb-6">
          <p className="text-5xl font-bold text-white mb-2">
            {calculatedCalories}
          </p>
          <p className="text-white/70 text-lg">kcal/day</p>
        </div>

        {!showAIResult && (
          <button
            type="button"
            onClick={handleGetAIRecommendation}
            disabled={loading}
            className="w-full py-4 px-6 bg-purple-500/80 hover:bg-purple-500 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>{t('result.aiLoading')}</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14.5a6.5 6.5 0 110-13 6.5 6.5 0 010 13zm.75-9.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM10 9a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 9z" />
                </svg>
                <span>{t('result.askAI')}</span>
              </>
            )}
          </button>
        )}

        {error && (
          <p className="text-red-300 text-sm mt-3">{t('result.aiError')}</p>
        )}

        {showAIResult && aiRecommendation && (
          <div className="mt-4 space-y-4">
            <div className="bg-purple-500/20 rounded-xl p-4 border border-purple-400/30">
              <p className="text-purple-200 text-sm mb-1">{t('result.optimal')}</p>
              <p className="text-3xl font-bold text-white">
                {aiRecommendation.recommended_calories_optimal}
              </p>
              <p className="text-purple-200 text-sm mt-1">
                {t('result.range', {
                  min: aiRecommendation.recommended_calories_min,
                  max: aiRecommendation.recommended_calories_max,
                })}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleApplyAIRecommendation}
                className="flex-1 py-3 px-4 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium transition-all"
              >
                {t('result.applyAI')}
              </button>
              <button
                type="button"
                onClick={() => setShowAIResult(false)}
                className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all"
              >
                {t('result.keepCalculated')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
