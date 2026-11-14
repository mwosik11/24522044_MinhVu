import { validateForm, INITIAL_VALUES } from '../validateForm.js';

const VALID = { fullName: 'Tran Vinh Khiem', email: 'khiem@uit.edu.vn', age: '30' };

describe('validateForm (pure, synchronous)', () => {
  it('returns no errors for valid values', () => {
    expect(validateForm(VALID)).toEqual({});
  });

  it('reports every required field when empty', () => {
    expect(Object.keys(validateForm(INITIAL_VALUES))).toEqual(['fullName', 'email', 'age']);
  });

  it('returns only the first failing rule per field', () => {
    expect(validateForm({ ...VALID, fullName: 'Al' }).fullName).toBe('Họ tên tối thiểu 3 ký tự');
  });

  it('rejects malformed email and out-of-range age', () => {
    const errors = validateForm({ ...VALID, email: 'abc@', age: '15' });
    expect(errors.email).toBe('Email không hợp lệ');
    expect(errors.age).toBe('Tuổi phải từ 18 đến 120');
  });

  it('does not mutate its input', () => {
    const input = Object.freeze({ ...VALID });
    expect(() => validateForm(input)).not.toThrow();
  });
});