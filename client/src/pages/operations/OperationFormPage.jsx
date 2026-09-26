import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import LinesEditor, { newLine } from '../../components/operations/LinesEditor.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
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
import { OPEN_STATUSES } from '../../utils/constants.js';
import { formatDateTime, formatQty, isLate, productLabel, toDateInput } from '../../utils/format.js';
import { OPERATION_CONFIG } from '../../utils/operations.js';
import { required } from '../../utils/validation.js';

const emptyValues = () => ({
  contact: '',
  deliveryAddress: '',
  sourceLocation: '',
  destLocation: '',
  scheduledDate: toDateInput(new Date()),
  notes: '',
});

function valuesFromDoc(doc) {
  return {
    contact: doc.contact ?? '',
    deliveryAddress: doc.deliveryAddress ?? '',
    sourceLocation: doc.sourceLocation?._id ?? '',
    destLocation: doc.destLocation?._id ?? '',
    scheduledDate: toDateInput(doc.scheduledDate),
    notes: doc.notes ?? '',
  };
}

const linesFromDoc = (doc) =>
  doc.lines.map((l) => newLine({ product: l.product._id, productRef: l.product, quantity: String(l.quantity) }));

/** Request body for POST/PATCH /{receipts|deliveries|transfers} (docs/API.md §8). */
function buildPayload(cfg, values, lines) {
  const payload = {
    scheduledDate: values.scheduledDate || undefined,
    notes: values.notes.trim(),
    lines: lines.map((l) => ({ product: l.product, quantity: Number(l.quantity) })),
  };
  if (cfg.contactLabel) payload.contact = values.contact.trim();
  if (cfg.hasAddress) payload.deliveryAddress = values.deliveryAddress.trim();
  if (cfg.source) payload[cfg.source] = values[cfg.source];
  if (cfg.dest) payload[cfg.dest] = values[cfg.dest];
  return payload;
}

/** Per-line checks: product chosen, quantity > 0. Returns { [lineKey]: message }. */
function validateLines(lines) {
  const errors = {};
  for (const l of lines) {
    if (!l.product) errors[l.key] = 'Select a product';
    else if (!(Number(l.quantity) > 0)) errors[l.key] = 'Quantity must be greater than 0';
  }
  return errors;
}

const snapshot = (values, lines) =>
  JSON.stringify({ values, lines: lines.map((l) => [l.product, String(l.quantity)]) });

/** Texts for the confirmation dialogs, per action and document type. */
function actionCopy(action, cfg, doc, labels) {
  const ref = doc.reference;
  const src = labels.source;
  const dst = labels.dest;
  switch (action) {
    case 'confirm':
      return cfg.source
        ? {
            title: `Mark ${ref} as To Do?`,
            message: `Checks availability at ${src}. If every product is in stock the document becomes Ready and the quantities are reserved; otherwise it waits for stock. Stock does not move yet.`,
            confirmLabel: 'To Do',
          }
        : {
            title: `Mark ${ref} as To Do?`,
            message: 'The receipt becomes Ready to receive. Stock does not change until you validate it.',
            confirmLabel: 'To Do',
          };
    case 'validate': {
      const effect = {
        receipt: `adds these quantities to ${dst}`,
        delivery: `removes these quantities from ${src}`,
        transfer: `moves these quantities from ${src} to ${dst} (total stock is unchanged)`,
      }[cfg.type];
      return {
        title: `Validate ${ref}?`,
        message: (
          <>
            <p>Validating {effect}. This is recorded in Move History and cannot be undone.</p>
            <ul className="mt-3 space-y-1 rounded-md border border-border bg-surface-2 p-3">
              {doc.lines.map((l) => (
                <li key={l._id} className="flex justify-between gap-3">
                  <span>{productLabel(l.product)}</span>
                  <span className="text-text-strong">
                    {formatQty(l.quantity)} {l.product.uom}
                  </span>
                </li>
              ))}
            </ul>
          </>
        ),
        confirmLabel: 'Validate',
      };
    }
    case 'cancel':
      return {
        title: `Cancel ${ref}?`,
        message: 'The document stops counting as pending and can no longer be edited. No stock is moved.',
        confirmLabel: 'Cancel document',
        cancelLabel: 'Keep it',
        tone: 'danger',
      };
    default:
      return {};
  }
}

/** Create / view / edit a receipt, delivery order or internal transfer, and run its workflow. */
export default function OperationFormPage({ type }) {
  const cfg = OPERATION_CONFIG[type];
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const api = useMemo(() => operationApi(type), [type]);
  const doc = useAsync(() => (isNew ? Promise.resolve(null) : api.get(id)), [type, id]);
  const locationOptions = useLocationOptions();
  const products = useProductOptions();
  const form = useForm(emptyValues());
  const [lines, setLines] = useState([]);
  const [lineErrors, setLineErrors] = useState({});
  const [saved, setSaved] = useState(() => snapshot(emptyValues(), []));
  const [pending, setPending] = useState(null); // action awaiting confirmation
  const [busy, setBusy] = useState('');
  const sourceStock = useLocationStock(cfg.source ? form.values[cfg.source] : null);

  // Copy a freshly loaded/saved document into the form during render (not in an effect),
  // so there is never a render where the document is shown but the form is still empty.
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
  const editable = isNew || OPEN_STATUSES.includes(status);
  const dirty = editable && snapshot(form.values, lines) !== saved;
  const labelOf = (field) => locationOptions.find((o) => o.value === form.values[field])?.label ?? 'the location';

  // Availability at the source location: free stock plus what this (ready) document already reserves.
  const savedQty = Object.fromEntries((d?.lines ?? []).map((l) => [l.product._id, l.quantity]));
  const availableFor = (productId) => {
    if (!cfg.source || !form.values[cfg.source] || !productId) return null;
    const free = sourceStock.byProduct[productId]?.freeToUse ?? 0;
    const own = status === 'ready' && form.values[cfg.source] === d?.[cfg.source]?._id ? savedQty[productId] ?? 0 : 0;
    return free + own;
  };
  const shortLines = cfg.source
    ? lines.filter((l) => l.product && Number(l.quantity) > 0 && availableFor(l.product) !== null && Number(l.quantity) > availableFor(l.product))
    : [];
  const showAvailability = cfg.source && editable;

  const validators = {
    ...(cfg.source && { [cfg.source]: required(cfg.sourceLabel) }),
    ...(cfg.dest && { [cfg.dest]: required(cfg.destLabel) }),
    ...(cfg.source &&
      cfg.dest && {
        [cfg.dest]: (v, all) => (!v ? `${cfg.destLabel} is required` : v === all[cfg.source] ? 'Choose a different location' : null),
      }),
  };

  /** Saves the form. Returns the saved document, or null if validation failed. */
  const persist = async (values) => {
    const errors = validateLines(lines);
    setLineErrors(errors);
    if (Object.keys(errors).length) return null;
    const payload = buildPayload(cfg, values, lines);
    return isNew ? api.create(payload) : api.update(id, payload);
  };

  const save = form.submit(validators, async (values) => {
    const result = await persist(values);
    if (!result) return;
    toast.success(isNew ? `${result.reference} created` : 'Changes saved');
    if (isNew) navigate(toPath(cfg.detailPath, { id: result._id }), { replace: true });
    else doc.setData(result);
  });

  /** Asks for confirmation; unsaved edits are saved first so the action uses what is on screen. */
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
    if (action !== 'cancel' && !lines.length) {
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
      sourceStock.reload();
      const messages = {
        confirm: updated.status === 'waiting' ? `${updated.reference} is waiting for stock` : `${updated.reference} is ready`,
        validate: `${updated.reference} validated. Stock updated`,
        cancel: `${updated.reference} canceled`,
        pick: 'Items picked',
        pack: 'Items packed',
      };
      toast.success(messages[action]);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy('');
      setPending(null);
    }
  };

  const copy = pending && d ? actionCopy(pending, cfg, d, { source: labelOf(cfg.source), dest: labelOf(cfg.dest) }) : {};
  const f = form.values;

  const availabilityColumn = showAvailability
    ? [
        {
          header: 'Available',
          align: 'right',
          render: (l) => {
            const available = availableFor(l.product);
            if (available === null) return <span className="text-muted">—</span>;
            const short = Number(l.quantity) > available;
            return <span className={short ? 'font-medium text-danger' : 'text-muted'}>{formatQty(available)}</span>;
          },
        },
      ]
    : [];

  return (
    <section>
      <PageHeader title={cfg.singular} newTo={isNew ? undefined : cfg.newPath}>
        {d && isLate(d.scheduledDate, status) && <Badge tone="danger">Late</Badge>}
      </PageHeader>

      {!isNew && (
        <div className="mb-4 flex flex-wrap items-center gap-2 print:hidden">
          {status === 'draft' && (
            <Button variant="outline" size="sm" loading={busy === 'confirm'} onClick={() => requestAction('confirm')}>
              To Do
            </Button>
          )}
          {status === 'waiting' && (
            <Button variant="outline" size="sm" icon="refresh" loading={busy === 'confirm'} onClick={() => requestAction('confirm')}>
              Check availability
            </Button>
          )}
          {['ready', 'waiting'].includes(status) && (
            <Button size="sm" icon="check" loading={busy === 'validate'} onClick={() => requestAction('validate')}>
              Validate
            </Button>
          )}
          {type === 'delivery' && status === 'ready' && !d.pickedAt && (
            <Button variant="secondary" size="sm" loading={busy === 'pick'} onClick={() => runAction('pick')}>
              Pick
            </Button>
          )}
          {type === 'delivery' && status === 'ready' && d.pickedAt && !d.packedAt && (
            <Button variant="secondary" size="sm" loading={busy === 'pack'} onClick={() => runAction('pack')}>
              Pack
            </Button>
          )}
          {status === 'done' && (
            <Button variant="secondary" size="sm" icon="printer" onClick={() => window.print()}>
              Print
            </Button>
          )}
          {OPEN_STATUSES.includes(status) && (
            <Button variant="danger" size="sm" loading={busy === 'cancel'} onClick={() => requestAction('cancel')}>
              Cancel
            </Button>
          )}
          <div className="ml-auto">
            <StatusSteps steps={cfg.steps} current={status} />
          </div>
        </div>
      )}

      {status === 'waiting' && (
        <Alert tone="warning" className="mb-4">
          Waiting for stock: some products are not available at {labelOf(cfg.source)}. Receive or transfer stock there, then
          use "Check availability".
        </Alert>
      )}
      {showAvailability && shortLines.length > 0 && status !== 'waiting' && (
        <Alert tone="danger" className="mb-4">
          Not enough stock at {labelOf(cfg.source)} for {shortLines.length} product line(s), marked in red.
          {status === 'draft' ? ' This document will wait for stock when marked To Do.' : ''}
        </Alert>
      )}
      {dirty && !isNew && (
        <Alert tone="info" className="mb-4 print:hidden">
          You have unsaved changes. They will be saved before the next action.
        </Alert>
      )}

      <Card>
        <Form onSubmit={save}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-2xl font-semibold text-text-strong">{d?.reference ?? `New ${cfg.singular.toLowerCase()}`}</h2>
            {d?.validatedAt && (
              <p className="text-xs text-muted">
                Validated {formatDateTime(d.validatedAt)} by {d.validatedBy?.name || d.validatedBy?.loginId}
              </p>
            )}
            {type === 'delivery' && (d?.pickedAt || d?.packedAt) && (
              <p className="text-xs text-muted">
                {d.pickedAt && `Picked ${formatDateTime(d.pickedAt)}`}
                {d.packedAt && ` · Packed ${formatDateTime(d.packedAt)}`}
              </p>
            )}
          </div>
          {form.formError && <Alert>{form.formError}</Alert>}

          <FormGrid>
            {cfg.contactLabel && (
              <Input label={cfg.contactLabel} value={f.contact} onChange={form.setField('contact')} disabled={!editable} />
            )}
            {cfg.hasAddress && (
              <Input label="Delivery address" value={f.deliveryAddress} onChange={form.setField('deliveryAddress')} disabled={!editable} />
            )}
            {cfg.source && (
              <Select
                label={cfg.sourceLabel}
                required
                placeholder="Select location"
                options={locationOptions}
                value={f[cfg.source]}
                onChange={form.setField(cfg.source)}
                error={form.errors[cfg.source]}
                disabled={!editable}
              />
            )}
            {cfg.dest && (
              <Select
                label={cfg.destLabel}
                required
                placeholder="Select location"
                options={locationOptions}
                value={f[cfg.dest]}
                onChange={form.setField(cfg.dest)}
                error={form.errors[cfg.dest]}
                disabled={!editable}
              />
            )}
            <Input label="Schedule date" type="date" value={f.scheduledDate} onChange={form.setField('scheduledDate')} disabled={!editable} />
            <Input label="Responsible" value={d?.responsible?.name || d?.responsible?.loginId || user?.name || user?.loginId || ''} disabled />
          </FormGrid>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-text-strong">Products</h3>
            <LinesEditor
              lines={lines}
              onChange={setLines}
              products={products}
              readOnly={!editable}
              lineErrors={lineErrors}
              extraColumns={availabilityColumn}
              rowTone={(l) => (shortLines.includes(l) ? 'danger' : undefined)}
            />
          </div>

          <Textarea label="Notes" value={f.notes} onChange={form.setField('notes')} disabled={!editable} rows={2} />

          {editable && (
            <FormActions className="print:hidden">
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
        title={copy.title}
        message={copy.message}
        confirmLabel={copy.confirmLabel}
        cancelLabel={copy.cancelLabel}
        tone={copy.tone}
        loading={Boolean(busy)}
        onConfirm={() => runAction(pending)}
        onClose={() => setPending(null)}
      />
    </section>
  );
}
