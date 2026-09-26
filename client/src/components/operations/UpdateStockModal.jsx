import { useState } from 'react';
import useForm from '../../hooks/useForm.js';
import useLocationStock from '../../hooks/useLocationStock.js';
import { useLocationOptions } from '../../hooks/useLookups.js';
import { operationApi } from '../../services/operationApi.js';
import { formatQty, signedQty } from '../../utils/format.js';
import { required } from '../../utils/validation.js';
import Button from '../ui/Button.jsx';
import Form from '../ui/Form.jsx';
import Input from '../ui/Input.jsx';
import Modal from '../ui/Modal.jsx';
import Select from '../ui/Select.jsx';
import { Alert } from '../ui/States.jsx';

const adjustments = operationApi('adjustment');

/**
 * "Update the stock from here" (mockup, Stock page): records a physical count for one
 * product at one location by creating and validating an inventory adjustment, so the
 * change is logged in the ledger like any other adjustment.
 */
export default function UpdateStockModal({ product, defaultLocation = '', onClose, onDone }) {
  const locationOptions = useLocationOptions();
  const form = useForm({ location: defaultLocation, countedQuantity: '', reason: 'Stock update' });
  const stock = useLocationStock(form.values.location);
  const [step, setStep] = useState('');

  const recorded = form.values.location ? stock.byProduct[product._id]?.quantity ?? 0 : null;
  const counted = form.values.countedQuantity === '' ? null : Number(form.values.countedQuantity);
  const difference = recorded !== null && counted !== null && !Number.isNaN(counted) ? counted - recorded : null;

  const onSubmit = form.submit(
    {
      location: required('Location'),
      countedQuantity: (v) => (v === '' || Number.isNaN(Number(v)) || Number(v) < 0 ? 'Enter a quantity of 0 or more' : null),
    },
    async (values) => {
      setStep('create');
      try {
        const adj = await adjustments.create({
          location: values.location,
          reason: values.reason.trim() || 'Stock update',
          lines: [{ product: product._id, countedQuantity: Number(values.countedQuantity) }],
        });
        setStep('validate');
        const done = await adjustments.validate(adj._id);
        onDone(done);
      } finally {
        setStep('');
      }
    }
  );

  return (
    <Modal
      open
      onClose={step ? undefined : onClose}
      title={`Update stock · ${product.name}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={Boolean(step)}>
            Cancel
          </Button>
          <Button type="submit" form="update-stock-form" loading={form.submitting} disabled={difference === 0}>
            Apply
          </Button>
        </>
      }
    >
      <Form id="update-stock-form" onSubmit={onSubmit}>
        {form.formError && <Alert>{form.formError}</Alert>}
        <Select
          label="Location"
          required
          placeholder="Select location"
          options={locationOptions}
          value={form.values.location}
          onChange={form.setField('location')}
          error={form.errors.location}
        />
        <Input
          label={`Counted quantity (${product.uom})`}
          type="number"
          min="0"
          step="any"
          value={form.values.countedQuantity}
          onChange={form.setField('countedQuantity')}
          error={form.errors.countedQuantity}
          autoFocus
        />
        <Input label="Reason" value={form.values.reason} onChange={form.setField('reason')} />
        {recorded !== null && (
          <div className="grid grid-cols-2 gap-3 rounded-md border border-border bg-surface-2 px-3 py-2 text-sm">
            <span className="text-muted">Recorded</span>
            <span className="text-right text-text-strong">{stock.loading ? '…' : formatQty(recorded)}</span>
            <span className="text-muted">Difference</span>
            <span className={`text-right font-medium ${difference < 0 ? 'text-danger' : difference > 0 ? 'text-success' : 'text-muted'}`}>
              {difference === null ? '—' : signedQty(difference)}
            </span>
          </div>
        )}
        <p className="text-xs text-muted">This creates and validates an inventory adjustment, so the change appears in Move History.</p>
      </Form>
    </Modal>
  );
}
