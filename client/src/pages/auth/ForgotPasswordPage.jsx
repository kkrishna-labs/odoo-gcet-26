import { Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import Button from '../../components/ui/Button.jsx';
import Form from '../../components/ui/Form.jsx';
import Input from '../../components/ui/Input.jsx';
import { Alert } from '../../components/ui/States.jsx';
import useForm from '../../hooks/useForm.js';
import { PATHS } from '../../routes/paths.js';
import { authApi } from '../../services/authApi.js';
import { validateEmail } from '../../utils/validation.js';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const form = useForm({ email: '' });

  const onSubmit = form.submit({ email: validateEmail }, async ({ email }) => {
    const result = await authApi.forgotPassword({ email: email.trim() });
    navigate(PATHS.RESET_PASSWORD, {
      state: { email: email.trim(), devOtp: result.devOtp },
    });
  });

  return (
    <>
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-muted border border-accent/20">
          <Mail className="h-5 w-5 text-accent" />
        </span>
        <div>
          <h1 className="text-lg font-bold text-text-strong">Forgot password?</h1>
          <p className="text-xs text-muted">We'll send a 6-digit code to your email</p>
        </div>
      </div>

      <Form onSubmit={onSubmit}>
        {form.formError && <Alert>{form.formError}</Alert>}
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={form.values.email}
          onChange={form.setField('email')}
          error={form.errors.email}
          autoFocus
          placeholder="you@example.com"
        />
        <Button type="submit" className="mt-1 w-full" size="lg" loading={form.submitting}>
          <Mail className="h-4 w-4" />
          Send OTP
        </Button>
      </Form>

      <p className="mt-5 text-center text-xs">
        <Link to={PATHS.LOGIN} className="text-accent hover:underline">
          ← Back to sign in
        </Link>
      </p>
    </>
  );
}
