import { createContext, use, useState } from 'react';

const FormContext = createContext(null);

/**
 * Context-driven form engine.
 * - `errors` and `isValid` are DERIVED synchronously during render from `values`
 *   (single render pass per keystroke — no useEffect validation chain).
 * - Errors become visible after a field is touched (blur) or after a submit attempt,
 *   then update live on every keystroke.
 */
export function FormProvider({ initialValues, validate, onSubmit, children }) {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const errors = validate(values);
  const isValid = Object.keys(errors).length === 0;

  const setValue = (name, value) => setValues((prev) => ({ ...prev, [name]: value }));
  const markTouched = (name) => setTouched((prev) => (prev[name] ? prev : { ...prev, [name]: true }));
  const visibleError = (name) => (touched[name] || submitAttempted ? errors[name] : undefined);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitAttempted(true);
    if (!isValid || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setSubmitting(false);
    }
  }

  const value = { values, errors, isValid, submitting, submitAttempted, setValue, markTouched, visibleError, handleSubmit };
  return <FormContext value={value}>{children}</FormContext>;
}

export function useFormContext() {
  const ctx = use(FormContext);
  if (!ctx) throw new Error('Form fields must be rendered inside <FormProvider>');
  return ctx;
}