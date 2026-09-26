import { ArrowDown, ArrowRight, ArrowUp } from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { Badge } from '../../components/ui/Badge.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import SearchInput from '../../components/ui/SearchInput.jsx';
import Select from '../../components/ui/Select.jsx';
import { EmptyState } from '../../components/ui/States.jsx';
import Table from '../../components/ui/Table.jsx';
import useAsync from '../../hooks/useAsync.js';
import { useWarehouseOptions } from '../../hooks/useLookups.js';
import { ledgerApi } from '../../services/ledgerApi.js';
import { DIRECTION_OPTIONS, LEDGER_TYPE_META } from '../../utils/constants.js';
import { formatDateTime, formatQty, productLabel } from '../../utils/format.js';

const DIRECTION_META = {
  in:       { cls: 'text-success',  sign: '+', icon: ArrowDown },
  out:      { cls: 'text-danger',   sign: '-', icon: ArrowUp  },
  internal: { cls: 'text-info',     sign: '',  icon: ArrowRight },
};

const TYPE_OPTIONS = Object.entries(LEDGER_TYPE_META).map(([value, label]) => ({
  value,
  label,
}));

export default function MoveHistoryPage() {
  const [searchParams] = useSearchParams();
  const warehouseOptions = useWarehouseOptions();
  const [params, setParams] = useState({
    search:    '',
    direction: '',
    refType:   '',
    warehouse: '',
    product:   searchParams.get('product') ?? '',
    page:      1,
  });

  const set = (key) => (value) =>
    setParams((p) => ({
      ...p,
      [key]: value?.target ? value.target.value : value,
      page: 1,
    }));

  const query = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '')
  );
  const { data, loading, error, reload } = useAsync(
    () => ledgerApi.list(query),
    [JSON.stringify(query)]
  );

  const columns = [
    {
      key: 'reference',
      header: 'Reference',
      render: (m) => {
        const meta = DIRECTION_META[m.direction] ?? DIRECTION_META.internal;
        const DirIcon = meta.icon;
        return (
          <span className={`flex items-center gap-2 font-semibold ${meta.cls}`}>
            <DirIcon className="h-3.5 w-3.5 shrink-0" />
            {m.reference || LEDGER_TYPE_META[m.refType]}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (m) => (
        <span className="text-xs text-muted whitespace-nowrap">
          {formatDateTime(m.createdAt)}
        </span>
      ),
    },
    {
      key: 'product',
      header: 'Product',
      render: (m) => (
        <span className="font-medium text-text-strong">{productLabel(m.product)}</span>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (m) => <span className="text-muted">{m.contact || '—'}</span>,
    },
    {
      key: 'from',
      header: 'From',
      render: (m) =>
        m.fromLocation?.fullName ??
        (m.refType === 'receipt' ? m.contact || 'Vendor' : 'Outside'),
    },
    {
      key: 'to',
      header: 'To',
      render: (m) =>
        m.toLocation?.fullName ??
        (m.refType === 'delivery' ? m.contact || 'Customer' : 'Outside'),
    },
    {
      key: 'quantity',
      header: 'Quantity',
      align: 'right',
      render: (m) => {
        const meta = DIRECTION_META[m.direction] ?? DIRECTION_META.internal;
        return (
          <span className={`tabular-nums font-semibold ${meta.cls}`}>
            {meta.sign}{formatQty(m.quantity)}{' '}
            <span className="text-xs font-normal text-muted">{m.product?.uom}</span>
          </span>
        );
      },
    },
    {
      key: 'refType',
      header: 'Type',
      render: (m) => <Badge>{LEDGER_TYPE_META[m.refType]}</Badge>,
    },
    {
      key: 'performedBy',
      header: 'By',
      render: (m) => (
        <span className="text-xs text-muted">
          {m.performedBy?.name || m.performedBy?.loginId || '—'}
        </span>
      ),
    },
  ];

  return (
    <section className="fade-in">
      <PageHeader title="Move History" subtitle="Every stock movement, newest first">
        <SearchInput
          value={params.search}
          onSearch={set('search')}
          placeholder="Search reference or contact"
        />
      </PageHeader>

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Select
          placeholder="All directions"
          options={DIRECTION_OPTIONS}
          value={params.direction}
          onChange={set('direction')}
          aria-label="Direction"
        />
        <Select
          placeholder="All operation types"
          options={TYPE_OPTIONS}
          value={params.refType}
          onChange={set('refType')}
          aria-label="Operation type"
        />
        <Select
          placeholder="All warehouses"
          options={warehouseOptions}
          value={params.warehouse}
          onChange={set('warehouse')}
          aria-label="Warehouse"
        />
      </div>

      {params.product && (
        <p className="mb-3 rounded-xl border border-info/20 bg-info/5 px-4 py-2.5 text-xs text-info">
          Showing moves for one product.{' '}
          <button
            type="button"
            className="font-semibold underline hover:no-underline"
            onClick={() => set('product')('')}
          >
            Show all
          </button>
        </p>
      )}

      <Table
        columns={columns}
        rows={data?.items}
        loading={loading}
        error={error}
        onRetry={reload}
        empty={
          <EmptyState
            title="No moves found"
            message="Validated receipts, deliveries, transfers and adjustments appear here."
            icon="box"
          />
        }
      />
      {data && (
        <Pagination
          {...data}
          onChange={(page) => setParams((p) => ({ ...p, page }))}
        />
      )}
    </section>
  );
}
