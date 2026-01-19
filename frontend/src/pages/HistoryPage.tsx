import { useState, useEffect, useCallback } from 'react';
import Card from '../components/Card';
import Loading from '../components/Loading';
import Button from '../components/Button';
import { getFoodEntries, deleteFoodEntry } from '../api/food';
import type { FoodEntry } from '../types/food';
import { formatDate, formatTime } from '../utils/formatters';
import { toast } from '../utils/toast';
import { cn } from '../utils/cn';

export default function HistoryPage() {
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());

  const toggleExpanded = (entryId: string) => {
    setExpandedEntries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(entryId)) {
        newSet.delete(entryId);
      } else {
        newSet.add(entryId);
      }
      return newSet;
    });
  };

  const loadEntries = useCallback(async (pageNum: number, append = false) => {
    try {
      setLoading(true);
      const response = await getFoodEntries({ page: pageNum, page_size: 20 });
      if (append) {
        setEntries((prev) => [...prev, ...response.entries]);
      } else {
        setEntries(response.entries);
      }
      setHasMore(response.entries.length === 20);
    } catch {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEntries(1);
  }, [loadEntries]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadEntries(nextPage, true);
  };

  const handleDelete = async (entryId: string) => {
    setDeleting(entryId);
    try {
      await deleteFoodEntry(entryId);
      setEntries((prev) => prev.filter((entry) => entry.id !== entryId));
      toast.success('Entry deleted');
    } catch {
      toast.error('Failed to delete entry');
    } finally {
      setDeleting(null);
    }
  };

  const groupedEntries = entries.reduce((groups, entry) => {
    const date = formatDate(entry.created_at);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
    return groups;
  }, {} as Record<string, FoodEntry[]>);

  if (loading && entries.length === 0) {
    return (
      <div className="p-4 flex justify-center items-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Food History</h1>
        <p className="text-gray-600 text-sm">{entries.length} entries</p>
      </header>

      {entries.length === 0 ? (
        <Card className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600">No food entries yet</p>
          <p className="text-gray-400 text-sm mt-1">Start tracking your meals!</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedEntries).map(([date, dateEntries]) => (
            <div key={date}>
              <h2 className="text-sm font-medium text-gray-500 mb-2">{date}</h2>
              <div className="space-y-2">
                {dateEntries.map((entry) => {
                  const hasIngredients = entry.ingredients && entry.ingredients.length > 0;
                  const isExpanded = expandedEntries.has(entry.id);

                  return (
                    <Card key={entry.id} className="overflow-hidden">
                      <div className="flex items-center gap-3">
                        {entry.photo_url ? (
                          <img
                            src={entry.photo_url.startsWith('/') ? entry.photo_url : `/${entry.photo_url}`}
                            alt={entry.name}
                            className="w-14 h-14 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900 truncate">{entry.name}</p>
                            {hasIngredients && (
                              <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                                {entry.ingredients.length} items
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {entry.calories} kcal • {formatTime(entry.created_at)}
                          </p>
                          <div className="flex gap-2 text-xs text-gray-400 mt-0.5">
                            {entry.protein && <span>P: {entry.protein}g</span>}
                            {entry.fat && <span>F: {entry.fat}g</span>}
                            {entry.carbs && <span>C: {entry.carbs}g</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {hasIngredients && (
                            <button
                              onClick={() => toggleExpanded(entry.id)}
                              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <svg
                                className={cn("w-5 h-5 transition-transform", isExpanded && "rotate-180")}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(entry.id)}
                            disabled={deleting === entry.id}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            {deleting === entry.id ? (
                              <Loading size="sm" />
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>

                      {hasIngredients && isExpanded && (
                        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ingredients</p>
                          {entry.ingredients.map((ingredient) => (
                            <div key={ingredient.id} className="flex items-center justify-between py-1.5 px-2 bg-gray-50 rounded">
                              <div>
                                <p className="text-sm text-gray-700">{ingredient.name}</p>
                                <p className="text-xs text-gray-400">
                                  {ingredient.grams && `${ingredient.grams}g`}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">{ingredient.calories} kcal</p>
                                <p className="text-xs text-gray-400">
                                  P:{ingredient.protein || 0} F:{ingredient.fat || 0} C:{ingredient.carbs || 0}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}

          {hasMore && (
            <Button
              variant="secondary"
              className="w-full"
              onClick={handleLoadMore}
              loading={loading}
            >
              Load More
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
