
/**
 * HW3 – PUBG Vietnam Arena
 * Mock data for development and testing.
 *
 * All prices, stocks, standings, and events in this file
 * are simulated values, not official PUBG Vietnam data.
 */

// ============================================
// 1. MOCK CRATE AND TICKET DROPS
// ============================================

const now = Date.now();

export const mockCrateDrops = [
  {
    id: "pvs-vip-2026",
    title: "PVS Grand Finals VIP Pass + 5,000 G-Coin",
    priceVnd: 1500000,
    remainingStock: 120,
    dropEpochMs: now + 5 * 60 * 1000,
    dropEndEpochMs: now + 20 * 60 * 1000,
  },
  {
    id: "pvs-contraband-crate",
    title: "PVS Championship Contraband Crate",
    priceVnd: 250000,
    remainingStock: 80,
    dropEpochMs: now + 2 * 60 * 1000,
    dropEndEpochMs: now + 12 * 60 * 1000,
  },
  {
    id: "gcoin-supply-crate",
    title: "G-Coin Supply Crate",
    priceVnd: 500000,
    remainingStock: 50,
    dropEpochMs: now + 10 * 60 * 1000,
    dropEndEpochMs: now + 25 * 60 * 1000,
  },
];

// ============================================
// 2. PUBG VIETNAM SQUAD STANDINGS
// ============================================

export const mockSquadStandings = [
  {
    squadId: "te",
    squadName: "The Expendables",
    wwcdCount: 3,
    placementPts: 145,
    killPts: 98,
  },
  {
    squadId: "ces",
    squadName: "Cerberus Esports",
    wwcdCount: 2,
    placementPts: 132,
    killPts: 110,
  },
  {
    squadId: "ge",
    squadName: "Roy Esports",
    wwcdCount: 1,
    placementPts: 121,
    killPts: 125,
  },
  {
    squadId: "agg",
    squadName: "AGG",
    wwcdCount: 1,
    placementPts: 105,
    killPts: 90,
  },
];

// ============================================
// 3. MOCK PUBG MATCH KILL-FEED
// ============================================

export const mockKillFeedEvents = [
  {
    id: "kill-001",
    killer: "TE_Spectre",
    victim: "CES_Raven",
    weapon: "M416",
    timestamp: now - 30 * 1000,
  },
  {
    id: "kill-002",
    killer: "CES_Blaze",
    victim: "GE_Shadow",
    weapon: "AWM",
    timestamp: now - 60 * 1000,
  },
  {
    id: "kill-003",
    killer: "AGG_Viper",
    victim: "TE_Hunter",
    weapon: "AKM",
    timestamp: now - 90 * 1000,
  },
  {
    id: "kill-004",
    killer: "GE_Phantom",
    victim: "AGG_Reaper",
    weapon: "Beryl M762",
    timestamp: now - 120 * 1000,
  },
  {
    id: "kill-005",
    killer: "TE_Spectre",
    victim: "GE_Phantom",
    weapon: "Mini14",
    timestamp: now - 150 * 1000,
  },
];

// ============================================
// 4. MOCK DATA SUMMARY
// ============================================

export const mockDataSummary = {
  totalDrops: mockCrateDrops.length,
  totalSquads: mockSquadStandings.length,
  totalKillEvents: mockKillFeedEvents.length,
};
