/**
 * Luật validate payload message — GIỮ ĐỒNG BỘ (parity) với
 * client/src/features/forum/messageRules.js
 */
export const MESSAGE_RULES = Object.freeze({
  author: { min: 2, max: 40 },
  text: { min: 1, max: 500 },
});

/**
 * @param {unknown} body
 * @returns {Record<string, string>} lỗi theo field; rỗng = hợp lệ
 */
export function validateMessage(body) {
  const errors = {};
  const payload = body && typeof body === 'object' ? body : {};

  for (const [field, { min, max }] of Object.entries(MESSAGE_RULES)) {
    const value = payload[field];
    if (typeof value !== 'string' || value.trim() === '') {
      errors[field] = `${field} is required`;
    } else if (value.trim().length < min || value.trim().length > max) {
      errors[field] = `${field} must be ${min}-${max} characters`;
    }
  }
  return errors;
}