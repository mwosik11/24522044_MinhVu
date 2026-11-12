
/**
 * HW3 – PUBG Vietnam Arena
 * Domain contracts and lifecycle constants.
 */

/**
 * Airdrop lifecycle phases.
 *
 * @typedef {
 *   "WARMUP" |
 *   "AIRDROP_LIVE" |
 *   "LOOTED_OUT" |
 *   "EXPIRED"
 * } DropPhase
 */

export const DROP_PHASE = Object.freeze({
  WARMUP: "WARMUP",
  AIRDROP_LIVE: "AIRDROP_LIVE",
  LOOTED_OUT: "LOOTED_OUT",
  EXPIRED: "EXPIRED",
});

/**
 * Claim lifecycle states.
 *
 * These states are an implementation decision
 * for managing optimistic claim operations.
 *
 * @typedef {
 *   "IDLE" |
 *   "PENDING" |
 *   "SUCCESS" |
 *   "CONFLICT" |
 *   "ERROR"
 * } ClaimStatus
 */

export const CLAIM_STATUS = Object.freeze({
  IDLE: "IDLE",
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
  CONFLICT: "CONFLICT",
  ERROR: "ERROR",
});

/**
 * PUBG crate or ticket drop.
 *
 * @typedef {Object} PubgCrateDrop
 * @property {string} id
 * @property {string} title
 * @property {number} priceVnd
 * @property {number} remainingStock
 * @property {number} dropEpochMs
 * @property {number} dropEndEpochMs
 */

/**
 * PUBG Vietnam squad leaderboard entry.
 *
 * @typedef {Object} PubgVnSquadStanding
 * @property {string} squadId
 * @property {string} squadName
 * @property {number} wwcdCount
 * @property {number} placementPts
 * @property {number} killPts
 */

/**
 * @typedef {Object} PubgKillFeedEvent
 * @property {string} id
 * @property {string} killer
 * @property {string} victim
 * @property {string} weapon
 * @property {number} timestamp
 */
