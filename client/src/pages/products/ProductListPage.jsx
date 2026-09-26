import { Package, PlusCircle } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import UpdateStockModal from '../../components/operations/UpdateStockModal.jsx';
import { StockBadge } from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import SearchInput from '../../components/ui/SearchInput.jsx';
import Select from '../../components/ui/Select.jsx';
import { EmptyState } from '../../components/ui/States.jsx';
import Table from '../../components/ui/Table.jsx';
import useAsync from '../../hooks/useAsync.js';
import useToast from '../../hooks/useToast.js';
import { useCategoryOptions, useWarehouseOptions } from '../../hooks/useLookups.js';
import { PATHS, toPath } from '../../routes/paths.js';
import { productApi } from '../../services/productApi.js';
import { STOCK_STATUS_OPTIONS } from '../../utils/constants.js';
import { formatMoney, formatQty } from '../../utils/format.js';

/** Stock screen: products with on-hand quantities and cost. */
export default function ProductListPage() {
  const navigate = useNavigate();
  const categoryOptions = useCategoryOptions();
  const warehouseOptions = useWarehouseOptions();
  const toast = useToast();
  const [params, setParams] = useState({
    search: '',
    category: '',
    warehouse: '',
    stockStatus: '',
    page: 1,
  });
  const [updating, setUpdating] = useState(null);

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
    () => productApi.list(query),
    [JSON.stringify(query)]
  );

  const columns = [
    {
      key: 'name',
      header: 'Product',
      render: (p) => (
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-3 border border-border text-muted">
            <Package className="h-3.5 w-3.5" />
          </span>
          <div>
            <p className="font-semibold text-text-strong">{p.name}</p>
            <p className="text-xs text-muted font-mono">{p.sku}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (p) => (
        <span className="text-sm text-muted">{p.category?.name ?? '—'}</span>
      ),
    },
    {
      key: 'unitCost',
      header: 'Unit cost',
      align: 'right',
      render: (p) => (
        <span className="tabular-nums font-medium text-text-strong">
          {formatMoney(p.unitCost)}
        </span>
      ),
    },
    {
      key: 'onHand',
      header: 'On hand',
      align: 'right',
      render: (p) => (
        <span className="tabular-nums font-medium text-text-strong">
          {formatQty(p.onHand)}{' '}
          <span className="text-xs text-muted font-normal">{p.uom}</span>
        </span>
      ),
    },
    {
      key: 'freeToUse',
      header: 'Free to use',
      align: 'right',
      render: (p) => (
        <span className="tabular-nums text-sm text-text">{formatQty(p.freeToUse)}</span>
      ),
    },
    {
      key: 'stockStatus',
      header: 'Status',
      render: (p) => <StockBadge status={p.stockStatus} />,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (p) => (
        <Button
          variant="ghost"
          size="sm"
          icon="edit"
          onClick={(e) => {
            e.stopPropagation();
            setUpdating(p);
          }}
          aria-label={`Update stock for ${p.name}`}
        >
          Update stock
        </Button>
      ),
    },
  ];

  return (
    <section className="fade-in">
      <PageHeader
        title="Stock"
        subtitle="Products and their availability"
        newTo={PATHS.PRODUCT_NEW}
        newLabel="New product"
      >
        <SearchInput
          value={params.search}
          onSearch={set('search')}
          placeholder="Search name or SKU"
        />
      </PageHeader>

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Select
          placeholder="All categories"
          options={categoryOptions}
          value={params.category}
          onChange={set('category')}
          aria-label="Category"
        />
        <Select
          placeholder="All warehouses"
          options={warehouseOptions}
          value={params.warehouse}
          onChange={set('warehouse')}
          aria-label="Warehouse"
        />
        <Select
          placeholder="Any stock status"
          options={STOCK_STATUS_OPTIONS}
          value={params.stockStatus}
          onChange={set('stockStatus')}
          aria-label="Stock status"
        />
      </div>

      <Table
        columns={columns}
        rows={data?.items}
        loading={loading}
        error={error}
        onRetry={reload}
        onRowClick={(p) => navigate(toPath(PATHS.PRODUCT_DETAIL, { id: p._id }))}
        empty={
          <EmptyState
            title="No products found"
            message="Create a product or change the filters."
            icon="box"
            action={
              <Button
                variant="outline"
                size="sm"
                icon="plus"
                onClick={() => navigate(PATHS.PRODUCT_NEW)}
              >
                New product
              </Button>
            }
          />
        }
      />
      {data && (
        <Pagination
          {...data}
          onChange={(page) => setParams((p) => ({ ...p, page }))}
        />
      )}

      {updating && (
        <UpdateStockModal
          product={updating}
          onClose={() => setUpdating(null)}
          onDone={(adj) => {
            toast.success(`Stock updated (${adj.reference})`);
            setUpdating(null);
            reload();
          }}
        />
      )}
    </section>
  );
}
