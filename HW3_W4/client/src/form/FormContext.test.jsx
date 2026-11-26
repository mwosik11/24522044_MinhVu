import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider } from './FormContext.jsx';
import { CheckboxField, ErrorSummary, Form, SubmitButton, TextAreaField, TextField } from './fields.jsx';

const validate = (v) => {
  const errors = {};
  if (!v.email.includes('@')) errors.email = 'Enter a valid email address.';
  if (v.statement.trim().length < 10) errors.statement = 'Statement is too short.';
  if (!v.agree) errors.agree = 'You must agree.';
  return errors;
};

function DemoForm({ onSubmit = vi.fn() }) {
  return (
    <FormProvider initialValues={{ email: '', statement: '', agree: false }} validate={validate} onSubmit={onSubmit}>
      <Form aria-label="Demo">
        <ErrorSummary />
        <TextField name="email" label="Email" type="email" />
        <TextAreaField name="statement" label="Statement" maxLength={100} />
        <CheckboxField name="agree" label="I agree" />
        <SubmitButton>Send</SubmitButton>
      </Form>
    </FormProvider>
  );
}

describe('FormProvider (synchronous context validation)', () => {
  it('shows no errors before the user interacts', () => {
    render(<DemoForm />);
    expect(screen.queryByText('Enter a valid email address.')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'false');
  });

  it('reveals an error on blur and clears it live while typing', async () => {
    const user = userEvent.setup();
    render(<DemoForm />);
    const email = screen.getByLabelText('Email');

    await user.click(email);
    await user.tab();
    const error = screen.getByText('Enter a valid email address.');
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(email.getAttribute('aria-describedby')).toContain(error.id);

    await user.type(email, 'tan@vuu.gg');
    expect(screen.queryByText('Enter a valid email address.')).not.toBeInTheDocument();
    expect(email).toHaveAttribute('aria-invalid', 'false');
  });

  it('blocks an invalid submit and summarises every error', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<DemoForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: 'Send' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Please fix 3 problems');
    expect(screen.getByLabelText('I agree')).toHaveAttribute('aria-invalid', 'true');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits the values once everything is valid', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<DemoForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Email'), 'tan@vuu.gg');
    await user.type(screen.getByLabelText('Statement'), 'This is long enough.');
    await user.click(screen.getByLabelText('I agree'));
    await user.click(screen.getByRole('button', { name: 'Send' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({ email: 'tan@vuu.gg', statement: 'This is long enough.', agree: true });
  });

  it('gives every field its own id', () => {
    render(<DemoForm />);
    const ids = ['Email', 'Statement', 'I agree'].map((label) => screen.getByLabelText(label).id);
    expect(new Set(ids).size).toBe(3);
  });

  it('throws a clear error when a field is used outside the provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TextField name="x" label="X" />)).toThrow(/inside <FormProvider>/);
  });
});