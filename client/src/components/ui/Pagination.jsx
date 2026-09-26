import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button.jsx';

/** Pagination for the API's { page, totalPages, total } list payload. */
export default function Pagination({ page, totalPages, total, onChange }) {
  if (!totalPages || totalPages <= 1) {
    return total ? (
      <p className="mt-3 text-xs text-muted text-right">{total} record{total !== 1 ? 's' : ''}</p>
    ) : null;
  }

  return (
    <div className="mt-4 flex items-center justify-between gap-3 text-xs text-muted">
      <span className="text-muted">
        Page <span className="font-medium text-text-strong">{page}</span> of{' '}
        <span className="font-medium text-text-strong">{totalPages}</span>
        <span className="ml-2 text-muted/60">· {total} record{total !== 1 ? 's' : ''}</span>
      </span>
      <div className="flex gap-1.5">
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Prev
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          aria-label="Next page"
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
