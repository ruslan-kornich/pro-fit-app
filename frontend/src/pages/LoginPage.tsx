import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../features/auth/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import { toast } from '../utils/toast';

export default function LoginPage() {
  const { t } = useTranslation('auth');
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});

    if (!email) {
      setErrors((prev) => ({ ...prev, email: t('validation.emailRequired') }));
      return;
    }
    if (!password) {
      setErrors((prev) => ({ ...prev, password: t('validation.passwordRequired') }));
      return;
    }

    setLoading(true);
    try {
      await login({ email, password });
      toast.success(t('login.welcomeBack'));
    } catch (error) {
      toast.error(t('login.invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-6 text-surface-900 tracking-tight">{t('login.title')}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t('login.email')}
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
          placeholder={t('login.emailPlaceholder')}
        />
        <Input
          label={t('login.password')}
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
          placeholder={t('login.passwordPlaceholder')}
        />
        <Button type="submit" className="w-full" loading={loading}>
          {t('login.submit')}
        </Button>
      </form>
      <p className="text-center mt-5 text-surface-500 text-sm">
        {t('login.noAccount')}{' '}
        <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
          {t('login.signUp')}
        </Link>
      </p>
    </div>
  );
}
