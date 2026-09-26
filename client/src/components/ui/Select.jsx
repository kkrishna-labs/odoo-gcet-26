import { useId } from 'react';
import { controlClass, FormField } from './Form.jsx';

/**
 * <Select options={[{ value, label }]} placeholder="All warehouses" value onChange />
 * `placeholder` renders an empty-value first option.
 */
export default function Select({
  label,
  error,
  hint,
  required,
  options = [],
  placeholder,
  className = '',
  id,
  ...props
}) {
  const autoId = useId();
  const selectId = id ?? autoId;
  return (
    <FormField
      label={label}
      htmlFor={selectId}
      required={required}
      error={error}
      hint={hint}
      className={className}
    >
      <select
        id={selectId}
        className={`${controlClass(error)} pr-10 appearance-none cursor-pointer`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M7 8l3 3 3-3' stroke='%236b6b78' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.75rem center',
          backgroundSize: '1.25rem',
        }}
        aria-invalid={Boolean(error)}
        {...props}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}
