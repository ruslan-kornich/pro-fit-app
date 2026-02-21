import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../features/auth/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import { toast } from '../utils/toast';

export default function RegisterPage() {
  const { t } = useTranslation('auth');
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});

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
    if (password.length < 6) {
      setErrors((prev) => ({ ...prev, password: t('validation.passwordMinLength') }));
      return;
    }
    if (password !== confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: t('validation.passwordsDoNotMatch') }));
      return;
    }

    setLoading(true);
    try {
      await register({ email, password });
      toast.success(t('register.success'));
    } catch (error) {
      toast.error(t('register.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-6 text-surface-900 tracking-tight">{t('register.title')}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t('register.email')}
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
          placeholder={t('register.emailPlaceholder')}
        />
        <Input
          label={t('register.password')}
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
          placeholder={t('register.passwordPlaceholder')}
        />
        <Input
          label={t('register.confirmPassword')}
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          error={errors.confirmPassword}
          placeholder={t('register.confirmPasswordPlaceholder')}
        />
        <Button type="submit" className="w-full" loading={loading}>
          {t('register.submit')}
        </Button>
      </form>
      <p className="text-center mt-5 text-surface-500 text-sm">
        {t('register.hasAccount')}{' '}
        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
          {t('register.signIn')}
        </Link>
      </p>
    </div>
  );
}
