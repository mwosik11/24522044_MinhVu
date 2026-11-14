import { Profiler } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SimpleForm from '../SimpleForm.jsx';

const setup = () => {
  const commits = [];
  render(
    <Profiler id="form" onRender={(_id, phase) => commits.push(phase)}>
      <SimpleForm />
    </Profiler>
  );
  return { user: userEvent.setup(), commits };
};

describe('Sprint 2 — Context form engine', () => {
  it('binds every input to a visible label via useId', () => {
    setup();
    expect(screen.getByLabelText('Họ và tên')).toHaveAttribute('name', 'fullName');
    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');
    expect(screen.getByLabelText('Tuổi')).toHaveAttribute('type', 'number');
  });

  it('does not show errors before the field is touched', () => {
    setup();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'false');
  });

  it('shows an accessible error after blur (aria-invalid + aria-describedby)', async () => {
    const { user } = setup();
    const email = screen.getByLabelText('Email');
    await user.type(email, 'abc');
    await user.tab();
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(email).toHaveAccessibleDescription('Email không hợp lệ');
  });

  it('re-renders exactly once per keystroke (no useEffect waterfall)', async () => {
    const { user, commits } = setup();
    commits.length = 0;
    await user.type(screen.getByLabelText('Họ và tên'), 'a');
    expect(commits).toHaveLength(1);
  });

  it('blocks submit and reveals all errors when invalid', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(screen.getAllByRole('alert')).toHaveLength(3);
    expect(screen.queryByRole('heading', { name: 'Submitted data' })).not.toBeInTheDocument();
  });

  it('renders the <dl> inspector on valid submit', async () => {
    const { user } = setup();
    await user.type(screen.getByLabelText('Họ và tên'), 'Tran Vinh Khiem');
    await user.type(screen.getByLabelText('Email'), 'khiem@uit.edu.vn');
    await user.type(screen.getByLabelText('Tuổi'), '30');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    const inspector = screen.getByRole('heading', { name: 'Submitted data' }).closest('section');
    const terms = [...inspector.querySelectorAll('dt')].map((dt) => dt.textContent);
    expect(terms).toEqual(['fullName', 'email', 'age']);
    expect(screen.getByText('khiem@uit.edu.vn').tagName).toBe('DD');
  });

  it('reset clears values and hides the inspector', async () => {
    const { user } = setup();
    await user.type(screen.getByLabelText('Họ và tên'), 'Tran Vinh Khiem');
    await user.type(screen.getByLabelText('Email'), 'khiem@uit.edu.vn');
    await user.type(screen.getByLabelText('Tuổi'), '30');
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByLabelText('Họ và tên')).toHaveValue('');
    expect(screen.queryByRole('heading', { name: 'Submitted data' })).not.toBeInTheDocument();
  });
});