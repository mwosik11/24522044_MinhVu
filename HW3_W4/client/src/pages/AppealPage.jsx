import { useState } from 'react';
import { useOutletContext } from 'react-router';
import {
  GROUNDS,
  STATEMENT_MAX,
  STATEMENT_MIN,
  normalizeAppeal,
  validateAppeal,
} from '../../../shared/appealRules.js';
import { api } from '../api/client.js';
import { FormProvider } from '../form/FormContext.jsx';
import {
  CheckboxField,
  CheckboxGroupField,
  ErrorSummary,
  Form,
  SelectField,
  SubmitButton,
  TextAreaField,
  TextField,
} from '../form/fields.jsx';

const INITIAL_VALUES = {
  email: '',
  grounds: '',
  contestedCodes: [],
  statement: '',
  evidenceUrl: '',
  acknowledged: false,
};

/** Nested route /dossier/:playerID/appeal — rendered inside DossierPage's <Outlet>. */
export function AppealPage() {
  const { playerId, kase, matrix, sla, appeal, onFiled } = useOutletContext();
  const [serverError, setServerError] = useState(null);

  if (appeal) return null; // DossierPage already shows the filed appeal

  // Same rules + same context as the Express route → identical messages (parity).
  const context = {
    violationCodes: kase.violations.map((v) => v.code),
    excessiveCodes: matrix.totals.excessiveCodes,
  };
  const validate = (values) => validateAppeal(values, context);

  const violationOptions = matrix.rows.map((row) => ({
    value: row.code,
    label: `${row.code} · ${row.label} — ${row.verdict}`,
  }));

  async function handleSubmit(values) {
    setServerError(null);
    try {
      await api.fileAppeal(playerId, normalizeAppeal(values));
      onFiled(); // reload the dossier → "Appeal on file"
    } catch (err) {
      const details = err.details ? ` ${Object.values(err.details).join(' ')}` : '';
      setServerError(`${err.message}.${details}`);
    }
  }

  return (
    <section className="appeal" aria-labelledby="appeal-heading">
      <h2 id="appeal-heading">File an appeal</h2>
      <FormProvider initialValues={INITIAL_VALUES} validate={validate} onSubmit={handleSubmit}>
        <Form aria-labelledby="appeal-heading" className="appeal-form">
          <ErrorSummary />
          {serverError && (
            <p role="alert" className="notice notice--error">
              {serverError}
            </p>
          )}

          <TextField name="email" label="Contact email" type="email" autoComplete="email" />
          <SelectField name="grounds" label="Grounds for appeal" options={GROUNDS} />
          <CheckboxGroupField name="contestedCodes" legend="Contested violations" options={violationOptions} />
          <TextAreaField
            name="statement"
            label="Statement"
            hint={`Explain your appeal (at least ${STATEMENT_MIN} characters).`}
            maxLength={STATEMENT_MAX}
          />
          <TextField
            name="evidenceUrl"
            label="Evidence link"
            type="url"
            hint="Optional, but required for a false-positive appeal. Must start with https://"
          />
          <CheckboxField name="acknowledged" label="I confirm that this statement is truthful." />

          <SubmitButton disabled={sla.isExpired}>Submit appeal</SubmitButton>
        </Form>
      </FormProvider>
    </section>
  );
}