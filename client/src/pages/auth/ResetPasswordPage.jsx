import { KeyRound } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router';
import Button from '../../components/ui/Button.jsx';
import Form from '../../components/ui/Form.jsx';
import Input from '../../components/ui/Input.jsx';
import { Alert } from '../../components/ui/States.jsx';
import useForm from '../../hooks/useForm.js';
import useToast from '../../hooks/useToast.js';
import { PATHS } from '../../routes/paths.js';
import { authApi } from '../../services/authApi.js';
import { validateEmail, validatePassword } from '../../utils/validation.js';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { state } = useLocation();
  const form = useForm({
    email: state?.email ?? '',
    otp: '',
    password: '',
    confirmPassword: '',
  });

  const onSubmit = form.submit(
    {
      email: validateEmail,
      otp: (v) => (/^\d{6}$/.test(v.trim()) ? null : 'OTP must be 6 digits'),
      password: validatePassword,
      confirmPassword: (v, all) =>
        v !== all.password ? 'Passwords do not match' : null,
    },
    async ({ email, otp, password }) => {
      const result = await authApi.resetPassword({
        email: email.trim(),
        otp: otp.trim(),
        password,
      });
      toast.success(result.message);
      navigate(PATHS.LOGIN, { replace: true });
    }
  );

  return (
    <>
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-muted border border-accent/20">
          <KeyRound className="h-5 w-5 text-accent" />
        </span>
        <div>
          <h1 className="text-lg font-bold text-text-strong">Reset password</h1>
          <p className="text-xs text-muted">Enter your OTP and choose a new password</p>
        </div>
      </div>

      {state?.devOtp && (
        <Alert tone="info" className="mb-5">
          Demo mode — your OTP is <strong className="font-mono">{state.devOtp}</strong>
        </Alert>
      )}

      <Form onSubmit={onSubmit}>
        {form.formError && <Alert>{form.formError}</Alert>}
        <Input
          label="Email"
          type="email"
          value={form.values.email}
          onChange={form.setField('email')}
          error={form.errors.email}
          placeholder="you@example.com"
        />
        <Input
          label="OTP"
          inputMode="numeric"
          maxLength={6}
          autoComplete="one-time-code"
          value={form.values.otp}
          onChange={form.setField('otp')}
          error={form.errors.otp}
          autoFocus
          placeholder="6-digit code"
        />
        <Input
          label="New password"
          type="password"
          autoComplete="new-password"
          value={form.values.password}
          onChange={form.setField('password')}
          error={form.errors.password}
          placeholder="••••••••"
        />
        <Input
          label="Re-enter new password"
          type="password"
          autoComplete="new-password"
          value={form.values.confirmPassword}
          onChange={form.setField('confirmPassword')}
          error={form.errors.confirmPassword}
          placeholder="••••••••"
        />
        <Button type="submit" className="mt-1 w-full" size="lg" loading={form.submitting}>
          <KeyRound className="h-4 w-4" />
          Reset Password
        </Button>
      </Form>

      <p className="mt-5 text-center text-xs">
        <Link to={PATHS.FORGOT_PASSWORD} className="text-accent hover:underline">
          Send a new code
        </Link>
      </p>
    </>
  );
}
