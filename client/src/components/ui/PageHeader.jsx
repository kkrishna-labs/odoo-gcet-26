import { Plus } from 'lucide-react';
import { Link } from 'react-router';
import Button from './Button.jsx';

/**
 * Page title row:  [NEW]  Title / Subtitle  ........  [toolbar]
 * Coral underline and gradient title.
 */
export default function PageHeader({
  title,
  subtitle,
  newTo,
  onNew,
  newLabel = 'New',
  children,
}) {
  return (
    <div className="mb-6 pb-4 border-b border-border/60">
      <div className="flex flex-wrap items-center gap-3">
        {newTo && (
          <Button as={Link} to={newTo} variant="outline" size="sm" icon="plus">
            {newLabel}
          </Button>
        )}
        {onNew && (
          <Button variant="outline" size="sm" icon="plus" onClick={onNew}>
            {newLabel}
          </Button>
        )}

        <div className="mr-auto min-w-0">
          <h1 className="truncate text-xl font-bold text-text-strong tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-0.5 text-xs text-muted">{subtitle}</p>
          )}
        </div>

        {children && (
          <div className="flex flex-wrap items-center gap-2">{children}</div>
        )}
      </div>
    </div>
  );
}
