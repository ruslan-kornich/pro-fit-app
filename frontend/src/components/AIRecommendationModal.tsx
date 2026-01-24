import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getAICalorieRecommendation } from '../api/users';
import type { AICalorieRecommendation } from '../types/user';
import Button from './Button';

interface AIRecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (calories: number) => void;
}

export default function AIRecommendationModal({
  isOpen,
  onClose,
  onApply,
}: AIRecommendationModalProps) {
  const { t } = useTranslation('profile');
  const { t: tCommon } = useTranslation('common');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<AICalorieRecommendation | null>(null);

  const fetchRecommendation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAICalorieRecommendation();
      setRecommendation(data);
    } catch {
      setError(t('aiRecommendation.error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (isOpen && !recommendation) {
      fetchRecommendation();
    }
  }, [isOpen, recommendation, fetchRecommendation]);

  const handleClose = () => {
    setRecommendation(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14.5a6.5 6.5 0 110-13 6.5 6.5 0 010 13zm.75-9.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM10 9a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 9z" />
            </svg>
            {t('aiRecommendation.title')}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          {loading && (
            <div className="py-12 text-center">
              <div className="animate-spin w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto mb-4" />
              <p className="text-gray-600">{t('aiRecommendation.loading')}</p>
            </div>
          )}

          {error && (
            <div className="py-8 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchRecommendation} variant="secondary">
                {t('aiRecommendation.retry')}
              </Button>
            </div>
          )}

          {recommendation && !loading && (
            <div className="space-y-4">
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <p className="text-sm text-purple-700 mb-1">{t('aiRecommendation.optimal')}</p>
                <p className="text-4xl font-bold text-purple-600">
                  {recommendation.recommended_calories_optimal}
                  <span className="text-lg ml-1">{tCommon('units.kcal')}</span>
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600 mb-1">{t('aiRecommendation.recommendedRange')}</p>
                <p className="font-medium text-gray-900">
                  {recommendation.recommended_calories_min} — {recommendation.recommended_calories_max} {tCommon('units.kcal')}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">{t('aiRecommendation.explanation')}</p>
                <p className="text-gray-600 text-sm">{recommendation.explanation}</p>
              </div>

              {recommendation.personalized_tips.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">{t('aiRecommendation.tips')}</p>
                  <ul className="space-y-2">
                    {recommendation.personalized_tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {recommendation.factors_considered.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">{t('aiRecommendation.factors')}</p>
                  <div className="flex flex-wrap gap-2">
                    {recommendation.factors_considered.map((factor, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                      >
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <Button
                className="w-full"
                onClick={() => onApply(recommendation.recommended_calories_optimal)}
              >
                {t('aiRecommendation.apply')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
