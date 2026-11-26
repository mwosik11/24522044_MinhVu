/**
 * Baseline sanction (days) for a violation proven with 100 % certainty.
 * Single source of truth for the matrix (client) and the Mongoose enum (server).
 */
export const SANCTION_GUIDELINES = Object.freeze({
  'aim-assist': { label: 'Aim-assist software', baseDays: 180 },
  wallhack: { label: 'Wallhack / ESP', baseDays: 365 },
  'macro-abuse': { label: 'Recoil macro abuse', baseDays: 60 },
  'account-sharing': { label: 'Account sharing', baseDays: 90 },
  'toxic-chat': { label: 'Toxic chat', baseDays: 14 },
});

export const VIOLATION_TYPES = Object.freeze(Object.keys(SANCTION_GUIDELINES));