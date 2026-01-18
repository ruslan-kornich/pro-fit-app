import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import { toast } from '../utils/toast';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});

    if (!email) {
      setErrors((prev) => ({ ...prev, email: 'Email is required' }));
      return;
    }
    if (!password) {
      setErrors((prev) => ({ ...prev, password: 'Password is required' }));
      return;
    }

    setLoading(true);
    try {
      await login({ email, password });
      toast.success('Welcome back!');
    } catch (error) {
      toast.error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-6">Sign In</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
          placeholder="your@email.com"
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
          placeholder="Enter your password"
        />
        <Button type="submit" className="w-full" loading={loading}>
          Sign In
        </Button>
      </form>
      <p className="text-center mt-4 text-gray-600">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary-500 hover:underline">
          Sign Up
        </Link>
      </p>
    </div>
  );
}
