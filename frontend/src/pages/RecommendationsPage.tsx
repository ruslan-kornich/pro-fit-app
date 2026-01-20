import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../components/Card';
import Loading from '../components/Loading';
import Button from '../components/Button';
import { getAIRecommendations } from '../api/food';
import type { RecommendationResponse } from '../types/food';
import { toast } from '../utils/toast';
import { cn } from '../utils/cn';

export default function RecommendationsPage() {
  const { t } = useTranslation('recommendations');
  const { t: tCommon } = useTranslation('common');
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const data = await getAIRecommendations();
      setRecommendations(data);
    } catch {
      toast.error(t('toast.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  const getProteinStatusColor = (status: string) => {
    switch (status) {
      case 'low':
        return 'text-red-500';
      case 'adequate':
        return 'text-green-500';
      case 'high':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getProteinStatusLabel = (status: string) => {
    switch (status) {
      case 'low':
        return t('proteinStatuses.low');
      case 'adequate':
        return t('proteinStatuses.adequate');
      case 'high':
        return t('proteinStatuses.high');
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-full">
        <Loading size="lg" />
        <p className="text-gray-600 mt-4">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 text-sm">{t('subtitle')}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={loadRecommendations}>
          {tCommon('buttons.refresh')}
        </Button>
      </header>

      {recommendations && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Card className="text-center">
              <p className="text-sm text-gray-500 mb-1">{t('balanceScore')}</p>
              <p className={cn('text-3xl font-bold', getScoreColor(recommendations.balance_score))}>
                {recommendations.balance_score}
              </p>
              <p className="text-xs text-gray-400">{t('outOf100')}</p>
            </Card>
            <Card className="text-center">
              <p className="text-sm text-gray-500 mb-1">{t('proteinStatus')}</p>
              <p className={cn('text-xl font-bold capitalize', getProteinStatusColor(recommendations.protein_status))}>
                {getProteinStatusLabel(recommendations.protein_status)}
              </p>
            </Card>
          </div>

          <Card>
            <h2 className="font-semibold text-gray-900 mb-3">{t('insights')}</h2>
            <p className="text-gray-600">{recommendations.insights}</p>
          </Card>

          <Card>
            <h2 className="font-semibold text-gray-900 mb-3">{t('recommendations')}</h2>
            <div className="space-y-3">
              {recommendations.recommendations.map((recommendation, index) => (
                <div key={index} className="flex gap-3">
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-primary-600">{index + 1}</span>
                  </div>
                  <p className="text-gray-600">{recommendation}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-gray-50">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  {t('disclaimer')}
                </p>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
