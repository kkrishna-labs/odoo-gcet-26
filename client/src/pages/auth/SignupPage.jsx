import { UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import Button from '../../components/ui/Button.jsx';
import Form from '../../components/ui/Form.jsx';
import Input from '../../components/ui/Input.jsx';
import { Alert } from '../../components/ui/States.jsx';
import useAuth from '../../hooks/useAuth.js';
import useForm from '../../hooks/useForm.js';
import { PATHS } from '../../routes/paths.js';
import { authApi } from '../../services/authApi.js';
import { validateEmail, validateLoginId, validatePassword } from '../../utils/validation.js';

export default function SignupPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const form = useForm({ loginId: '', email: '', password: '', confirmPassword: '' });

  const onSubmit = form.submit(
    {
      loginId: validateLoginId,
      email: validateEmail,
      password: validatePassword,
      confirmPassword: (v, all) =>
        v !== all.password ? 'Passwords do not match' : null,
    },
    async ({ loginId, email, password }) => {
      const { token, user } = await authApi.signup({
        loginId: loginId.trim(),
        email: email.trim(),
        password,
      });
      login(token, user);
      navigate(PATHS.DASHBOARD, { replace: true });
    }
  );

  return (
    <>
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-muted border border-accent/20">
          <UserPlus className="h-5 w-5 text-accent" />
        </span>
        <div>
          <h1 className="text-lg font-bold text-text-strong">Create account</h1>
          <p className="text-xs text-muted">Set up your StockSense login</p>
        </div>
      </div>

      <Form onSubmit={onSubmit}>
        {form.formError && <Alert>{form.formError}</Alert>}
        <Input
          label="Login ID"
          hint="6–12 characters, must be unique"
          autoComplete="username"
          value={form.values.loginId}
          onChange={form.setField('loginId')}
          error={form.errors.loginId}
          autoFocus
          placeholder="e.g. john_doe"
        />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={form.values.email}
          onChange={form.setField('email')}
          error={form.errors.email}
          placeholder="you@example.com"
        />
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          hint="8+ chars with upper, lower and a special character"
          value={form.values.password}
          onChange={form.setField('password')}
          error={form.errors.password}
          placeholder="••••••••"
        />
        <Input
          label="Re-enter password"
          type="password"
          autoComplete="new-password"
          value={form.values.confirmPassword}
          onChange={form.setField('confirmPassword')}
          error={form.errors.confirmPassword}
          placeholder="••••••••"
        />
        <Button type="submit" className="mt-1 w-full" size="lg" loading={form.submitting}>
          <UserPlus className="h-4 w-4" />
          Create Account
        </Button>
      </Form>

      <p className="mt-5 text-center text-xs text-muted">
        Already have an account?{' '}
        <Link to={PATHS.LOGIN} className="text-accent font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
