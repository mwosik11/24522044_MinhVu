import { FormProvider, useFormContext } from './FormContext.jsx';
import { InputField } from './InputField.jsx';
import { INITIAL_VALUES } from './validateForm.js';
import styles from './Form.module.css';
import { useState } from 'react';
import { ShowData } from './ShowData.jsx';

/** Phần thân form: dùng context để submit, không giữ state validate riêng */
function RegistrationForm({ onValidSubmit }) {
  const { values, errors, isValid, markSubmitAttempt, reset } = useFormContext();
  const errorCount = Object.keys(errors).length;

  const handleSubmit = (e) => {
    e.preventDefault();
    markSubmitAttempt();
    if (isValid) onValidSubmit({ ...values, age: Number(values.age) });
  };

  const handleReset = () => {
    reset();
    onValidSubmit(null);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate aria-labelledby="form-title">
      <h1 id="form-title">Registration Form</h1>
      <InputField name="fullName" label="Họ và tên" autoComplete="name" />
      <InputField name="email" label="Email" type="email" autoComplete="email" />
      <InputField name="age" label="Tuổi" type="number" inputMode="numeric" hint="Từ 18 đến 120" />
      <output className={styles.status} role="status" aria-live="polite">
        {isValid ? 'Form hợp lệ' : `Còn ${errorCount} trường chưa hợp lệ`}
      </output>
      <p className={styles.actions}>
        <button type="submit">Submit</button>
        <button type="button" onClick={handleReset}>Reset</button>
      </p>
    </form>
  );
}

export default function SimpleForm() {
  const [submitted, setSubmitted] = useState(null);

  return (
    <section className={styles.page}>
      <FormProvider initialValues={INITIAL_VALUES}>
        <RegistrationForm onValidSubmit={setSubmitted} />
      </FormProvider>
      {submitted && <ShowData data={submitted} />}
    </section>
  );
}