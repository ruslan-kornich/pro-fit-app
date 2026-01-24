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

  return (
    <div className="p-4 space-y-4 pb-[calc(env(safe-area-inset-bottom,0px)+6rem)]">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('addFood.title')}</h1>
        {(previewUrl || name || selectedSearchResult) && (
          <Button variant="ghost" size="sm" onClick={resetForm}>
            {tCommon('buttons.reset')}
          </Button>
        )}
      </header>

      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          className={cn(
            'flex-1 py-2 rounded-md text-sm font-medium transition-colors',
            activeTab === 'photo'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600'
          )}
          onClick={() => setActiveTab('photo')}
        >
          {t('addFood.tabs.photo')}
        </button>
        <button
          className={cn(
            'flex-1 py-2 rounded-md text-sm font-medium transition-colors',
            activeTab === 'search'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600'
          )}
          onClick={() => setActiveTab('search')}
        >
          {t('addFood.tabs.search')}
        </button>
        <button
          className={cn(
            'flex-1 py-2 rounded-md text-sm font-medium transition-colors',
            activeTab === 'manual'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600'
          )}
          onClick={() => setActiveTab('manual')}
        >
          {t('addFood.tabs.manual')}
        </button>
      </div>

      {activeTab === 'photo' && (
        <div className="space-y-4">
          <PhotoUpload
            onPhotoSelect={handlePhotoSelect}
            previewUrl={previewUrl}
            loading={analyzing}
          />

          {analyzing && (
            <Card className="text-center">
              <Loading size="md" className="mb-2" />
              <p className="text-gray-600">{t('addFood.analyzing')}</p>
            </Card>
          )}

          {analysis && !analyzing && (
            <>
              <Card>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-lg text-gray-900">{analysis.dish_name}</h2>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm text-gray-600">
                      {((analysis.confidence || 0) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center bg-gray-50 rounded-lg p-3 mb-4">
                  <div>
                    <p className="text-lg font-bold text-gray-900">{calories}</p>
                    <p className="text-xs text-gray-500">{tCommon('units.kcal')}</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-blue-600">{protein}g</p>
                    <p className="text-xs text-gray-500">{tCommon('units.protein')}</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-yellow-600">{fat}g</p>
                    <p className="text-xs text-gray-500">{tCommon('units.fat')}</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-green-600">{carbs}g</p>
                    <p className="text-xs text-gray-500">{tCommon('units.carbs')}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                  <span>{t('addFood.detectedItems')} ({editableItems.length})</span>
                  <span>{selectedCount} {t('addFood.selected')}</span>
                </div>
              </Card>

              <div className="space-y-2">
                {editableItems.map((item, index) => (
                  <Card
                    key={index}
                    className={cn(
                      'cursor-pointer transition-all',
                      item.selected
                        ? 'ring-2 ring-green-500 bg-green-50'
                        : 'opacity-60'
                    )}
                    onClick={() => toggleItemSelection(index)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-6 h-6 rounded-full border-2 flex items-center justify-center',
                        item.selected
                          ? 'border-green-500 bg-green-500'
                          : 'border-gray-300'
                      )}>
                        {item.selected && (
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{item.name}</p>
                        <div
                          className="flex items-center gap-1 mt-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => updateItemGrams(index, String(Math.max(0, (item.grams || 0) - 10)))}
                            className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-200 rounded"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            value={item.grams || ''}
                            onChange={(e) => updateItemGrams(index, e.target.value)}
                            className="w-14 px-1 py-0.5 text-sm border border-gray-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-primary-500"
                            min="0"
                          />
                          <button
                            type="button"
                            onClick={() => updateItemGrams(index, String((item.grams || 0) + 10))}
                            className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-200 rounded"
                          >
                            +
                          </button>
                          <span className="text-sm text-gray-500">{tCommon('units.grams')}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{item.calories} {tCommon('units.kcal')}</p>
                        <p className="text-xs text-gray-500">
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
                  <h2 className="font-semibold text-lg text-gray-900 capitalize">{name}</h2>
                  <button
                    onClick={() => setSelectedSearchResult(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center bg-gray-50 rounded-lg p-3 mb-4">
                  <div>
                    <p className="text-lg font-bold text-gray-900">{calories}</p>
                    <p className="text-xs text-gray-500">{tCommon('units.kcal')}</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-blue-600">{protein}g</p>
                    <p className="text-xs text-gray-500">{tCommon('units.protein')}</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-yellow-600">{fat}g</p>
                    <p className="text-xs text-gray-500">{tCommon('units.fat')}</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-green-600">{carbs}g</p>
                    <p className="text-xs text-gray-500">{tCommon('units.carbs')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">{t('addFood.servingSize')}</label>
                  <input
                    type="number"
                    value={grams}
                    onChange={(event) => handleServingSizeChange(event.target.value)}
                    className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-500">{t('addFood.grams')}</span>
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
            <div className="text-center py-8 text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p>{t('addFood.searchHint')}</p>
              <p className="text-sm mt-1">{t('addFood.searchExample')}</p>
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
