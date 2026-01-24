import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../../components/Button';
import type { WeightEntryCreate } from '../../types/weight';

interface WeightEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: WeightEntryCreate) => Promise<void>;
}

export default function WeightEntryModal({
  isOpen,
  onClose,
  onSubmit,
}: WeightEntryModalProps) {
  const { t } = useTranslation('statistics');
  const { t: tCommon } = useTranslation('common');
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const weightValue = parseFloat(weight);
    if (isNaN(weightValue) || weightValue <= 0) {
      setError(t('weight.modal.invalidWeight'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSubmit({
        weight: weightValue,
        recorded_date: date,
        note: note.trim() || null,
      });
      handleClose();
    } catch (err) {
      if (err instanceof Error && err.message.includes('already exists')) {
        setError(t('weight.modal.duplicateDate'));
      } else {
        setError(t('weight.modal.error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setWeight('');
    setDate(new Date().toISOString().split('T')[0]);
    setNote('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl max-w-md w-full shadow-xl">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
            {t('weight.modal.title')}
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

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
              {t('weight.modal.weightLabel')} ({tCommon('units.kg')})
            </label>
            <input
              type="number"
              id="weight"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              step="0.1"
              min="1"
              max="500"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="70.5"
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              {t('weight.modal.dateLabel')}
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
              {t('weight.modal.noteLabel')}
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
              placeholder={t('weight.modal.notePlaceholder')}
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              className="flex-1"
            >
              {tCommon('buttons.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={loading || !weight}
              className="flex-1"
            >
              {loading ? tCommon('buttons.saving') : tCommon('buttons.save')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
