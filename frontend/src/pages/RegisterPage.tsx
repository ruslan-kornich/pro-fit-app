import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import { toast } from '../utils/toast';

export default function RegisterPage() {
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
      setErrors((prev) => ({ ...prev, email: 'Email is required' }));
      return;
    }
    if (!password) {
      setErrors((prev) => ({ ...prev, password: 'Password is required' }));
      return;
    }
    if (password.length < 6) {
      setErrors((prev) => ({ ...prev, password: 'Password must be at least 6 characters' }));
      return;
    }
    if (password !== confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      return;
    }

    setLoading(true);
    try {
      await register({ email, password });
      toast.success('Account created successfully!');
    } catch (error) {
      toast.error('Registration failed. Email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>
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
          placeholder="Create a password"
        />
        <Input
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          error={errors.confirmPassword}
          placeholder="Confirm your password"
        />
        <Button type="submit" className="w-full" loading={loading}>
          Create Account
        </Button>
      </form>
      <p className="text-center mt-4 text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-500 hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}
