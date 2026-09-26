/** <Form onSubmit={fn}> prevents the default browser submit and calls fn(event). */
export default function Form({ onSubmit, className = '', children, ...props }) {
  return (
    <form
      noValidate
      className={`space-y-4 ${className}`}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(e);
      }}
      {...props}
    >
      {children}
    </form>
  );
}

/** Label + control + error/hint. Used by Input, Select and Textarea. */
export function FormField({ label, htmlFor, required, error, hint, className = '', children }) {
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="mb-1.5 block text-xs font-medium text-muted uppercase tracking-wider"
        >
          {label}
          {required && <span className="ml-1 text-accent">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="mt-1.5 text-xs text-danger flex items-center gap-1">{error}</p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-muted leading-relaxed">{hint}</p>
      )}
    </div>
  );
}

/** Responsive two-column grid for form fields. */
export function FormGrid({ className = '', children }) {
  return <div className={`grid gap-4 sm:grid-cols-2 ${className}`}>{children}</div>;
}

export function FormActions({ className = '', children }) {
  return (
    <div className={`flex flex-wrap items-center justify-end gap-2.5 pt-3 ${className}`}>
      {children}
    </div>
  );
}

export const controlClass = (error) =>
  `block w-full rounded-xl border bg-surface-2 px-3.5 py-2.5 text-sm text-text-strong placeholder:text-muted/50 transition-all focus:border-accent focus:ring-2 focus:ring-accent/15 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
    error ? 'border-danger/60 focus:border-danger focus:ring-danger/15' : 'border-border hover:border-border-2'
  }`;
