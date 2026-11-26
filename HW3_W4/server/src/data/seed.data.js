const HOUR = 60 * 60 * 1000;

export const SEED_PLAYERS = [
  { playerId: 'himass', handle: 'Himass', realName: 'Hi Mass', team: 'S3T Phoenix', game: 'PUBG: Battlegrounds', role: 'Fragger' },
  { playerId: 'tanvuu', handle: 'TanVuu', realName: 'Tan Vuu', team: 'S3T Phoenix', game: 'PUBG: Battlegrounds', role: 'IGL' },
];

/**
 * Deadlines are relative to "now" so the SLA countdown is always live when you demo:
 * Himass has ~47 h left, TanVuu is urgent with ~50 min left.
 */
export function buildSeedCases(now = Date.now()) {
  return [
    {
      playerId: 'himass',
      caseRef: 'FP-2026-0417',
      verdictAt: new Date(now - 25 * HOUR),
      appealDeadline: new Date(now + 47 * HOUR),
      violations: [
        { code: 'V1', type: 'aim-assist', matchId: 'PCS-R3-M4', evidenceStrength: 0.4, sanctionDays: 365 },
        { code: 'V2', type: 'toxic-chat', matchId: 'PCS-R3-M5', evidenceStrength: 1, sanctionDays: 14 },
        { code: 'V3', type: 'macro-abuse', matchId: 'PCS-R4-M1', evidenceStrength: 0.9, sanctionDays: 30 },
      ],
    },
    {
      playerId: 'tanvuu',
      caseRef: 'FP-2026-0422',
      verdictAt: new Date(now - 71 * HOUR),
      appealDeadline: new Date(now + 50 * 60 * 1000),
      violations: [
        { code: 'V1', type: 'account-sharing', matchId: 'PCS-R2-M2', evidenceStrength: 0.8, sanctionDays: 90 },
        { code: 'V2', type: 'wallhack', matchId: 'PCS-R2-M3', evidenceStrength: 0.3, sanctionDays: 365 },
      ],
    },
  ];
}