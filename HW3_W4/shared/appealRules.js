/**
 * Appeal validation rules — imported by the React form engine AND the Express route,
 * so client and server can never disagree (validation parity).
 */

export const GROUNDS = Object.freeze([
  { value: 'false-positive', label: 'False positive — I did not cheat' },
  { value: 'disproportionate-sanction', label: 'The sanction is disproportionate' },
  { value: 'procedural-error', label: 'Procedural error in the investigation' },
]);

export const STATEMENT_MIN = 50;
export const STATEMENT_MAX = 1000;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const asTrimmedString = (value) => (typeof value === 'string' ? value.trim() : '');

function isHttpsUrl(value) {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * @param {object} values raw form values
 * @param {{ violationCodes: string[], excessiveCodes: string[] }} context from the case + matrix
 * @returns {Record<string, string>} field → message; empty object = valid
 */
export function validateAppeal(values, { violationCodes = [], excessiveCodes = [] } = {}) {
  const errors = {};

  const email = asTrimmedString(values.email);
  if (!email) errors.email = 'Email is required.';
  else if (!EMAIL.test(email)) errors.email = 'Enter a valid email address.';

  const grounds = values.grounds;
  if (!GROUNDS.some((g) => g.value === grounds)) errors.grounds = 'Choose the grounds for your appeal.';

  const contested = Array.isArray(values.contestedCodes) ? values.contestedCodes : [];
  if (contested.length === 0) {
    errors.contestedCodes = 'Select at least one violation to contest.';
  } else if (contested.some((code) => typeof code !== 'string' || !violationCodes.includes(code))) {
    errors.contestedCodes = 'Contested violations must belong to this case.';
  }

  const statement = asTrimmedString(values.statement);
  if (statement.length < STATEMENT_MIN) {
    errors.statement = `Statement must be at least ${STATEMENT_MIN} characters (${statement.length}/${STATEMENT_MIN}).`;
  } else if (statement.length > STATEMENT_MAX) {
    errors.statement = `Statement must be at most ${STATEMENT_MAX} characters.`;
  }

  const evidenceUrl = asTrimmedString(values.evidenceUrl);
  if (evidenceUrl && !isHttpsUrl(evidenceUrl)) errors.evidenceUrl = 'Evidence link must start with https://';

  if (values.acknowledged !== true) errors.acknowledged = 'You must confirm that your statement is truthful.';

  // ---- Cross-field rules ----
  if (grounds === 'disproportionate-sanction' && !errors.contestedCodes) {
    if (!contested.some((code) => excessiveCodes.includes(code))) {
      errors.contestedCodes = 'A disproportionate-sanction appeal must contest at least one violation marked EXCESSIVE.';
    }
  }
  if (grounds === 'false-positive' && !evidenceUrl && !errors.evidenceUrl) {
    errors.evidenceUrl = 'A false-positive appeal needs an evidence link.';
  }

  return errors;
}

export const isValidAppeal = (values, context) => Object.keys(validateAppeal(values, context)).length === 0;

/** Whitelist + clean the payload (used before sending and before saving). */
export function normalizeAppeal(values) {
  return {
    email: asTrimmedString(values.email).toLowerCase(),
    grounds: values.grounds,
    contestedCodes: [...new Set(Array.isArray(values.contestedCodes) ? values.contestedCodes : [])],
    statement: asTrimmedString(values.statement),
    evidenceUrl: asTrimmedString(values.evidenceUrl),
    acknowledged: values.acknowledged === true,
  };
}