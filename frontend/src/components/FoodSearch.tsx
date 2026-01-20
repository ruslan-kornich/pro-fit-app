import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { searchFoodNutrition } from '../api/food';
import { cn } from '../utils/cn';
import Loading from './Loading';
import type { NutritionSearchResult } from '../types/food';

interface FoodSearchProps {
  onSelect: (result: NutritionSearchResult) => void;
}

export default function FoodSearch({ onSelect }: FoodSearchProps) {
  const { t } = useTranslation('food');
  const { t: tCommon } = useTranslation('common');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NutritionSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.trim().length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await searchFoodNutrition(query);
        setResults(response.results);
        setShowDropdown(response.results.length > 0);
      } catch {
        setError(t('addFood.searchFailed'));
        setResults([]);
        setShowDropdown(false);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, t]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (result: NutritionSearchResult) => {
    onSelect(result);
    setQuery('');
    setResults([]);
    setShowDropdown(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
          placeholder={t('addFood.searchPlaceholder')}
          className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loading size="sm" />
          </div>
        )}
        {!loading && query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setShowDropdown(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      {showDropdown && results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {results.map((result, index) => (
            <button
              key={index}
              onClick={() => handleSelect(result)}
              className={cn(
                'w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors',
                index !== results.length - 1 && 'border-b border-gray-100'
              )}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 capitalize truncate">{result.name}</p>
                  <p className="text-sm text-gray-500">{result.serving_size_g}{tCommon('units.grams')} serving</p>
                </div>
                <div className="text-right ml-3">
                  <p className="font-semibold text-gray-900">{Math.round(result.calories)} {tCommon('units.kcal')}</p>
                  <p className="text-xs text-gray-500">
                    P:{result.protein_g.toFixed(1)} F:{result.fat_total_g.toFixed(1)} C:{result.carbohydrates_total_g.toFixed(1)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {showDropdown && results.length === 0 && !loading && query.length >= 2 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
          {t('addFood.noResults', { query })}
        </div>
      )}
    </div>
  );
}
