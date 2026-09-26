import { KeyRound, LogIn } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router';
import Button from '../../components/ui/Button.jsx';
import Form from '../../components/ui/Form.jsx';
import Input from '../../components/ui/Input.jsx';
import { Alert } from '../../components/ui/States.jsx';
import useAuth from '../../hooks/useAuth.js';
import useForm from '../../hooks/useForm.js';
import { PATHS } from '../../routes/paths.js';
import { authApi } from '../../services/authApi.js';
import { required } from '../../utils/validation.js';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const form = useForm({ loginId: '', password: '' });

  const onSubmit = form.submit(
    { loginId: required('Login ID'), password: required('Password') },
    async (values) => {
      const { token, user } = await authApi.login(values);
      login(token, user);
      navigate(location.state?.from?.pathname ?? PATHS.DASHBOARD, { replace: true });
    }
  );

  return (
    <>
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-muted border border-accent/20">
          <LogIn className="h-5 w-5 text-accent" />
        </span>
        <div>
          <h1 className="text-lg font-bold text-text-strong">Welcome back</h1>
          <p className="text-xs text-muted">Sign in to your StockSense account</p>
        </div>
      </div>

      <Form onSubmit={onSubmit}>
        {form.formError && <Alert>{form.formError}</Alert>}
        <Input
          label="Login ID"
          autoComplete="username"
          value={form.values.loginId}
          onChange={form.setField('loginId')}
          error={form.errors.loginId}
          autoFocus
          placeholder="Enter your login ID"
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          value={form.values.password}
          onChange={form.setField('password')}
          error={form.errors.password}
          placeholder="••••••••"
        />
        <Button type="submit" className="mt-1 w-full" size="lg" loading={form.submitting}>
          <LogIn className="h-4 w-4" />
          Sign In
        </Button>
      </Form>

      <div className="mt-6 flex items-center justify-between text-sm">
        <Link to={PATHS.FORGOT_PASSWORD} className="text-accent hover:underline text-xs flex items-center gap-1">
          <KeyRound className="h-3 w-3" />
          Forgot password?
        </Link>
        <Link to={PATHS.SIGNUP} className="text-xs text-muted hover:text-accent transition-colors">
          No account?{' '}
          <span className="text-accent font-medium">Sign up</span>
        </Link>
      </div>
    </>
  );
}
