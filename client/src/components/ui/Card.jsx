/**
 * Glass-morphism card with optional header section.
 * Usage: <Card title="..." actions={<Button>...</Button>} />
 */
export default function Card({ title, actions, className = '', bodyClassName = 'p-5', children }) {
  return (
    <section
      className={`rounded-2xl border border-border bg-surface backdrop-blur-sm shadow-lg shadow-black/30 ${className}`}
    >
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-3.5">
          {title && (
            <h2 className="text-sm font-semibold text-text-strong tracking-wide">{title}</h2>
          )}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}
