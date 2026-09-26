import { STATUS_META, STOCK_STATUS_META } from '../../utils/constants.js';

const TONES = {
  neutral: 'border-border-2 bg-surface-3 text-text',
  accent:  'border-accent/30 bg-accent-muted text-accent',
  success: 'border-success/25 bg-success/8 text-success',
  warning: 'border-warning/25 bg-warning/8 text-warning',
  danger:  'border-danger/25 bg-danger/8 text-danger',
  info:    'border-info/25 bg-info/8 text-info',
};

export function Badge({ tone = 'neutral', className = '', children }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/** Operation status: draft | waiting | ready | done | canceled */
export function StatusBadge({ status }) {
  const meta = STATUS_META[status] ?? { label: status, tone: 'neutral' };
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}

/** Product stock status: in | low | out */
export function StockBadge({ status }) {
  const meta = STOCK_STATUS_META[status] ?? { label: status, tone: 'neutral' };
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}

export default Badge;
