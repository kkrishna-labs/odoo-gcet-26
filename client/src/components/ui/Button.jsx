import { Loader2 } from 'lucide-react';
import Icon from './Icon.jsx';

const VARIANTS = {
  primary:
    'bg-accent text-bg font-semibold shadow-sm shadow-accent/20 hover:bg-accent-hover hover:shadow-accent/30 hover:shadow-md active:scale-[0.98]',
  outline:
    'border border-accent/60 text-accent bg-accent-muted/30 hover:bg-accent-muted hover:border-accent active:scale-[0.98]',
  secondary:
    'border border-border-2 bg-surface-2 text-text hover:bg-surface-3 hover:border-border-2 hover:text-text-strong active:scale-[0.98]',
  ghost:
    'text-muted hover:bg-surface-2 hover:text-text-strong active:scale-[0.98]',
  danger:
    'border border-danger/40 text-danger bg-danger/5 hover:bg-danger/10 hover:border-danger/60 active:scale-[0.98]',
};

const SIZES = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-9 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-11 px-5 text-sm gap-2 rounded-xl',
};

/**
 * <Button variant="primary|outline|secondary|ghost|danger" size="sm|md|lg" icon="plus" loading />
 * Pass `as={Link} to="..."` to render a router link styled as a button.
 */
export default function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  className = '',
  children,
  ...props
}) {
  const isButton = Component === 'button';
  return (
    <Component
      {...(isButton && { type: props.type ?? 'button', disabled: disabled || loading })}
      className={`inline-flex shrink-0 items-center justify-center font-medium transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-40 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        icon && <Icon name={icon} className="h-3.5 w-3.5" />
      )}
      {children}
    </Component>
  );
}
