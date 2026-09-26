import { Plus, Trash2 } from 'lucide-react';
import { controlClass } from '../ui/Form.jsx';
import { formatQty, productLabel } from '../../utils/format.js';

let keySeq = 0;
/** New empty line. `key` is a client-only id for React lists. */
export const newLine = (fields = {}) => ({
  key: `line-${++keySeq}`,
  product: '',
  quantity: '',
  ...fields,
});

/**
 * Product lines table.
 *   lines:        [{ key, product (id), quantity, ...extra }]
 *   onChange:     state setter
 *   products:     { options, byId } from useProductOptions()
 *   quantityKey:  "quantity" or "countedQuantity"
 *   extraColumns: [{ header, render(line), align }]
 *   lineErrors:   { [key]: message }
 *   rowTone(line):'danger' to highlight a line
 */
export default function LinesEditor({
  lines,
  onChange,
  products,
  readOnly = false,
  quantityKey = 'quantity',
  quantityLabel = 'Quantity',
  extraColumns = [],
  lineErrors = {},
  rowTone,
  error,
}) {
  const update = (key, patch) =>
    onChange((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  const remove = (key) =>
    onChange((prev) => prev.filter((l) => l.key !== key));
  const used = new Set(lines.map((l) => l.product));

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full min-w-[520px] text-sm border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface-2/50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                Product
              </th>
              <th className="w-36 px-4 py-3 text-right text-xs font-semibold text-muted uppercase tracking-wider">
                {quantityLabel}
              </th>
              {extraColumns.map((c) => (
                <th
                  key={c.header}
                  className={`px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider ${
                    c.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  {c.header}
                </th>
              ))}
              {!readOnly && <th className="w-10" />}
            </tr>
          </thead>
          <tbody>
            {lines.map((line, i) => {
              const product = products.byId[line.product] ?? line.productRef;
              const danger = rowTone?.(line) === 'danger';
              return (
                <tr
                  key={line.key}
                  className={`border-b border-border/60 last:border-b-0 align-top transition-colors ${
                    danger ? 'bg-danger/8' : i % 2 !== 0 ? 'bg-surface-2/20' : ''
                  }`}
                >
                  <td className="px-4 py-2.5">
                    {readOnly ? (
                      <span className={danger ? 'text-danger font-medium' : 'text-text-strong'}>
                        {productLabel(product)}
                      </span>
                    ) : (
                      <select
                        aria-label="Product"
                        className={`${controlClass(lineErrors[line.key] && !line.product)} cursor-pointer`}
                        value={line.product}
                        onChange={(e) => update(line.key, { product: e.target.value })}
                      >
                        <option value="">Select a product…</option>
                        {products.options.map((o) => (
                          <option
                            key={o.value}
                            value={o.value}
                            disabled={used.has(o.value) && o.value !== line.product}
                          >
                            {o.label}
                          </option>
                        ))}
                      </select>
                    )}
                    {lineErrors[line.key] && (
                      <p className="mt-1 text-xs text-danger">{lineErrors[line.key]}</p>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {readOnly ? (
                      <span className={danger ? 'text-danger font-medium' : 'text-text-strong'}>
                        {formatQty(line[quantityKey])} {product?.uom}
                      </span>
                    ) : (
                      <input
                        aria-label={quantityLabel}
                        type="number"
                        min="0"
                        step="any"
                        className={`${controlClass(false)} text-right`}
                        value={line[quantityKey] ?? ''}
                        onChange={(e) =>
                          update(line.key, { [quantityKey]: e.target.value })
                        }
                      />
                    )}
                  </td>
                  {extraColumns.map((c) => (
                    <td
                      key={c.header}
                      className={`px-4 py-2.5 ${c.align === 'right' ? 'text-right' : ''}`}
                    >
                      {c.render(line)}
                    </td>
                  ))}
                  {!readOnly && (
                    <td className="px-2 py-2.5">
                      <button
                        type="button"
                        onClick={() => remove(line.key)}
                        aria-label="Remove line"
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-danger/10 hover:text-danger transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
            {lines.length === 0 && (
              <tr>
                <td
                  colSpan={3 + extraColumns.length + (!readOnly ? 1 : 0)}
                  className="px-4 py-8 text-center text-sm text-muted"
                >
                  No products added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
      {!readOnly && (
        <button
          type="button"
          onClick={() =>
            onChange((prev) => [...prev, newLine({ [quantityKey]: '' })])
          }
          className="mt-3 flex items-center gap-1.5 rounded-lg border border-dashed border-accent/30 px-3 py-2 text-xs font-medium text-accent hover:bg-accent-muted hover:border-accent/60 transition-all"
        >
          <Plus className="h-3.5 w-3.5" />
          Add a product
        </button>
      )}
    </div>
  );
}
