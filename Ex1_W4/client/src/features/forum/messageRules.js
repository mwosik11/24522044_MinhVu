/**
 * Luật validate message phía client — GIỮ ĐỒNG BỘ (parity) với
 * server/src/validateMessage.js. Server vẫn validate lại: client chỉ để UX.
 */
export const MESSAGE_RULES = Object.freeze({
  author: { min: 2, max: 40 },
  text: { min: 1, max: 500 },
});

/** @param {{ author: string, text: string }} values */
export function validateMessage(values) {
  const errors = {};
  for (const [field, { min, max }] of Object.entries(MESSAGE_RULES)) {
    const value = (values[field] ?? '').trim();
    if (!value) errors[field] = `${field} is required`;
    else if (value.length < min || value.length > max) errors[field] = `${field} must be ${min}-${max} characters`;
  }
  return errors;
}