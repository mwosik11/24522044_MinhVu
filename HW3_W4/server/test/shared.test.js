import { describe, expect, it } from 'vitest';
import { VERDICTS, classifyRatio, computeMatrix } from '../../shared/matrix.js';
import { normalizeAppeal, validateAppeal } from '../../shared/appealRules.js';

const VIOLATIONS = [
  { code: 'V1', type: 'aim-assist', matchId: 'M-1', evidenceStrength: 0.5, sanctionDays: 365 }, // expected 90
  { code: 'V2', type: 'toxic-chat', matchId: 'M-2', evidenceStrength: 1, sanctionDays: 14 }, // expected 14
  { code: 'V3', type: 'macro-abuse', matchId: 'M-3', evidenceStrength: 0.5, sanctionDays: 10 }, // expected 30
  { code: 'V4', type: 'unknown-type', matchId: 'M-4', evidenceStrength: 1, sanctionDays: 5 }, // no guideline
];

describe('computeMatrix (disproportionality, derived)', () => {
  it('classifies every violation and sorts by ratio, highest first', () => {
    const { rows } = computeMatrix(VIOLATIONS);
    expect(rows.map((r) => r.code)).toEqual(['V4', 'V1', 'V2', 'V3']);
    expect(rows.find((r) => r.code === 'V1')).toMatchObject({ expectedDays: 90, ratio: 4.06, verdict: VERDICTS.EXCESSIVE });
    expect(rows.find((r) => r.code === 'V2')).toMatchObject({ expectedDays: 14, ratio: 1, verdict: VERDICTS.PROPORTIONATE });
    expect(rows.find((r) => r.code === 'V3')).toMatchObject({ expectedDays: 30, ratio: 0.33, verdict: VERDICTS.LENIENT });
    expect(rows.find((r) => r.code === 'V4')).toMatchObject({ expectedDays: 0, ratio: null, verdict: VERDICTS.UNSUPPORTED });
  });

  it('computes totals and the list of excessive codes', () => {
    expect(computeMatrix(VIOLATIONS).totals).toEqual({
      sanctionDays: 394,
      expectedDays: 134,
      ratio: 2.94,
      verdict: VERDICTS.EXCESSIVE,
      excessiveCodes: ['V1'],
    });
  });

  it('handles a case without violations', () => {
    expect(computeMatrix([])).toEqual({
      rows: [],
      totals: { sanctionDays: 0, expectedDays: 0, ratio: null, verdict: VERDICTS.UNSUPPORTED, excessiveCodes: [] },
    });
  });

  it('never mutates the input array', () => {
    const input = [...VIOLATIONS];
    computeMatrix(input);
    expect(input.map((v) => v.code)).toEqual(['V1', 'V2', 'V3', 'V4']);
  });
});

describe('classifyRatio', () => {
  it('uses inclusive 0.75 / 1.25 boundaries', () => {
    expect(classifyRatio(1.25)).toBe(VERDICTS.PROPORTIONATE);
    expect(classifyRatio(1.26)).toBe(VERDICTS.EXCESSIVE);
    expect(classifyRatio(0.75)).toBe(VERDICTS.PROPORTIONATE);
    expect(classifyRatio(0.74)).toBe(VERDICTS.LENIENT);
    expect(classifyRatio(null)).toBe(VERDICTS.UNSUPPORTED);
  });
});

describe('validateAppeal (shared by client and server)', () => {
  const ctx = { violationCodes: ['V1', 'V2'], excessiveCodes: ['V1'] };
  const valid = {
    email: 'himass@team.gg',
    grounds: 'procedural-error',
    contestedCodes: ['V2'],
    statement: 'The anti-cheat log was captured on a different server than my match.',
    evidenceUrl: '',
    acknowledged: true,
  };
  const errorsFor = (patch) => validateAppeal({ ...valid, ...patch }, ctx);

  it('accepts a valid appeal', () => {
    expect(validateAppeal(valid, ctx)).toEqual({});
  });

  it('requires a valid email', () => {
    expect(errorsFor({ email: '' }).email).toMatch(/required/);
    expect(errorsFor({ email: 'not-an-email' }).email).toMatch(/valid/);
  });

  it('only accepts known grounds', () => {
    expect(errorsFor({ grounds: 'i-was-lagging' }).grounds).toBeDefined();
  });

  it('requires contested codes that belong to the case', () => {
    expect(errorsFor({ contestedCodes: [] }).contestedCodes).toMatch(/at least one/);
    expect(errorsFor({ contestedCodes: ['V9'] }).contestedCodes).toMatch(/belong/);
    expect(errorsFor({ contestedCodes: [{ $ne: null }] }).contestedCodes).toMatch(/belong/);
  });

  it('bounds the statement length after trimming', () => {
    expect(errorsFor({ statement: '   too short   ' }).statement).toMatch(/at least 50/);
    expect(errorsFor({ statement: 'x'.repeat(1001) }).statement).toMatch(/at most 1000/);
  });

  it('only accepts https evidence links', () => {
    expect(errorsFor({ evidenceUrl: 'http://clips.gg/1' }).evidenceUrl).toMatch(/https/);
    expect(errorsFor({ evidenceUrl: 'javascript:alert(1)' }).evidenceUrl).toMatch(/https/);
    expect(errorsFor({ evidenceUrl: 'https://clips.gg/1' }).evidenceUrl).toBeUndefined();
  });

  it('requires the truthfulness acknowledgement', () => {
    expect(errorsFor({ acknowledged: false }).acknowledged).toBeDefined();
    expect(errorsFor({ acknowledged: 'true' }).acknowledged).toBeDefined();
  });

  it('cross-field: a disproportionate-sanction appeal must contest an EXCESSIVE violation', () => {
    expect(errorsFor({ grounds: 'disproportionate-sanction', contestedCodes: ['V2'] }).contestedCodes).toMatch(/EXCESSIVE/);
    expect(errorsFor({ grounds: 'disproportionate-sanction', contestedCodes: ['V1'] })).toEqual({});
  });

  it('cross-field: a false-positive appeal needs an evidence link', () => {
    expect(errorsFor({ grounds: 'false-positive' }).evidenceUrl).toMatch(/evidence link/);
    expect(errorsFor({ grounds: 'false-positive', evidenceUrl: 'https://clips.gg/1' })).toEqual({});
  });

  it('normalizeAppeal trims, de-duplicates and drops unknown fields', () => {
    expect(
      normalizeAppeal({ ...valid, email: '  HiMass@Team.GG ', contestedCodes: ['V2', 'V2'], isAdmin: true }),
    ).toEqual({ ...valid, email: 'himass@team.gg', contestedCodes: ['V2'] });
  });
});