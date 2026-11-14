/**
 * @typedef {Record<string, string>} FormValues
 * @typedef {Partial<Record<keyof FormValues, string>>} FormErrors
 * @typedef {(value: string, values: FormValues) => string | null} Validator
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Giá trị khởi tạo của form — mọi field là string (controlled input) */
export const INITIAL_VALUES = Object.freeze({ fullName: '', email: '', age: '' });

/**
 * Bảng luật khai báo: field -> danh sách validator.
 * Validator nhận thêm `values` để làm cross-field validation (vd. confirmPassword).
 * @type {Record<string, Validator[]>}
 */
export const RULES = {
  fullName: [
    (v) => (v.trim() ? null : 'Họ tên là bắt buộc'),
    (v) => (v.trim().length >= 3 ? null : 'Họ tên tối thiểu 3 ký tự'),
  ],
  email: [
    (v) => (v.trim() ? null : 'Email là bắt buộc'),
    (v) => (EMAIL_RE.test(v.trim()) ? null : 'Email không hợp lệ'),
  ],
  age: [
    (v) => (v !== '' ? null : 'Tuổi là bắt buộc'),
    (v) => (Number.isInteger(Number(v)) ? null : 'Tuổi phải là số nguyên'),
    (v) => (Number(v) >= 18 && Number(v) <= 120 ? null : 'Tuổi phải từ 18 đến 120'),
  ],
};

/**
 * Pure function: chạy đồng bộ trong render, KHÔNG side-effect.
 * Mỗi field chỉ trả lỗi đầu tiên gặp phải.
 * @param {FormValues} values
 * @param {Record<string, Validator[]>} [rules]
 * @returns {FormErrors}
 */
export function validateForm(values, rules = RULES) {
  const errors = {};
  for (const [field, validators] of Object.entries(rules)) {
    const value = values[field] ?? '';
    for (const validate of validators) {
      const message = validate(value, values);
      if (message) {
        errors[field] = message;
        break;
      }
    }
  }
  return errors;
}