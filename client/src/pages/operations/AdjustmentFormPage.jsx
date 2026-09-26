import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import LinesEditor, { newLine } from '../../components/operations/LinesEditor.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import Form, { FormActions, FormGrid } from '../../components/ui/Form.jsx';
import Input, { Textarea } from '../../components/ui/Input.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Select from '../../components/ui/Select.jsx';
import StatusSteps from '../../components/ui/StatusSteps.jsx';
import { Alert, ErrorState, LoadingState } from '../../components/ui/States.jsx';
import useAsync from '../../hooks/useAsync.js';
import useAuth from '../../hooks/useAuth.js';
import useForm from '../../hooks/useForm.js';
import useLocationStock from '../../hooks/useLocationStock.js';
import { useLocationOptions, useProductOptions } from '../../hooks/useLookups.js';
import useToast from '../../hooks/useToast.js';
import { toPath } from '../../routes/paths.js';
import { operationApi } from '../../services/operationApi.js';
import { formatDateTime, formatQty, productLabel, signedQty, toDateInput } from '../../utils/format.js';
import { OPERATION_CONFIG } from '../../utils/operations.js';
import { required } from '../../utils/validation.js';

const cfg = OPERATION_CONFIG.adjustment;

const linesFromDoc = (doc) =>
  doc.lines.map((l) =>
    newLine({
      product: l.product._id,
      productRef: l.product,
      countedQuantity: String(l.countedQuantity),
      systemQuantity: l.systemQuantity,
      difference: l.difference,
    })
  );

function validateLines(lines) {
  const errors = {};
  for (const l of lines) {
    if (!l.product) errors[l.key] = 'Select a product';
    else if (l.countedQuantity === '' || Number.isNaN(Number(l.countedQuantity)) || Number(l.countedQuantity) < 0) {
      errors[l.key] = 'Counted quantity must be 0 or more';
    }
  }
  return errors;
}

const snapshot = (values, lines) =>
  JSON.stringify({ values, lines: lines.map((l) => [l.product, String(l.countedQuantity)]) });

const valuesFromDoc = (d) => ({
  location: d.location?._id ?? '',
  reason: d.reason ?? '',
  scheduledDate: toDateInput(d.scheduledDate),
  notes: d.notes ?? '',
});

const EMPTY = () => ({ location: '', reason: '', scheduledDate: toDateInput(new Date()), notes: '' });

/** Inventory adjustment: select location/products, enter counted quantities, validate to set stock. */
export default function AdjustmentFormPage() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const api = useMemo(() => operationApi('adjustment'), []);
  const doc = useAsync(() => (isNew ? Promise.resolve(null) : api.get(id)), [id]);
  const locationOptions = useLocationOptions();
  const products = useProductOptions();
  const form = useForm(EMPTY());
  const [lines, setLines] = useState([]);
  const [lineErrors, setLineErrors] = useState({});
  const [saved, setSaved] = useState(() => snapshot(EMPTY(), []));
  const [pending, setPending] = useState(null);
  const [busy, setBusy] = useState('');
  const stock = useLocationStock(form.values.location);

  // Sync a freshly loaded/saved document into the form during render (see OperationFormPage).
  const [syncedDoc, setSyncedDoc] = useState(null);
  if (doc.data && doc.data !== syncedDoc) {
    const values = valuesFromDoc(doc.data);
    const docLines = linesFromDoc(doc.data);
    setSyncedDoc(doc.data);
    form.setValues(values);
    setLines(docLines);
    setLineErrors({});
    setSaved(snapshot(values, docLines));
  }

  if (!isNew && doc.error) return <ErrorState error={doc.error} onRetry={doc.reload} />;
  if (!isNew && !doc.data) return <LoadingState />;

  const d = doc.data;
  const status = d?.status ?? 'draft';
  const editable = status === 'draft';
  const dirty = editable && snapshot(form.values, lines) !== saved;
  const locationLabel = locationOptions.find((o) => o.value === form.values.location)?.label ?? 'the location';

  // Draft: live recorded quantity at the location. Done: the values stored at validation.
  const recordedFor = (line) => {
    if (!editable) return line.systemQuantity;
    if (!form.values.location || !line.product) return null;
    return stock.byProduct[line.product]?.quantity ?? 0;
  };
  const differenceFor = (line) => {
    if (!editable) return line.difference;
    const recorded = recordedFor(line);
    if (recorded === null || line.countedQuantity === '' || Number.isNaN(Number(line.countedQuantity))) return null;
    return Number(line.countedQuantity) - recorded;
  };

  const persist = async (values) => {
    const errors = validateLines(lines);
    setLineErrors(errors);
    if (Object.keys(errors).length) return null;
    const payload = {
      reason: values.reason.trim(),
      notes: values.notes.trim(),
      scheduledDate: values.scheduledDate || undefined,
      lines: lines.map((l) => ({ product: l.product, countedQuantity: Number(l.countedQuantity) })),
    };
    return isNew ? api.create({ ...payload, location: values.location }) : api.update(id, payload);
  };

  const validators = { location: required('Location') };

  const save = form.submit(validators, async (values) => {
    const result = await persist(values);
    if (!result) return;
    toast.success(isNew ? `${result.reference} created` : 'Changes saved');
    if (isNew) navigate(toPath(cfg.detailPath, { id: result._id }), { replace: true });
    else doc.setData(result);
  });

  const requestAction = async (action) => {
    if (dirty) {
      let ok = false;
      await form.submit(validators, async (values) => {
        const result = await persist(values);
        if (result) {
          doc.setData(result);
          ok = true;
        }
      })();
      if (!ok) return;
      toast.info('Changes saved');
    }
    if (action === 'validate' && !lines.length) {
      toast.error('Add at least one product line first');
      return;
    }
    setPending(action);
  };

  const runAction = async (action) => {
    setBusy(action);
    try {
      const updated = await api[action](id);
      doc.setData(updated);
      stock.reload();
      toast.success(action === 'validate' ? `${updated.reference} applied. Stock updated` : `${updated.reference} canceled`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy('');
      setPending(null);
    }
  };

  const extraColumns = [
    { header: 'Recorded', align: 'right', render: (l) => (recordedFor(l) === null ? '—' : formatQty(recordedFor(l))) },
    {
      header: 'Difference',
      align: 'right',
      render: (l) => {
        const diff = differenceFor(l);
        if (diff === null || diff === undefined) return '—';
        return (
          <span className={`font-medium ${diff < 0 ? 'text-danger' : diff > 0 ? 'text-success' : 'text-muted'}`}>{signedQty(diff)}</span>
        );
      },
    },
  ];

  const confirmCopy =
    pending === 'validate'
      ? {
          title: `Apply ${d?.reference}?`,
          message: (
            <>
              <p>Stock at {locationLabel} will be set to the counted quantities. Differences are logged in Move History.</p>
              <ul className="mt-3 space-y-1 rounded-md border border-border bg-surface-2 p-3">
                {lines.map((l) => {
                  const diff = differenceFor(l);
                  return (
                    <li key={l.key} className="flex justify-between gap-3">
                      <span>{productLabel(products.byId[l.product] ?? l.productRef)}</span>
                      <span className={diff < 0 ? 'text-danger' : diff > 0 ? 'text-success' : 'text-muted'}>
                        {diff === null ? '—' : signedQty(diff)}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-2 text-xs text-muted">Recorded quantities are re-read at validation, so the final difference may change.</p>
            </>
          ),
          confirmLabel: 'Apply',
        }
      : {
          title: `Cancel ${d?.reference}?`,
          message: 'The adjustment will be canceled. No stock is changed.',
          confirmLabel: 'Cancel adjustment',
          cancelLabel: 'Keep it',
          tone: 'danger',
        };

  return (
    <section>
      <PageHeader title={cfg.singular} newTo={isNew ? undefined : cfg.newPath} />

      {!isNew && (
        <div className="mb-4 flex flex-wrap items-center gap-2 print:hidden">
          {editable && (
            <>
              <Button size="sm" icon="check" loading={busy === 'validate'} onClick={() => requestAction('validate')}>
                Validate
              </Button>
              <Button variant="danger" size="sm" loading={busy === 'cancel'} onClick={() => requestAction('cancel')}>
                Cancel
              </Button>
            </>
          )}
          <div className="ml-auto">
            <StatusSteps steps={cfg.steps} current={status} />
          </div>
        </div>
      )}

      {dirty && !isNew && (
        <Alert tone="info" className="mb-4">
          You have unsaved changes. They will be saved before validating.
        </Alert>
      )}

      <Card>
        <Form onSubmit={save}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-2xl font-semibold text-text-strong">{d?.reference ?? 'New adjustment'}</h2>
            {d?.validatedAt && (
              <p className="text-xs text-muted">
                Applied {formatDateTime(d.validatedAt)} by {d.validatedBy?.name || d.validatedBy?.loginId}
              </p>
            )}
          </div>
          {form.formError && <Alert>{form.formError}</Alert>}
          <FormGrid>
            <Select
              label="Location"
              required
              placeholder="Select location"
              options={locationOptions}
              value={form.values.location}
              onChange={form.setField('location')}
              error={form.errors.location}
              disabled={!isNew}
              hint={isNew ? 'Where the physical count was done' : undefined}
            />
            <Input label="Reason" value={form.values.reason} onChange={form.setField('reason')} disabled={!editable} placeholder="e.g. Damaged, cycle count" />
            <Input label="Date" type="date" value={form.values.scheduledDate} onChange={form.setField('scheduledDate')} disabled={!editable} />
            <Input label="Responsible" value={d?.responsible?.name || d?.responsible?.loginId || user?.name || user?.loginId || ''} disabled />
          </FormGrid>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-text-strong">Counted products</h3>
            <LinesEditor
              lines={lines}
              onChange={setLines}
              products={products}
              readOnly={!editable}
              quantityKey="countedQuantity"
              quantityLabel="Counted"
              extraColumns={extraColumns}
              lineErrors={lineErrors}
            />
          </div>

          <Textarea label="Notes" value={form.values.notes} onChange={form.setField('notes')} disabled={!editable} rows={2} />

          {editable && (
            <FormActions>
              <Button variant="secondary" onClick={() => navigate(cfg.listPath)}>
                Back
              </Button>
              <Button type="submit" loading={form.submitting} disabled={!isNew && !dirty}>
                {isNew ? 'Create' : 'Save'}
              </Button>
            </FormActions>
          )}
        </Form>
      </Card>

      <ConfirmDialog
        open={Boolean(pending)}
        title={confirmCopy.title}
        message={confirmCopy.message}
        confirmLabel={confirmCopy.confirmLabel}
        cancelLabel={confirmCopy.cancelLabel}
        tone={confirmCopy.tone}
        loading={Boolean(busy)}
        onConfirm={() => runAction(pending)}
        onClose={() => setPending(null)}
      />
    </section>
  );
}
