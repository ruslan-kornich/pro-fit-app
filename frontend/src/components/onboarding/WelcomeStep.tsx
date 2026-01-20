import { useTranslation } from 'react-i18next';

interface WelcomeStepProps {
  name: string;
  onNameChange: (name: string) => void;
  error?: string;
}

export default function WelcomeStep({ name, onNameChange, error }: WelcomeStepProps) {
  const { t } = useTranslation('onboarding');

  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <h1 className="text-3xl font-bold text-white mb-2">
        {t('welcome.title')}
      </h1>
      <p className="text-white/80 mb-8">
        {t('welcome.subtitle')}
      </p>

      <div className="w-full max-w-sm">
        <label className="block text-left text-white/90 text-sm font-medium mb-2">
          {t('welcome.nameLabel')}
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder={t('welcome.namePlaceholder')}
          className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent text-lg"
        />
        {error && <p className="text-red-300 text-sm mt-2 text-left">{error}</p>}
      </div>
    </div>
  );
}
