import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { createContext, useCallback, useMemo, useState } from 'react';

export const ToastContext = createContext(null);

const TONE_STYLES = {
  success: {
    wrapper: 'border-success/30 bg-surface',
    bar:     'bg-success',
    icon:    CheckCircle2,
    iconCls: 'text-success',
  },
  error: {
    wrapper: 'border-danger/30 bg-surface',
    bar:     'bg-danger',
    icon:    AlertTriangle,
    iconCls: 'text-danger',
  },
  info: {
    wrapper: 'border-info/30 bg-surface',
    bar:     'bg-info',
    icon:    Info,
    iconCls: 'text-info',
  },
};

let nextId = 1;

function Toast({ id, tone, message, onDismiss }) {
  const s = TONE_STYLES[tone] ?? TONE_STYLES.info;
  const Icon = s.icon;

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`relative overflow-hidden rounded-xl border shadow-2xl shadow-black/50 ${s.wrapper}`}
      style={{ animation: 'toastIn 0.22s cubic-bezier(0.16,1,0.3,1) forwards' }}
    >
      {/* accent bar */}
      <div className={`absolute left-0 top-0 h-full w-1 ${s.bar}`} />

      <div className="flex items-start gap-3 px-4 py-3 pl-5">
        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${s.iconCls}`} />
        <p className="flex-1 text-sm text-text-strong leading-snug">{message}</p>
        <button
          type="button"
          onClick={() => onDismiss(id)}
          className="ml-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-muted hover:text-text-strong hover:bg-surface-2 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

/** toast.success / toast.error / toast.info */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback(
    (id) => setToasts((list) => list.filter((t) => t.id !== id)),
    []
  );

  const show = useCallback(
    (tone, message) => {
      const id = nextId++;
      setToasts((list) => [...list.slice(-4), { id, tone, message }]);
      setTimeout(() => dismiss(id), tone === 'error' ? 6000 : 3500);
    },
    [dismiss]
  );

  const api = useMemo(
    () => ({
      success: (m) => show('success', m),
      error:   (m) => show('error',   m),
      info:    (m) => show('info',    m),
    }),
    [show]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}

      {/* Toast tray */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed right-4 bottom-4 z-[60] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <Toast {...t} onDismiss={dismiss} />
          </div>
        ))}
      </div>

      {/* keyframe injected once */}
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(1rem) scale(0.97); }
          to   { opacity: 1; transform: translateX(0)    scale(1); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}
