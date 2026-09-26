import { EmptyState, ErrorState, LoadingState } from './States.jsx';

/**
 * Premium data table with hover rows and sticky header.
 *   columns: [{ key, header, render?(row), align?: 'left'|'right'|'center', className? }]
 *   rows:    array of objects; rowKey picks the React key (default "_id")
 */
export default function Table({
  columns,
  rows,
  rowKey = '_id',
  onRowClick,
  rowClassName,
  loading = false,
  error,
  onRetry,
  empty,
  className = '',
}) {
  const align = (c) =>
    c.align === 'right'
      ? 'text-right'
      : c.align === 'center'
      ? 'text-center'
      : 'text-left';
  const showLoading = loading && !rows?.length;

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-border bg-surface shadow-lg shadow-black/20 ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-2/60">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={`px-4 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider whitespace-nowrap ${align(c)}`}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          {!showLoading && !error && rows?.length > 0 && (
            <tbody className={loading ? 'opacity-50' : ''}>
              {rows.map((row, i) => (
                <tr
                  key={row[rowKey]}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`border-b border-border/60 last:border-b-0 transition-colors ${
                    onRowClick
                      ? 'cursor-pointer hover:bg-surface-2/70'
                      : ''
                  } ${i % 2 === 0 ? '' : 'bg-surface-2/20'} ${rowClassName?.(row) ?? ''}`}
                >
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={`px-4 py-3.5 ${align(c)} ${c.className ?? ''}`}
                    >
                      {c.render ? c.render(row) : row[c.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>
      {showLoading && <LoadingState />}
      {error && !loading && <ErrorState error={error} onRetry={onRetry} />}
      {!loading && !error && !rows?.length && (
        empty ?? <EmptyState title="No records found" />
      )}
    </div>
  );
}
