import { Grid3x3, List } from 'lucide-react';

/** List / kanban view toggle from the mockup. */
export default function ViewToggle({ value, onChange }) {
  const item = (view, Icon, label) => (
    <button
      type="button"
      onClick={() => onChange(view)}
      aria-pressed={value === view}
      aria-label={label}
      title={label}
      className={`flex h-8 w-8 items-center justify-center transition-colors ${
        value === view
          ? 'bg-accent-muted text-accent'
          : 'text-muted hover:text-text-strong hover:bg-surface-3'
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );

  return (
    <div className="flex overflow-hidden rounded-xl border border-border bg-surface-2">
      {item('list', List, 'List view')}
      {item('kanban', Grid3x3, 'Kanban view')}
    </div>
  );
}
