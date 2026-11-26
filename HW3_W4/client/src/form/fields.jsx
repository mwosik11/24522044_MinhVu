import { useId } from 'react';
import { useFormContext } from './FormContext.jsx';

/**
 * One useId() PER FIELD — a single id shared by every field (as in the slide contract)
 * would produce duplicate ids and break label/error associations.
 */
function useFieldA11y(name, hasHint) {
  const { visibleError } = useFormContext();
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const error = visibleError(name);
  const describedBy = [hasHint && hintId, error && errorId].filter(Boolean).join(' ') || undefined;
  return { id, hintId, errorId, error, describedBy };
}

function FieldError({ id, error }) {
  if (!error) return null;
  return (
    <p id={id} className="field__error">
      {error}
    </p>
  );
}

export function Form({ children, ...rest }) {
  const { handleSubmit } = useFormContext();
  return (
    <form noValidate onSubmit={handleSubmit} {...rest}>
      {children}
    </form>
  );
}

export function TextField({ name, label, hint, type = 'text', ...inputProps }) {
  const { values, setValue, markTouched } = useFormContext();
  const { id, hintId, errorId, error, describedBy } = useFieldA11y(name, Boolean(hint));
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {hint && (
        <p id={hintId} className="field__hint">
          {hint}
        </p>
      )}
      <input
        id={id}
        name={name}
        type={type}
        value={values[name]}
        onChange={(e) => setValue(name, e.target.value)}
        onBlur={() => markTouched(name)}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        {...inputProps}
      />
      <FieldError id={errorId} error={error} />
    </div>
  );
}

export function TextAreaField({ name, label, hint, maxLength, rows = 6 }) {
  const { values, setValue, markTouched } = useFormContext();
  const length = values[name].trim().length;
  const hintText = [hint, maxLength && `${length}/${maxLength} characters`].filter(Boolean).join(' · ');
  const { id, hintId, errorId, error, describedBy } = useFieldA11y(name, Boolean(hintText));
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {hintText && (
        <p id={hintId} className="field__hint">
          {hintText}
        </p>
      )}
      <textarea
        id={id}
        name={name}
        rows={rows}
        value={values[name]}
        onChange={(e) => setValue(name, e.target.value)}
        onBlur={() => markTouched(name)}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
      />
      <FieldError id={errorId} error={error} />
    </div>
  );
}

export function SelectField({ name, label, options, placeholder = 'Choose…' }) {
  const { values, setValue, markTouched } = useFormContext();
  const { id, errorId, error, describedBy } = useFieldA11y(name, false);
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        name={name}
        value={values[name]}
        onChange={(e) => setValue(name, e.target.value)}
        onBlur={() => markTouched(name)}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <FieldError id={errorId} error={error} />
    </div>
  );
}

/** Multi-select checkboxes stored as an array of values. */
export function CheckboxGroupField({ name, legend, options }) {
  const { values, setValue, markTouched } = useFormContext();
  const { id, errorId, error, describedBy } = useFieldA11y(name, false);
  const selected = values[name];

  const toggle = (value) => {
    setValue(name, selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
    markTouched(name);
  };

  return (
    <fieldset className="field field--group" aria-invalid={Boolean(error)} aria-describedby={describedBy}>
      <legend>{legend}</legend>
      {options.map((o) => (
        <label key={o.value} className="choice" htmlFor={`${id}-${o.value}`}>
          <input
            id={`${id}-${o.value}`}
            type="checkbox"
            name={name}
            value={o.value}
            checked={selected.includes(o.value)}
            onChange={() => toggle(o.value)}
          />
          <span>{o.label}</span>
        </label>
      ))}
      <FieldError id={errorId} error={error} />
    </fieldset>
  );
}

export function CheckboxField({ name, label }) {
  const { values, setValue, markTouched } = useFormContext();
  const { id, errorId, error, describedBy } = useFieldA11y(name, false);
  return (
    <div className="field">
      <label className="choice" htmlFor={id}>
        <input
          id={id}
          type="checkbox"
          name={name}
          checked={values[name]}
          onChange={(e) => {
            setValue(name, e.target.checked);
            markTouched(name);
          }}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
        />
        <span>{label}</span>
      </label>
      <FieldError id={errorId} error={error} />
    </div>
  );
}

/** Announced once after a failed submit attempt. */
export function ErrorSummary() {
  const { errors, isValid, submitAttempted } = useFormContext();
  if (!submitAttempted || isValid) return null;
  const messages = Object.values(errors);
  return (
    <div role="alert" className="error-summary">
      <p className="error-summary__title">
        Please fix {messages.length} {messages.length === 1 ? 'problem' : 'problems'}:
      </p>
      <ul>
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </div>
  );
}

/** Never disabled for invalid input — clicking it is how users discover the errors. */
export function SubmitButton({ children, disabled = false }) {
  const { submitting } = useFormContext();
  return (
    <button type="submit" className="button" disabled={disabled || submitting} aria-busy={submitting}>
      {submitting ? 'Submitting…' : children}
    </button>
  );
}