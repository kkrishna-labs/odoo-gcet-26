import { AlertTriangle, Box, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import Button from './Button.jsx';
import Icon from './Icon.jsx';

export function LoadingState({ label = 'Loading…', className = '' }) {
  return (
    <div
      className={`flex items-center justify-center gap-3 py-14 text-sm text-muted ${className}`}
      role="status"
    >
      <Loader2 className="h-5 w-5 animate-spin text-accent" />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({
  title = 'Nothing here yet',
  message,
  action,
  icon = 'box',
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center px-6 py-14 text-center ${className}`}
    >
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border-2 bg-surface-2 text-muted shadow-inner">
        <Icon name={icon} className="h-7 w-7" />
      </span>
      <p className="text-sm font-semibold text-text-strong">{title}</p>
      {message && (
        <p className="mt-1.5 max-w-sm text-sm text-muted leading-relaxed">{message}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry, className = '' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center px-6 py-14 text-center ${className}`}
      role="alert"
    >
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-danger/25 bg-danger/8 text-danger">
        <AlertTriangle className="h-7 w-7" />
      </span>
      <p className="text-sm font-semibold text-text-strong">Could not load data</p>
      <p className="mt-1.5 max-w-sm text-sm text-muted">{error?.message ?? String(error)}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" icon="refresh" className="mt-5" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

const ALERT_TONES = {
  danger:  'border-danger/30  bg-danger/8  text-danger',
  warning: 'border-warning/30 bg-warning/8 text-warning',
  info:    'border-info/30    bg-info/8    text-info',
  success: 'border-success/30 bg-success/8 text-success',
};

const ALERT_ICONS = {
  danger:  AlertTriangle,
  warning: AlertTriangle,
  info:    CheckCircle2,
  success: CheckCircle2,
};

/** Inline alert for form-level messages. */
export function Alert({ tone = 'danger', children, className = '' }) {
  const IconComp = ALERT_ICONS[tone] ?? AlertTriangle;
  return (
    <div
      className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm ${ALERT_TONES[tone]} ${className}`}
      role="alert"
    >
      <IconComp className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="leading-relaxed">{children}</div>
    </div>
  );
}
