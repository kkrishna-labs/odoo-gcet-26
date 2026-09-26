import {
  Archive,
  ArrowRight,
  Edit2,
  MapPin,
  Package,
  RefreshCw,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import UpdateStockModal from '../../components/operations/UpdateStockModal.jsx';
import { Badge, StockBadge } from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/States.jsx';
import Table from '../../components/ui/Table.jsx';
import useAsync from '../../hooks/useAsync.js';
import useToast from '../../hooks/useToast.js';
import { PATHS, toPath } from '../../routes/paths.js';
import { ledgerApi } from '../../services/ledgerApi.js';
import { productApi } from '../../services/productApi.js';
import { LEDGER_TYPE_META } from '../../utils/constants.js';
import { formatDateTime, formatMoney, formatQty } from '../../utils/format.js';

function Detail({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted uppercase tracking-wider">{label}</dt>
      <dd className="mt-1 text-sm text-text-strong">{children}</dd>
    </div>
  );
}

function StatCard({ label, value, unit, tone }) {
  return (
    <div className="rounded-xl border border-border bg-surface-2/50 p-4">
      <p className="text-xs font-medium text-muted uppercase tracking-wider">{label}</p>
      <p className={`mt-2 text-2xl font-bold tabular-nums ${tone ?? 'text-text-strong'}`}>
        {value}
      </p>
      {unit && <p className="mt-0.5 text-xs text-muted">{unit}</p>}
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const product = useAsync(() => productApi.get(id), [id]);
  const moves = useAsync(() => ledgerApi.list({ product: id, limit: 10 }), [id]);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [updateAt, setUpdateAt] = useState(null);

  if (product.error) return <ErrorState error={product.error} onRetry={product.reload} />;
  if (!product.data) return <LoadingState />;
  const p = product.data;

  const archive = async () => {
    setArchiving(true);
    try {
      await productApi.archive(id);
      toast.success(`${p.name} archived`);
      navigate(PATHS.PRODUCTS);
    } catch (err) {
      toast.error(err.message);
      setArchiving(false);
    }
  };

  const DIRECTION_STYLE = { in: 'text-success', out: 'text-danger', internal: 'text-info' };
  const SIGN = { in: '+', out: '-', internal: '' };

  const moveColumns = [
    {
      key: 'createdAt',
      header: 'Date',
      render: (m) => <span className="text-muted text-xs">{formatDateTime(m.createdAt)}</span>,
    },
    {
      key: 'reference',
      header: 'Reference',
      render: (m) => (
        <span className={`font-medium ${DIRECTION_STYLE[m.direction]}`}>
          {m.reference || LEDGER_TYPE_META[m.refType]}
        </span>
      ),
    },
    {
      key: 'from',
      header: 'From',
      render: (m) => m.fromLocation?.fullName ?? (m.contact || 'Vendor'),
    },
    {
      key: 'to',
      header: 'To',
      render: (m) => m.toLocation?.fullName ?? (m.contact || 'Customer'),
    },
    {
      key: 'quantity',
      header: 'Qty',
      align: 'right',
      render: (m) => (
        <span className={`tabular-nums font-semibold ${DIRECTION_STYLE[m.direction]}`}>
          {SIGN[m.direction]}
          {formatQty(m.quantity)}
        </span>
      ),
    },
  ];

  return (
    <section className="space-y-5 fade-in">
      <PageHeader title={p.name} subtitle={`SKU · ${p.sku}`}>
        {!p.isActive && <Badge tone="danger">Archived</Badge>}
        <StockBadge status={p.stockStatus} />
        {p.isActive && (
          <Button variant="outline" size="sm" icon="edit" onClick={() => setUpdateAt('')}>
            Update stock
          </Button>
        )}
        <Button
          as={Link}
          to={toPath(PATHS.PRODUCT_EDIT, { id })}
          variant="secondary"
          size="sm"
          icon="edit"
        >
          Edit
        </Button>
        {p.isActive && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => setConfirmArchive(true)}
          >
            <Archive className="h-3.5 w-3.5" />
            Archive
          </Button>
        )}
      </PageHeader>

      {/* Availability stat bar */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-3">
        <StatCard label="On hand"    value={formatQty(p.onHand)}    unit={p.uom} />
        <StatCard label="Reserved"   value={formatQty(p.reserved)}  unit={p.uom} tone="text-warning" />
        <StatCard label="Free to use" value={formatQty(p.freeToUse)} unit={p.uom} tone="text-success" />
      </div>

      {/* Details + stock-by-location */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Product details" className="lg:col-span-2">
          <dl className="grid gap-4 sm:grid-cols-3">
            <Detail label="Category">{p.category?.name ?? '—'}</Detail>
            <Detail label="Unit of measure">{p.uom}</Detail>
            <Detail label="Unit cost">{formatMoney(p.unitCost)}</Detail>
            <Detail label="Reorder level">{formatQty(p.reorderLevel)} {p.uom}</Detail>
            <Detail label="Reorder quantity">{formatQty(p.reorderQty)} {p.uom}</Detail>
            <Detail label="Description">{p.description || '—'}</Detail>
          </dl>
        </Card>

        <Card
          title="Stock by location"
          actions={
            p.isActive && (
              <Button variant="ghost" size="sm" onClick={() => setUpdateAt('')} icon="edit">
                Update
              </Button>
            )
          }
          bodyClassName="p-0"
        >
          {p.stockByLocation.length ? (
            <ul className="divide-y divide-border/60">
              {p.stockByLocation.map((r) => (
                <li
                  key={r.location._id}
                  className="flex items-center justify-between gap-2 px-5 py-3 hover:bg-surface-2/40 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-sm font-medium text-text-strong">
                      <MapPin className="h-3 w-3 text-muted shrink-0" />
                      {r.location.fullName}
                    </p>
                    <p className="text-xs text-muted">{r.warehouse.name}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="tabular-nums text-sm font-semibold text-text-strong">
                      {formatQty(r.quantity)}
                    </p>
                    <p className="text-xs text-muted">
                      {formatQty(r.freeToUse)} free
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="No stock yet"
              message="Validate a receipt or adjustment to add stock."
              className="py-8"
            />
          )}
        </Card>
      </div>

      {/* Recent moves */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-strong uppercase tracking-wider">
            Recent moves
          </h2>
          <Link
            to={`${PATHS.MOVE_HISTORY}?product=${id}`}
            className="flex items-center gap-1 text-xs text-accent hover:underline"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <Table
          columns={moveColumns}
          rows={moves.data?.items}
          loading={moves.loading}
          error={moves.error}
          onRetry={moves.reload}
          empty={<EmptyState title="No moves yet" className="py-8" />}
        />
      </div>

      {updateAt !== null && (
        <UpdateStockModal
          product={p}
          defaultLocation={updateAt}
          onClose={() => setUpdateAt(null)}
          onDone={(adj) => {
            toast.success(`Stock updated (${adj.reference})`);
            setUpdateAt(null);
            product.reload();
            moves.reload();
          }}
        />
      )}

      <ConfirmDialog
        open={confirmArchive}
        title="Archive product?"
        message={`${p.name} will be hidden from product lists. Its full history stays in the ledger and can be referenced in move history.`}
        confirmLabel="Archive"
        tone="danger"
        loading={archiving}
        onConfirm={archive}
        onClose={() => setConfirmArchive(false)}
      />
    </section>
  );
}
