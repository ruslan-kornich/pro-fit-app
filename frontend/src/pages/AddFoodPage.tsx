import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PhotoUpload from '../components/PhotoUpload';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import Loading from '../components/Loading';
import FoodSearch from '../components/FoodSearch';
import { analyzePhotoDetailed, createFoodEntry, createFoodEntryWithIngredients } from '../api/food';
import { toast } from '../utils/toast';
import type { DishAnalysisResponse, FoodItemAnalysis, NutritionSearchResult } from '../types/food';
import { cn } from '../utils/cn';

type Tab = 'photo' | 'search' | 'manual';

interface EditableItem extends FoodItemAnalysis {
  selected: boolean;
  originalGrams: number;
  originalCalories: number;
  originalProtein: number | null;
  originalFat: number | null;
  originalCarbs: number | null;
}

export default function AddFoodPage() {
  const { t } = useTranslation('food');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('photo');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [analysis, setAnalysis] = useState<DishAnalysisResponse | null>(null);
  const [editableItems, setEditableItems] = useState<EditableItem[]>([]);

  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [fat, setFat] = useState('');
  const [carbs, setCarbs] = useState('');
  const [grams, setGrams] = useState('');

  const [selectedSearchResult, setSelectedSearchResult] = useState<NutritionSearchResult | null>(null);

  const handlePhotoSelect = async (file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setAnalysis(null);
    setEditableItems([]);

    setAnalyzing(true);
    try {
      const result = await analyzePhotoDetailed(file);
      setAnalysis(result);

      const items: EditableItem[] = result.items.map(item => ({
        ...item,
        selected: true,
        originalGrams: item.grams || 100,
        originalCalories: item.calories,
        originalProtein: item.protein,
        originalFat: item.fat,
        originalCarbs: item.carbs,
      }));
      setEditableItems(items);

      setName(result.dish_name);
      setCalories(result.total_calories.toString());
      setProtein(result.total_protein.toString());
      setFat(result.total_fat.toString());
      setCarbs(result.total_carbs.toString());
      setGrams(result.total_grams.toString());

      toast.success(t('addFood.analyzedSuccess'));
    } catch {
      toast.error(t('addFood.analyzeFailed'));
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleItemSelection = (index: number) => {
    setEditableItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], selected: !updated[index].selected };

      const selectedItems = updated.filter(item => item.selected);
      const totalCalories = selectedItems.reduce((sum, item) => sum + item.calories, 0);
      const totalProtein = selectedItems.reduce((sum, item) => sum + (item.protein || 0), 0);
      const totalFat = selectedItems.reduce((sum, item) => sum + (item.fat || 0), 0);
      const totalCarbs = selectedItems.reduce((sum, item) => sum + (item.carbs || 0), 0);
      const totalGrams = selectedItems.reduce((sum, item) => sum + (item.grams || 0), 0);

      setCalories(totalCalories.toString());
      setProtein(totalProtein.toString());
      setFat(totalFat.toString());
      setCarbs(totalCarbs.toString());
      setGrams(totalGrams.toString());

      return updated;
    });
  };

  const updateItemGrams = (index: number, newGrams: string) => {
    setEditableItems(prev => {
      const updated = [...prev];
      const item = updated[index];
      const gramsValue = parseFloat(newGrams) || 0;

      const ratio = item.originalGrams > 0 ? gramsValue / item.originalGrams : 0;

      updated[index] = {
        ...item,
        grams: gramsValue,
        calories: Math.round(item.originalCalories * ratio),
        protein: item.originalProtein !== null ? Number((item.originalProtein * ratio).toFixed(1)) : null,
        fat: item.originalFat !== null ? Number((item.originalFat * ratio).toFixed(1)) : null,
        carbs: item.originalCarbs !== null ? Number((item.originalCarbs * ratio).toFixed(1)) : null,
      };

      const selectedItems = updated.filter(i => i.selected);
      const totalCalories = selectedItems.reduce((sum, i) => sum + i.calories, 0);
      const totalProtein = selectedItems.reduce((sum, i) => sum + (i.protein || 0), 0);
      const totalFat = selectedItems.reduce((sum, i) => sum + (i.fat || 0), 0);
      const totalCarbs = selectedItems.reduce((sum, i) => sum + (i.carbs || 0), 0);
      const totalGrams = selectedItems.reduce((sum, i) => sum + (i.grams || 0), 0);

      setCalories(totalCalories.toString());
      setProtein(totalProtein.toFixed(1));
      setFat(totalFat.toFixed(1));
      setCarbs(totalCarbs.toFixed(1));
      setGrams(totalGrams.toFixed(1));

      return updated;
    });
  };

  const handleSearchSelect = (result: NutritionSearchResult) => {
    setSelectedSearchResult(result);
    setName(result.name);
    setCalories(Math.round(result.calories).toString());
    setProtein(result.protein_g.toFixed(1));
    setFat(result.fat_total_g.toFixed(1));
    setCarbs(result.carbohydrates_total_g.toFixed(1));
    setGrams(result.serving_size_g.toString());
  };

  const handleServingSizeChange = (newGrams: string) => {
    if (!selectedSearchResult) return;

    const gramsValue = parseFloat(newGrams) || 0;
    const originalGrams = selectedSearchResult.serving_size_g;

    if (originalGrams > 0 && gramsValue > 0) {
      const ratio = gramsValue / originalGrams;
      setCalories(Math.round(selectedSearchResult.calories * ratio).toString());
      setProtein((selectedSearchResult.protein_g * ratio).toFixed(1));
      setFat((selectedSearchResult.fat_total_g * ratio).toFixed(1));
      setCarbs((selectedSearchResult.carbohydrates_total_g * ratio).toFixed(1));
    }
    setGrams(newGrams);
  };

  const handleSaveAll = async () => {
    if (!name || !calories) {
      toast.error(t('validation.nameRequired'));
      return;
    }

    setSaving(true);
    try {
      const selectedItems = editableItems.filter(item => item.selected);

      if (selectedItems.length > 0) {
        await createFoodEntryWithIngredients({
          name,
          calories: parseInt(calories, 10),
          protein: protein ? parseFloat(protein) : null,
          fat: fat ? parseFloat(fat) : null,
          carbs: carbs ? parseFloat(carbs) : null,
          grams: grams ? parseFloat(grams) : null,
          photo_url: analysis?.photo_url || null,
          ingredients: selectedItems.map(item => ({
            name: item.name,
            calories: item.calories,
            protein: item.protein,
            fat: item.fat,
            carbs: item.carbs,
            grams: item.grams,
          })),
        });
      } else {
        await createFoodEntry({
          name,
          calories: parseInt(calories, 10),
          protein: protein ? parseFloat(protein) : null,
          fat: fat ? parseFloat(fat) : null,
          carbs: carbs ? parseFloat(carbs) : null,
          grams: grams ? parseFloat(grams) : null,
          photo_url: analysis?.photo_url || null,
        });
      }
      toast.success(t('toast.saved'));
      navigate('/');
    } catch {
      toast.error(t('toast.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSelected = async () => {
    const selectedItems = editableItems.filter(item => item.selected);
    if (selectedItems.length === 0) {
      toast.error(t('validation.selectAtLeastOne'));
      return;
    }

    setSaving(true);
    try {
      for (const item of selectedItems) {
        await createFoodEntry({
          name: item.name,
          calories: item.calories,
          protein: item.protein,
          fat: item.fat,
          carbs: item.carbs,
          grams: item.grams,
          photo_url: analysis?.photo_url || null,
        });
      }
      toast.success(t('toast.savedMultiple', { count: selectedItems.length }));
      navigate('/');
    } catch {
      toast.error(t('toast.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setPreviewUrl(null);
    setAnalysis(null);
    setEditableItems([]);
    setSelectedSearchResult(null);
    setName('');
    setCalories('');
    setProtein('');
    setFat('');
    setCarbs('');
    setGrams('');
  };

  const selectedCount = editableItems.filter(item => item.selected).length;

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    {
      key: 'photo',
      label: t('addFood.tabs.photo'),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
        </svg>
      ),
    },
    {
      key: 'search',
      label: t('addFood.tabs.search'),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      ),
    },
    {
      key: 'manual',
      label: t('addFood.tabs.manual'),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="p-4 space-y-4 pb-[calc(env(safe-area-inset-bottom,0px)+6rem)] animate-fade-in">
      <header className="flex items-center justify-between pt-1">
        <h1 className="text-xl font-bold text-surface-900 tracking-tight">{t('addFood.title')}</h1>
        {(previewUrl || name || selectedSearchResult) && (
          <button
            onClick={resetForm}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-surface-500 hover:text-surface-700 hover:bg-surface-100 rounded-[10px] transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
            {tCommon('buttons.reset')}
          </button>
        )}
      </header>

      <div className="flex bg-surface-100 rounded-button p-1 gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={cn(
              'flex-1 py-2.5 rounded-[12px] text-sm font-semibold transition-all duration-200 ease-spring flex items-center justify-center gap-1.5',
              activeTab === tab.key
                ? 'bg-white text-surface-900 shadow-card'
                : 'text-surface-500 hover:text-surface-700'
            )}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'photo' && (
        <div className="space-y-4">
          <PhotoUpload
            onPhotoSelect={handlePhotoSelect}
            previewUrl={previewUrl}
            loading={analyzing}
          />

          {analyzing && (
            <Card className="text-center py-6">
              <Loading size="md" className="mb-3" />
              <p className="text-surface-600 font-medium">{t('addFood.analyzing')}</p>
            </Card>
          )}

          {analysis && !analyzing && (
            <>
              <Card>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-lg text-surface-900">{analysis.dish_name}</h2>
                  <div className="flex items-center gap-1.5 bg-primary-50 px-2.5 py-1 rounded-pill">
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                    <span className="text-xs font-semibold text-primary-700">
                      {((analysis.confidence || 0) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center bg-surface-50 rounded-[14px] p-3 mb-4">
                  <div>
                    <p className="text-lg font-bold text-surface-900">{calories}</p>
                    <p className="text-[10px] text-surface-400 font-medium uppercase">{tCommon('units.kcal')}</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-indigo-500">{protein}g</p>
                    <p className="text-[10px] text-surface-400 font-medium uppercase">{tCommon('units.protein')}</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-amber-500">{fat}g</p>
                    <p className="text-[10px] text-surface-400 font-medium uppercase">{tCommon('units.fat')}</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-primary-500">{carbs}g</p>
                    <p className="text-[10px] text-surface-400 font-medium uppercase">{tCommon('units.carbs')}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-surface-500 mb-2">
                  <span className="font-medium">{t('addFood.detectedItems')} ({editableItems.length})</span>
                  <span className="text-primary-600 font-semibold">{selectedCount} {t('addFood.selected')}</span>
                </div>
              </Card>

              <div className="space-y-2">
                {editableItems.map((item, index) => (
                  <Card
                    key={index}
                    className={cn(
                      'cursor-pointer transition-all duration-200',
                      item.selected
                        ? 'ring-2 ring-primary-400 bg-primary-50/30'
                        : 'opacity-50'
                    )}
                    onClick={() => toggleItemSelection(index)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                        item.selected
                          ? 'border-primary-500 bg-primary-500'
                          : 'border-surface-300'
                      )}>
                        {item.selected && (
                          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-surface-900 truncate">{item.name}</p>
                        <div
                          className="flex items-center gap-1 mt-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => updateItemGrams(index, String(Math.max(0, (item.grams || 0) - 10)))}
                            className="w-7 h-7 flex items-center justify-center text-surface-500 hover:bg-surface-100 rounded-[8px] transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                            </svg>
                          </button>
                          <input
                            type="number"
                            value={item.grams || ''}
                            onChange={(e) => updateItemGrams(index, e.target.value)}
                            className="w-14 px-1 py-1 text-sm bg-surface-50 border border-surface-200 rounded-[8px] text-center focus:outline-none focus:ring-2 focus:ring-primary-400 font-medium"
                            min="0"
                          />
                          <button
                            type="button"
                            onClick={() => updateItemGrams(index, String((item.grams || 0) + 10))}
                            className="w-7 h-7 flex items-center justify-center text-surface-500 hover:bg-surface-100 rounded-[8px] transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                          </button>
                          <span className="text-xs text-surface-400 font-medium">{tCommon('units.grams')}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-surface-900">{item.calories} <span className="text-xs text-surface-400 font-medium">{tCommon('units.kcal')}</span></p>
                        <p className="text-[10px] text-surface-400 font-medium mt-0.5">
                          P:{item.protein || 0} F:{item.fat || 0} C:{item.carbs || 0}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="space-y-2">
                <Button
                  className="w-full"
                  onClick={handleSaveAll}
                  loading={saving}
                >
                  {t('addFood.saveAs', { name: analysis.dish_name })}
                </Button>

                {editableItems.length > 1 && (
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={handleSaveSelected}
                    loading={saving}
                    disabled={selectedCount === 0}
                  >
                    {t('addFood.saveItemsSeparately', { count: selectedCount })}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'search' && (
        <div className="space-y-4">
          <FoodSearch onSelect={handleSearchSelect} />

          {selectedSearchResult && (
            <>
              <Card>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-lg text-surface-900 capitalize">{name}</h2>
                  <button
                    onClick={() => setSelectedSearchResult(null)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-100 transition-colors"
                  >
                    <svg className="w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center bg-surface-50 rounded-[14px] p-3 mb-4">
                  <div>
                    <p className="text-lg font-bold text-surface-900">{calories}</p>
                    <p className="text-[10px] text-surface-400 font-medium uppercase">{tCommon('units.kcal')}</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-indigo-500">{protein}g</p>
                    <p className="text-[10px] text-surface-400 font-medium uppercase">{tCommon('units.protein')}</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-amber-500">{fat}g</p>
                    <p className="text-[10px] text-surface-400 font-medium uppercase">{tCommon('units.fat')}</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-primary-500">{carbs}g</p>
                    <p className="text-[10px] text-surface-400 font-medium uppercase">{tCommon('units.carbs')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-surface-600">{t('addFood.servingSize')}</label>
                  <input
                    type="number"
                    value={grams}
                    onChange={(event) => handleServingSizeChange(event.target.value)}
                    className="w-24 px-3 py-2 bg-surface-50 border border-surface-200 rounded-[10px] text-center focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent font-medium"
                  />
                  <span className="text-sm text-surface-400 font-medium">{t('addFood.grams')}</span>
                </div>
              </Card>

              <Button
                className="w-full"
                onClick={handleSaveAll}
                loading={saving}
              >
                {t('addFood.saveFoodEntry')}
              </Button>
            </>
          )}

          {!selectedSearchResult && (
            <div className="text-center py-10 text-surface-400">
              <div className="w-16 h-16 mx-auto mb-4 bg-surface-100 rounded-[18px] flex items-center justify-center">
                <svg className="w-8 h-8 text-surface-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <p className="font-medium text-surface-500">{t('addFood.searchHint')}</p>
              <p className="text-sm mt-1 text-surface-400">{t('addFood.searchExample')}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'manual' && (
        <Card>
          <div className="space-y-3">
            <Input
              label={t('manual.foodName')}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t('manual.foodNamePlaceholder')}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label={t('manual.calories')}
                type="number"
                value={calories}
                onChange={(event) => setCalories(event.target.value)}
                placeholder={tCommon('units.kcal')}
              />
              <Input
                label={t('manual.grams')}
                type="number"
                value={grams}
                onChange={(event) => setGrams(event.target.value)}
                placeholder={tCommon('units.grams')}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Input
                label={t('manual.protein')}
                type="number"
                value={protein}
                onChange={(event) => setProtein(event.target.value)}
              />
              <Input
                label={t('manual.fat')}
                type="number"
                value={fat}
                onChange={(event) => setFat(event.target.value)}
              />
              <Input
                label={t('manual.carbs')}
                type="number"
                value={carbs}
                onChange={(event) => setCarbs(event.target.value)}
              />
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'manual' && (name || calories) && (
        <Button
          className="w-full"
          onClick={handleSaveAll}
          loading={saving}
          disabled={!name || !calories}
        >
          {t('addFood.saveFoodEntry')}
        </Button>
      )}
    </div>
  );
}
