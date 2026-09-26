import {
  AlertTriangle,
  ArrowRight,
  Box,
  ClipboardCheck,
  Package,
  Truck,
  TrendingDown,
  TrendingUp,
  Warehouse,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Badge, StatusBadge, StockBadge } from '../../components/ui/Badge.jsx';
import Card from '../../components/ui/Card.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import Select from '../../components/ui/Select.jsx';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/States.jsx';
import Table from '../../components/ui/Table.jsx';
import useAsync from '../../hooks/useAsync.js';
import { useCategoryOptions, useWarehouseOptions } from '../../hooks/useLookups.js';
import { PATHS, toPath } from '../../routes/paths.js';
import { dashboardApi } from '../../services/dashboardApi.js';
import { DOCUMENT_TYPE_OPTIONS, STATUS_OPTIONS } from '../../utils/constants.js';
import { formatDate, formatQty, isLate } from '../../utils/format.js';
import { OPERATION_CONFIG } from '../../utils/operations.js';

const clean = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== '' && v !== undefined));

/** KPI stat card with optional icon and trend. */
function Kpi({ label, value, tone, to, icon: Icon, sublabel }) {
  const content = (
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-medium text-muted">{label}</p>
        <p
          className={`mt-2 text-2xl font-bold tracking-tight ${tone ?? 'text-text-strong'}`}
        >
          {value ?? '—'}
        </p>
        {sublabel && <p className="mt-0.5 text-xs text-muted">{sublabel}</p>}
      </div>
      {Icon && (
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
            tone === 'text-danger'
              ? 'border-danger/20 bg-danger/8 text-danger'
              : tone === 'text-warning'
              ? 'border-warning/20 bg-warning/8 text-warning'
              : tone === 'text-success'
              ? 'border-success/20 bg-success/8 text-success'
              : 'border-border bg-surface-2 text-muted'
          }`}
        >
          <Icon className="h-4 w-4" />
        </span>
      )}
    </div>
  );

  const base =
    'block rounded-2xl border border-border bg-surface p-4 shadow-md shadow-black/20 transition-all duration-150';

  return to ? (
    <Link to={to} className={`${base} hover:border-accent/40 hover:shadow-accent/5 hover:-translate-y-0.5`}>
      {content}
    </Link>
  ) : (
    <div className={base}>{content}</div>
  );
}

/** Operation summary card (receipts, deliveries). */
function OperationCard({ title, counts, actionLabel, to, stats, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-md shadow-black/20 hover:border-accent/30 transition-colors">
      <div className="flex items-center gap-2 mb-4">
        {Icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-muted border border-accent/20">
            <Icon className="h-4 w-4 text-accent" />
          </span>
        )}
        <h2 className="text-sm font-semibold text-text-strong">{title}</h2>
      </div>
      <div className="flex items-end justify-between gap-4">
        <Link
          to={to}
          className="group flex items-center gap-2 rounded-xl border border-accent/40 bg-accent-muted px-4 py-2.5 text-sm font-semibold text-accent hover:bg-accent-muted/80 hover:border-accent transition-colors"
        >
          <span className="text-xl font-bold">{counts?.ready ?? 0}</span>
          <span className="text-xs font-medium">{actionLabel}</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
        <ul className="space-y-1 text-right">
          {stats.map(([key, label]) => (
            <li key={key} className="flex items-center justify-end gap-2 text-xs">
              <span className="text-muted">{label}</span>
              <span
                className={`font-semibold tabular-nums ${
                  key === 'late' && counts?.[key] ? 'text-danger' : 'text-text-strong'
                }`}
              >
                {counts?.[key] ?? 0}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const warehouseOptions = useWarehouseOptions();
  const categoryOptions = useCategoryOptions();
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    warehouse: '',
    category: '',
  });
  const [page, setPage] = useState(1);

  const setFilter = (key) => (e) => {
    setFilters((f) => ({ ...f, [key]: e.target.value }));
    setPage(1);
  };

  const summary = useAsync(
    () =>
      dashboardApi.summary(
        clean({ warehouse: filters.warehouse, category: filters.category })
      ),
    [filters.warehouse, filters.category]
  );

  const operations = useAsync(
    () => dashboardApi.operations(clean({ ...filters, page })),
    [filters.type, filters.status, filters.warehouse, filters.category, page]
  );

  const s = summary.data;

  const columns = [
    {
      key: 'reference',
      header: 'Reference',
      render: (r) => (
        <span className="font-semibold text-text-strong">{r.reference}</span>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (r) => (
        <Badge tone="neutral">{OPERATION_CONFIG[r.type].singular}</Badge>
      ),
    },
    {
      key: 'from',
      header: 'From',
      render: (r) => (
        <span className="text-muted">{r.from ?? '—'}</span>
      ),
    },
    {
      key: 'to',
      header: 'To',
      render: (r) => (
        <span className="text-muted">{r.to ?? '—'}</span>
      ),
    },
    {
      key: 'scheduledDate',
      header: 'Scheduled',
      render: (r) => (
        <span className={isLate(r.scheduledDate, r.status) ? 'text-danger font-medium' : 'text-text'}>
          {formatDate(r.scheduledDate)}
        </span>
      ),
    },
    {
      key: 'totalQuantity',
      header: 'Qty',
      align: 'right',
      render: (r) => (
        <span className="tabular-nums font-medium text-text-strong">
          {formatQty(r.totalQuantity)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <StatusBadge status={r.status} />,
    },
  ];

  return (
    <section className="space-y-7 fade-in">
      <PageHeader title="Dashboard" subtitle="Live snapshot of your inventory operations" />

      {/* Filters */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Select
          label="Document type"
          placeholder="All types"
          options={DOCUMENT_TYPE_OPTIONS}
          value={filters.type}
          onChange={setFilter('type')}
        />
        <Select
          label="Status"
          placeholder="All statuses"
          options={STATUS_OPTIONS}
          value={filters.status}
          onChange={setFilter('status')}
        />
        <Select
          label="Warehouse"
          placeholder="All warehouses"
          options={warehouseOptions}
          value={filters.warehouse}
          onChange={setFilter('warehouse')}
        />
        <Select
          label="Product category"
          placeholder="All categories"
          options={categoryOptions}
          value={filters.category}
          onChange={setFilter('category')}
        />
      </div>

      {summary.error ? (
        <ErrorState error={summary.error} onRetry={summary.reload} />
      ) : !s ? (
        <LoadingState />
      ) : (
        <>
          {/* KPI strip */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <Kpi
              label="In Stock"
              value={s.products.inStock}
              to={PATHS.PRODUCTS}
              icon={Package}
            />
            <Kpi
              label="Low Stock"
              value={s.products.lowStock}
              tone={s.products.lowStock ? 'text-warning' : undefined}
              to={PATHS.PRODUCTS}
              icon={TrendingDown}
            />
            <Kpi
              label="Out of Stock"
              value={s.products.outOfStock}
              tone={s.products.outOfStock ? 'text-danger' : undefined}
              to={PATHS.PRODUCTS}
              icon={AlertTriangle}
            />
            <Kpi
              label="Pending Receipts"
              value={s.receipts.pending}
              to={PATHS.RECEIPTS}
              icon={TrendingUp}
            />
            <Kpi
              label="Pending Deliveries"
              value={s.deliveries.pending}
              to={PATHS.DELIVERIES}
              icon={Truck}
            />
            <Kpi
              label="Transfers Scheduled"
              value={s.transfers.pending}
              to={PATHS.TRANSFERS}
              icon={Warehouse}
            />
          </div>

          {/* Operations overview + low stock */}
          <div className="grid gap-4 lg:grid-cols-3">
            <OperationCard
              title="Receipts"
              counts={s.receipts}
              actionLabel="to receive"
              to={PATHS.RECEIPTS}
              stats={[
                ['late', 'Late'],
                ['upcoming', 'Upcoming'],
              ]}
              icon={ClipboardCheck}
            />
            <OperationCard
              title="Deliveries"
              counts={s.deliveries}
              actionLabel="to deliver"
              to={PATHS.DELIVERIES}
              stats={[
                ['late', 'Late'],
                ['waiting', 'Waiting'],
                ['upcoming', 'Upcoming'],
              ]}
              icon={Truck}
            />

            {/* Low stock alerts */}
            <Card
              title="Low Stock Alerts"
              actions={
                s.lowStockItems.length > 0 ? (
                  <Link
                    to={PATHS.PRODUCTS}
                    className="text-xs text-accent hover:underline flex items-center gap-1"
                  >
                    View all
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                ) : null
              }
              bodyClassName="p-0"
            >
              {s.lowStockItems.length ? (
                <ul className="divide-y divide-border/60">
                  {s.lowStockItems.map((p) => (
                    <li key={p._id}>
                      <Link
                        to={toPath(PATHS.PRODUCT_DETAIL, { id: p._id })}
                        className="flex items-center justify-between gap-3 px-5 py-3 text-sm hover:bg-surface-2/60 transition-colors"
                      >
                        <span className="truncate">
                          <span className="text-muted text-xs">[{p.sku}]</span>{' '}
                          <span className="text-text-strong">{p.name}</span>
                        </span>
                        <span className="flex items-center gap-2 whitespace-nowrap">
                          <span className="tabular-nums text-xs text-text-strong">
                            {formatQty(p.onHand)} {p.uom}
                          </span>
                          <StockBadge status={p.stockStatus} />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  title="All stocked up"
                  message="No product is at or below its reorder level."
                  icon="check"
                  className="py-8"
                />
              )}
            </Card>
          </div>
        </>
      )}

      {/* Operations table */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-text-strong uppercase tracking-wider">
          Recent Operations
        </h2>
        <Table
          columns={columns}
          rows={operations.data?.items}
          loading={operations.loading}
          error={operations.error}
          onRetry={operations.reload}
          onRowClick={(r) =>
            navigate(toPath(OPERATION_CONFIG[r.type].detailPath, { id: r._id }))
          }
          empty={<EmptyState title="No operations match these filters" />}
        />
        {operations.data && (
          <Pagination {...operations.data} onChange={setPage} />
        )}
      </div>
    </section>
  );
}
