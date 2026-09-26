import { Calendar } from 'lucide-react';
import { StatusBadge } from '../ui/Badge.jsx';
import { STATUS_META } from '../../utils/constants.js';
import { formatDate, isLate } from '../../utils/format.js';

/**
 * Kanban view of operation documents grouped by status.
 * Each column shows a count badge and clickable cards.
 */
export default function KanbanBoard({ statuses, docs, onOpen, describe }) {
  return (
    <div className="grid gap-4 overflow-x-auto pb-2 md:grid-cols-[repeat(auto-fit,minmax(15rem,1fr))]">
      {statuses.map((status) => {
        const items = docs.filter((d) => d.status === status);
        return (
          <div
            key={status}
            className="min-w-56 rounded-2xl border border-border bg-surface shadow-md shadow-black/20 overflow-hidden"
          >
            <header className="flex items-center justify-between border-b border-border bg-surface-2/50 px-4 py-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted">
                {STATUS_META[status].label}
              </span>
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-surface-3 px-1.5 text-xs font-bold text-text-strong">
                {items.length}
              </span>
            </header>

            <div className="space-y-2 p-3 min-h-[4rem]">
              {items.length === 0 && (
                <p className="py-6 text-center text-xs text-muted/60">Nothing here</p>
              )}
              {items.map((d) => (
                <button
                  key={d._id}
                  type="button"
                  onClick={() => onOpen(d)}
                  className="group block w-full rounded-xl border border-border bg-surface-2 p-3.5 text-left hover:border-accent/40 hover:bg-surface-3 hover:shadow-md hover:shadow-accent/5 transition-all duration-150"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold text-text-strong group-hover:text-accent transition-colors">
                      {d.reference}
                    </span>
                    <StatusBadge status={d.status} />
                  </div>
                  <p className="mt-1.5 truncate text-xs text-muted">{describe(d)}</p>
                  <p
                    className={`mt-2 flex items-center gap-1 text-xs ${
                      isLate(d.scheduledDate, d.status) ? 'text-danger' : 'text-muted/60'
                    }`}
                  >
                    <Calendar className="h-3 w-3" />
                    {formatDate(d.scheduledDate)}
                  </p>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
