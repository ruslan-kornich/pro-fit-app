import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PhotoUpload from '../components/PhotoUpload';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import Loading from '../components/Loading';
import { analyzePhotoDetailed, createFoodEntry, createFoodEntryWithIngredients } from '../api/food';
import { toast } from '../utils/toast';
import type { DishAnalysisResponse, FoodItemAnalysis } from '../types/food';
import { cn } from '../utils/cn';

type Tab = 'photo' | 'manual';

interface EditableItem extends FoodItemAnalysis {
  selected: boolean;
}

export default function AddFoodPage() {
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
      }));
      setEditableItems(items);

      setName(result.dish_name);
      setCalories(result.total_calories.toString());
      setProtein(result.total_protein.toString());
      setFat(result.total_fat.toString());
      setCarbs(result.total_carbs.toString());
      setGrams(result.total_grams.toString());

      toast.success('Food analyzed successfully!');
    } catch {
      toast.error('Failed to analyze photo. Try again or enter manually.');
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

  const handleSaveAll = async () => {
    if (!name || !calories) {
      toast.error('Name and calories are required');
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
      toast.success('Food entry saved!');
      navigate('/');
    } catch {
      toast.error('Failed to save food entry');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSelected = async () => {
    const selectedItems = editableItems.filter(item => item.selected);
    if (selectedItems.length === 0) {
      toast.error('Select at least one item to save');
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
      toast.success(`${selectedItems.length} item(s) saved!`);
      navigate('/');
    } catch {
      toast.error('Failed to save food entries');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setPreviewUrl(null);
    setAnalysis(null);
    setEditableItems([]);
    setName('');
    setCalories('');
    setProtein('');
    setFat('');
    setCarbs('');
    setGrams('');
  };

  const selectedCount = editableItems.filter(item => item.selected).length;

  return (
    <div className="p-4 space-y-4 pb-24">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Add Food</h1>
        {(previewUrl || name) && (
          <Button variant="ghost" size="sm" onClick={resetForm}>
            Reset
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
          Photo
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
          Manual
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
              <p className="text-gray-600">Analyzing food...</p>
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
                    <p className="text-xs text-gray-500">kcal</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-blue-600">{protein}g</p>
                    <p className="text-xs text-gray-500">protein</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-yellow-600">{fat}g</p>
                    <p className="text-xs text-gray-500">fat</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-green-600">{carbs}g</p>
                    <p className="text-xs text-gray-500">carbs</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                  <span>Detected items ({editableItems.length})</span>
                  <span>{selectedCount} selected</span>
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
                        <p className="text-sm text-gray-500">
                          {item.grams}g
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{item.calories} kcal</p>
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
                  Save as "{analysis.dish_name}"
                </Button>

                {editableItems.length > 1 && (
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={handleSaveSelected}
                    loading={saving}
                    disabled={selectedCount === 0}
                  >
                    Save {selectedCount} item(s) separately
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'manual' && (
        <Card>
          <div className="space-y-3">
            <Input
              label="Food Name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g., Grilled Chicken Salad"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Calories"
                type="number"
                value={calories}
                onChange={(event) => setCalories(event.target.value)}
                placeholder="kcal"
              />
              <Input
                label="Grams"
                type="number"
                value={grams}
                onChange={(event) => setGrams(event.target.value)}
                placeholder="g"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Protein (g)"
                type="number"
                value={protein}
                onChange={(event) => setProtein(event.target.value)}
              />
              <Input
                label="Fat (g)"
                type="number"
                value={fat}
                onChange={(event) => setFat(event.target.value)}
              />
              <Input
                label="Carbs (g)"
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
          Save Food Entry
        </Button>
      )}
    </div>
  );
}
