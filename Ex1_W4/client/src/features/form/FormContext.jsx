import { createContext, useContext, useMemo, useState } from 'react';
import { validateForm, RULES } from './validateForm.js';

/**
 * @typedef {Object} FormContextValue
 * @property {import('./validateForm.js').FormValues} values
 * @property {import('./validateForm.js').FormErrors} errors   - derived, tính trong render
 * @property {boolean} isValid
 * @property {(field: string) => boolean} shouldShowError       - chỉ hiện lỗi khi field đã touched hoặc đã bấm submit
 * @property {(field: string, value: string) => void} setFieldValue
 * @property {(field: string) => void} touchField
 * @property {() => void} markSubmitAttempt
 * @property {() => void} reset
 */

/** @type {import('react').Context<FormContextValue | null>} */
export const FormContext = createContext(null);

/**
 * Provider giữ state THÔ (values, touched, submitAttempted).
 * errors / isValid là DERIVED STATE → tính đồng bộ, không useEffect.
 */
export function FormProvider({ initialValues, rules = RULES, children }) {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const errors = useMemo(() => validateForm(values, rules), [values, rules]);
  const isValid = Object.keys(errors).length === 0;

  const contextValue = {
    values,
    errors,
    isValid,
    shouldShowError: (field) => Boolean(errors[field]) && (submitAttempted || Boolean(touched[field])),
    setFieldValue: (field, value) => setValues((prev) => ({ ...prev, [field]: value })),
    touchField: (field) => setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true })),
    markSubmitAttempt: () => setSubmitAttempted(true),
    reset: () => {
      setValues(initialValues);
      setTouched({});
      setSubmitAttempted(false);
    },
  };

  return <FormContext.Provider value={contextValue}>{children}</FormContext.Provider>;
}

/** Custom hook: báo lỗi rõ ràng nếu dùng ngoài Provider */
export function useFormContext() {
  const ctx = useContext(FormContext);
  if (!ctx) throw new Error('useFormContext must be used inside <FormProvider>');
  return ctx;
}