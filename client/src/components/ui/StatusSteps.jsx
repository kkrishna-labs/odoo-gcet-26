import { STATUS_META } from '../../utils/constants.js';
import { CheckCircle2 } from 'lucide-react';

/** Status trail: Draft › Ready › Done — highlighting the current step. */
export default function StatusSteps({ steps, current }) {
  if (current === 'canceled') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-danger/30 bg-danger/8 px-3 py-1 text-xs font-medium text-danger">
        <span className="h-1.5 w-1.5 rounded-full bg-danger" />
        Canceled
      </span>
    );
  }

  const currentIndex = steps.indexOf(current);

  return (
    <ol className="flex items-center gap-0.5" aria-label="Status">
      {steps.map((step, i) => {
        const isDone = i < currentIndex;
        const isCurrent = step === current;
        return (
          <li key={step} className="flex items-center">
            {i > 0 && (
              <span className={`mx-1 text-xs ${isDone ? 'text-accent/40' : 'text-muted/30'}`}>›</span>
            )}
            <span
              aria-current={isCurrent ? 'step' : undefined}
              className={`text-xs font-medium px-2 py-1 rounded-md transition-colors ${
                isCurrent
                  ? 'bg-accent-muted text-accent font-semibold'
                  : isDone
                  ? 'text-text/60'
                  : 'text-muted/50'
              }`}
            >
              {isDone && <CheckCircle2 className="inline h-3 w-3 mr-1 -mt-0.5 text-accent/60" />}
              {STATUS_META[step]?.label ?? step}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
