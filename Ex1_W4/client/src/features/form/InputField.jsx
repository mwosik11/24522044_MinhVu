import { useId } from 'react';
import { useFormContext } from './FormContext.jsx';
import styles from './Form.module.css';

/**
 * Field "dumb": đọc value/error từ Context, không giữ state riêng, không useEffect.
 * @param {{ name: string, label: string, type?: string, hint?: string } & import('react').InputHTMLAttributes<HTMLInputElement>} props
 */
export function InputField({ name, label, type = 'text', hint, ...rest }) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const { values, errors, shouldShowError, setFieldValue, touchField } = useFormContext();

  const showError = shouldShowError(name);
  const describedBy = [hint ? hintId : null, showError ? errorId : null].filter(Boolean).join(' ') || undefined;

  return (
    <p className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={name}
        type={type}
        value={values[name]}
        onChange={(e) => setFieldValue(name, e.target.value)}
        onBlur={() => touchField(name)}
        aria-invalid={showError}
        aria-describedby={describedBy}
        {...rest}
      />
      {hint && <span id={hintId} className={styles.hint}>{hint}</span>}
      {showError && (
        <span id={errorId} role="alert" className={styles.error}>{errors[name]}</span>
      )}
    </p>
  );
}