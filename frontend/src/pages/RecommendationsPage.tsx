import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../components/Card';
import Loading from '../components/Loading';
import { getAIRecommendations } from '../api/food';
import type { RecommendationResponse } from '../types/food';
import { toast } from '../utils/toast';
import { cn } from '../utils/cn';

export default function RecommendationsPage() {
  const { t } = useTranslation('recommendations');
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const loadRecommendations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAIRecommendations();
      setRecommendations(data);
    } catch {
      toast.error(t('toast.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  const getProteinStatusColor = (status: string) => {
    switch (status) {
      case 'low':
        return 'text-red-500';
      case 'adequate':
        return 'text-emerald-500';
      case 'high':
        return 'text-amber-500';
      default:
        return 'text-surface-500';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'from-emerald-50 to-emerald-100/50';
    if (score >= 60) return 'from-amber-50 to-amber-100/50';
    return 'from-red-50 to-red-100/50';
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
        <p className="text-surface-500 mt-4 font-medium">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <header className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl font-bold text-surface-900 tracking-tight">{t('title')}</h1>
          <p className="text-surface-400 text-sm font-medium">{t('subtitle')}</p>
        </div>
        <button
          onClick={loadRecommendations}
          className="w-9 h-9 flex items-center justify-center bg-surface-100 hover:bg-surface-200 rounded-[10px] transition-all active:scale-[0.95]"
        >
          <svg className="w-5 h-5 text-surface-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
          </svg>
        </button>
      </header>

      {recommendations && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Card className={cn("text-center bg-gradient-to-br", getScoreBg(recommendations.balance_score))}>
              <div className="w-9 h-9 mx-auto mb-2 bg-white/60 rounded-[10px] flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-xs text-surface-500 font-medium mb-1">{t('balanceScore')}</p>
              <p className={cn('text-3xl font-bold tracking-tight', getScoreColor(recommendations.balance_score))}>
                {recommendations.balance_score}
              </p>
              <p className="text-[10px] text-surface-400 font-medium">{t('outOf100')}</p>
            </Card>
            <Card className="text-center">
              <div className="w-9 h-9 mx-auto mb-2 bg-indigo-50 rounded-[10px] flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                </svg>
              </div>
              <p className="text-xs text-surface-500 font-medium mb-1">{t('proteinStatus')}</p>
              <p className={cn('text-xl font-bold capitalize', getProteinStatusColor(recommendations.protein_status))}>
                {getProteinStatusLabel(recommendations.protein_status)}
              </p>
            </Card>
          </div>

          <Card>
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
              </svg>
              <h2 className="font-bold text-surface-900">{t('insights')}</h2>
            </div>
            <p className="text-surface-600 leading-relaxed">{recommendations.insights}</p>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <h2 className="font-bold text-surface-900">{t('recommendations')}</h2>
            </div>
            <div className="space-y-3">
              {recommendations.recommendations.map((recommendation, index) => (
                <div key={index} className="flex gap-3">
                  <div className="w-7 h-7 gradient-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-white">{index + 1}</span>
                  </div>
                  <p className="text-surface-600 leading-relaxed">{recommendation}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-surface-50 border-surface-200/60">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-amber-100/80 rounded-[10px] flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <p className="text-sm text-surface-500 leading-relaxed">
                {t('disclaimer')}
              </p>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
