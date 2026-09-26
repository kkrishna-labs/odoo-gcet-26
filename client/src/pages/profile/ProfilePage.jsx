import { KeyRound, User } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import Form, { FormActions } from '../../components/ui/Form.jsx';
import Input from '../../components/ui/Input.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import { Alert } from '../../components/ui/States.jsx';
import useAuth from '../../hooks/useAuth.js';
import useForm from '../../hooks/useForm.js';
import useToast from '../../hooks/useToast.js';
import { authApi } from '../../services/authApi.js';
import { validateEmail, validatePassword } from '../../utils/validation.js';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const profile = useForm({ name: user?.name ?? '', email: user?.email ?? '' });
  const password = useForm({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const saveProfile = profile.submit(
    { email: validateEmail },
    async (values) => {
      const updated = await authApi.updateMe({
        name: values.name.trim(),
        email: values.email.trim(),
      });
      setUser(updated);
      toast.success('Profile updated');
    }
  );

  const savePassword = password.submit(
    {
      currentPassword: (v) => (v ? null : 'Current password is required'),
      newPassword: validatePassword,
      confirmPassword: (v, all) =>
        v !== all.newPassword ? 'Passwords do not match' : null,
    },
    async ({ currentPassword, newPassword }) => {
      const result = await authApi.changePassword({ currentPassword, newPassword });
      password.setValues({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success(result.message);
    }
  );

  const displayName = user?.name || user?.loginId || 'User';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <section className="fade-in">
      <PageHeader
        title="My Profile"
        subtitle={user ? `Signed in as ${user.loginId}` : undefined}
      />

      {/* Avatar banner */}
      <div className="mb-6 flex items-center gap-4 rounded-2xl border border-border bg-surface p-5 shadow-md shadow-black/20">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/30 bg-accent-muted text-2xl font-bold text-accent shadow-sm">
          {initial}
        </span>
        <div>
          <p className="text-base font-bold text-text-strong">{displayName}</p>
          <p className="text-xs text-muted">{user?.email ?? 'No email set'}</p>
          <p className="mt-0.5 text-xs text-muted/60">Login ID: {user?.loginId}</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Profile info */}
        <Card
          title="Profile Information"
          actions={
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-surface-3">
              <User className="h-3.5 w-3.5 text-muted" />
            </span>
          }
        >
          <Form onSubmit={saveProfile}>
            {profile.formError && <Alert>{profile.formError}</Alert>}
            <Input
              label="Login ID"
              value={user?.loginId ?? ''}
              disabled
              hint="Login ID cannot be changed"
            />
            <Input
              label="Full name"
              value={profile.values.name}
              onChange={profile.setField('name')}
              error={profile.errors.name}
              placeholder="Your display name"
            />
            <Input
              label="Email"
              type="email"
              value={profile.values.email}
              onChange={profile.setField('email')}
              error={profile.errors.email}
              placeholder="you@example.com"
            />
            <FormActions>
              <Button type="submit" loading={profile.submitting}>
                Save profile
              </Button>
            </FormActions>
          </Form>
        </Card>

        {/* Change password */}
        <Card
          title="Change Password"
          actions={
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-surface-3">
              <KeyRound className="h-3.5 w-3.5 text-muted" />
            </span>
          }
        >
          <Form onSubmit={savePassword}>
            {password.formError && <Alert>{password.formError}</Alert>}
            <Input
              label="Current password"
              type="password"
              autoComplete="current-password"
              value={password.values.currentPassword}
              onChange={password.setField('currentPassword')}
              error={password.errors.currentPassword}
              placeholder="••••••••"
            />
            <Input
              label="New password"
              type="password"
              autoComplete="new-password"
              value={password.values.newPassword}
              onChange={password.setField('newPassword')}
              error={password.errors.newPassword}
              placeholder="••••••••"
            />
            <Input
              label="Re-enter new password"
              type="password"
              autoComplete="new-password"
              value={password.values.confirmPassword}
              onChange={password.setField('confirmPassword')}
              error={password.errors.confirmPassword}
              placeholder="••••••••"
            />
            <FormActions>
              <Button type="submit" loading={password.submitting}>
                Update password
              </Button>
            </FormActions>
          </Form>
        </Card>
      </div>
    </section>
  );
}
