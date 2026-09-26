import { Tag } from 'lucide-react';
import { useState } from 'react';
import Button from '../../components/ui/Button.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import Form from '../../components/ui/Form.jsx';
import Input, { Textarea } from '../../components/ui/Input.jsx';
import Modal from '../../components/ui/Modal.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import { Alert, EmptyState } from '../../components/ui/States.jsx';
import Table from '../../components/ui/Table.jsx';
import useAsync from '../../hooks/useAsync.js';
import useForm from '../../hooks/useForm.js';
import useToast from '../../hooks/useToast.js';
import { categoryApi } from '../../services/productApi.js';
import { required } from '../../utils/validation.js';

function CategoryModal({ category, onClose, onSaved }) {
  const isNew = !category?._id;
  const form = useForm({
    name: category?.name ?? '',
    description: category?.description ?? '',
  });

  const onSubmit = form.submit(
    { name: required('Category name') },
    async (values) => {
      const payload = {
        name: values.name.trim(),
        description: values.description.trim(),
      };
      const saved = isNew
        ? await categoryApi.create(payload)
        : await categoryApi.update(category._id, payload);
      onSaved(saved, isNew);
    }
  );

  return (
    <Modal
      open
      onClose={onClose}
      title={isNew ? 'New category' : 'Edit category'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="category-form" loading={form.submitting}>
            Save
          </Button>
        </>
      }
    >
      <Form id="category-form" onSubmit={onSubmit}>
        {form.formError && <Alert>{form.formError}</Alert>}
        <Input
          label="Name"
          required
          value={form.values.name}
          onChange={form.setField('name')}
          error={form.errors.name}
          autoFocus
          placeholder="e.g. Electronics"
        />
        <Textarea
          label="Description"
          value={form.values.description}
          onChange={form.setField('description')}
          placeholder="Optional description…"
        />
      </Form>
    </Modal>
  );
}

export default function CategoriesPage() {
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(() => categoryApi.list(), []);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const onSaved = (saved, isNew) => {
    toast.success(isNew ? `Category "${saved.name}" created` : 'Category updated');
    setEditing(null);
    reload();
  };

  const remove = async () => {
    setBusy(true);
    try {
      await categoryApi.remove(deleting._id);
      toast.success(`Category "${deleting.name}" deleted`);
      setDeleting(null);
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (c) => (
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-3 border border-border text-muted">
            <Tag className="h-3.5 w-3.5" />
          </span>
          <span className="font-semibold text-text-strong">{c.name}</span>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (c) => (
        <span className="text-sm text-muted">{c.description || '—'}</span>
      ),
    },
    {
      key: 'productCount',
      header: 'Products',
      align: 'right',
      render: (c) => (
        <span className="tabular-nums font-medium text-text-strong">{c.productCount ?? 0}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (c) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            icon="edit"
            onClick={(e) => { e.stopPropagation(); setEditing(c); }}
            aria-label={`Edit ${c.name}`}
          />
          <Button
            variant="ghost"
            size="sm"
            icon="trash"
            onClick={(e) => { e.stopPropagation(); setDeleting(c); }}
            aria-label={`Delete ${c.name}`}
          />
        </div>
      ),
    },
  ];

  return (
    <section className="fade-in">
      <PageHeader
        title="Product Categories"
        subtitle="Group products to filter stock and dashboard views"
        onNew={() => setEditing({})}
      />
      <Table
        columns={columns}
        rows={data}
        loading={loading}
        error={error}
        onRetry={reload}
        empty={
          <EmptyState
            title="No categories yet"
            message="Group products by category to filter stock and the dashboard."
            icon="box"
            action={
              <Button variant="outline" size="sm" icon="plus" onClick={() => setEditing({})}>
                New category
              </Button>
            }
          />
        }
      />
      {editing !== null && (
        <CategoryModal
          category={editing}
          onClose={() => setEditing(null)}
          onSaved={onSaved}
        />
      )}
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete category?"
        message={`"${deleting?.name}" will be permanently deleted. Categories with products cannot be deleted.`}
        confirmLabel="Delete"
        tone="danger"
        loading={busy}
        onConfirm={remove}
        onClose={() => setDeleting(null)}
      />
    </section>
  );
}
