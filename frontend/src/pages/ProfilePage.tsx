import { useState, useEffect } from 'react';
import { useAuth } from '../features/auth/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { updateCurrentUser } from '../api/users';
import { toast } from '../utils/toast';
import { cn } from '../utils/cn';

const ACTIVITY_LEVELS = [
  { value: 1.2, label: 'Sedentary', description: 'Little or no exercise' },
  { value: 1.375, label: 'Lightly Active', description: 'Light exercise 1-3 days/week' },
  { value: 1.55, label: 'Moderately Active', description: 'Moderate exercise 3-5 days/week' },
  { value: 1.725, label: 'Very Active', description: 'Hard exercise 6-7 days/week' },
  { value: 1.9, label: 'Extra Active', description: 'Very hard exercise & physical job' },
];

export default function ProfilePage() {
  const { user, logout, refreshUser } = useAuth();
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [activityLevel, setActivityLevel] = useState<number>(1.2);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setHeight(user.height?.toString() || '');
      setWeight(user.weight?.toString() || '');
      setAge(user.age?.toString() || '');
      setGender(user.gender || '');
      setActivityLevel(user.activity_level || 1.2);
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateCurrentUser({
        name: name || undefined,
        height: height ? parseFloat(height) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        age: age ? parseInt(age, 10) : undefined,
        gender: gender || undefined,
        activity_level: activityLevel,
      });
      await refreshUser();
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 text-sm">{user?.email}</p>
      </header>

      {user?.daily_calorie_norm && (
        <Card className="bg-primary-50 border border-primary-200">
          <div className="text-center">
            <p className="text-sm text-primary-700">Your Daily Calorie Goal</p>
            <p className="text-3xl font-bold text-primary-600">
              {user.daily_calorie_norm} kcal
            </p>
          </div>
        </Card>
      )}

      <Card>
        <h2 className="font-semibold text-gray-900 mb-4">Personal Information</h2>
        <div className="space-y-4">
          <Input
            label="Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Height (cm)"
              type="number"
              value={height}
              onChange={(event) => setHeight(event.target.value)}
              placeholder="175"
            />
            <Input
              label="Weight (kg)"
              type="number"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
              placeholder="70"
            />
          </div>

          <Input
            label="Age"
            type="number"
            value={age}
            onChange={(event) => setAge(event.target.value)}
            placeholder="25"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={cn(
                  'flex-1 py-2 px-4 rounded-lg border-2 text-sm font-medium transition-colors',
                  gender === 'male'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                )}
              >
                Male
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={cn(
                  'flex-1 py-2 px-4 rounded-lg border-2 text-sm font-medium transition-colors',
                  gender === 'female'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                )}
              >
                Female
              </button>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-gray-900 mb-4">Activity Level</h2>
        <div className="space-y-2">
          {ACTIVITY_LEVELS.map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() => setActivityLevel(level.value)}
              className={cn(
                'w-full text-left p-3 rounded-lg border-2 transition-colors',
                activityLevel === level.value
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <p className="font-medium text-gray-900">{level.label}</p>
              <p className="text-sm text-gray-500">{level.description}</p>
            </button>
          ))}
        </div>
      </Card>

      <Button className="w-full" onClick={handleSave} loading={saving}>
        Save Changes
      </Button>

      <Button variant="secondary" className="w-full" onClick={logout}>
        Sign Out
      </Button>
    </div>
  );
}
