import { SANCTION_GUIDELINES } from './guidelines.js';

export const VERDICTS = Object.freeze({
  EXCESSIVE: 'EXCESSIVE',
  PROPORTIONATE: 'PROPORTIONATE',
  LENIENT: 'LENIENT',
  UNSUPPORTED: 'UNSUPPORTED',
});

export const EXCESSIVE_ABOVE = 1.25;
export const LENIENT_BELOW = 0.75;

const round2 = (n) => Math.round(n * 100) / 100;

/** Ratio → verdict. Boundaries are inclusive on the PROPORTIONATE side. */
export function classifyRatio(ratio) {
  if (ratio === null) return VERDICTS.UNSUPPORTED;
  if (ratio > EXCESSIVE_ABOVE) return VERDICTS.EXCESSIVE;
  if (ratio < LENIENT_BELOW) return VERDICTS.LENIENT;
  return VERDICTS.PROPORTIONATE;
}

/** Sort key: rows without a guideline (ratio null) surface first — they need a human. */
const sortKey = (row) => row.ratio ?? Number.POSITIVE_INFINITY;

/**
 * Disproportionality matrix — a PURE function of the violations.
 * expectedDays = round(baseDays × evidenceStrength); ratio = sanctionDays / expectedDays.
 * Called with useMemo on the client; never stored in state.
 */
export function computeMatrix(violations = []) {
  const rows = violations.map((v) => {
    const guideline = SANCTION_GUIDELINES[v.type];
    const expectedDays = guideline ? Math.round(guideline.baseDays * v.evidenceStrength) : 0;
    const ratio = expectedDays > 0 ? round2(v.sanctionDays / expectedDays) : null;
    return {
      code: v.code,
      type: v.type,
      label: guideline?.label ?? v.type,
      matchId: v.matchId,
      evidenceStrength: v.evidenceStrength,
      sanctionDays: v.sanctionDays,
      expectedDays,
      ratio,
      verdict: classifyRatio(ratio),
    };
  });

  // .map() already returned a new array, so sorting does not mutate the input.
  rows.sort((a, b) => sortKey(b) - sortKey(a) || 0);

  const sanctionDays = rows.reduce((sum, r) => sum + r.sanctionDays, 0);
  const expectedDays = rows.reduce((sum, r) => sum + r.expectedDays, 0);
  const ratio = expectedDays > 0 ? round2(sanctionDays / expectedDays) : null;

  return {
    rows,
    totals: {
      sanctionDays,
      expectedDays,
      ratio,
      verdict: classifyRatio(ratio),
      excessiveCodes: rows.filter((r) => r.verdict === VERDICTS.EXCESSIVE).map((r) => r.code),
    },
  };
}