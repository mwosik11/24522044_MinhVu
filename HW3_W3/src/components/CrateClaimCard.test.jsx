
import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
} from "vitest";

import {
  render,
  screen,
  cleanup,
} from "@testing-library/react";

import CrateClaimCard from "./CrateClaimCard.jsx";

const FIXED_NOW = 1700000000000;

function createDrop(overrides = {}) {
  return {
    id: "test-drop",
    title: "Test PUBG Crate",
    priceVnd: 250000,
    remainingStock: 10,
    dropEpochMs: FIXED_NOW + 5000,
    dropEndEpochMs: FIXED_NOW + 15000,
    ...overrides,
  };
}

describe("CrateClaimCard – Airdrop Lifecycle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(FIXED_NOW));
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("should display WARMUP before the airdrop starts", () => {
    const { container } = render(
      <CrateClaimCard drop={createDrop()} />
    );

    expect(
      container.querySelector(".drop-card__status")
    ).toHaveTextContent("COMING SOON");

    expect(
      screen.getByRole("button", {
        name: "COMING SOON",
      })
    ).toBeDisabled();
  });

  it("should display AIRDROP LIVE during the active period", () => {
    const drop = createDrop({
      dropEpochMs: FIXED_NOW - 5000,
      dropEndEpochMs: FIXED_NOW + 10000,
    });

    const { container } = render(
      <CrateClaimCard drop={drop} />
    );

    expect(
      container.querySelector(".drop-card__status")
    ).toHaveTextContent("AIRDROP LIVE");

    expect(
      screen.getByRole("button", {
        name: "CLAIM NOW",
      })
    ).toBeEnabled();
  });

  it("should display LOOTED OUT when stock reaches zero", () => {
    const drop = createDrop({
      dropEpochMs: FIXED_NOW - 5000,
      dropEndEpochMs: FIXED_NOW + 10000,
      remainingStock: 0,
    });

    const { container } = render(
      <CrateClaimCard drop={drop} />
    );

    expect(
      container.querySelector(".drop-card__status")
    ).toHaveTextContent("LOOTED OUT");

    expect(
      screen.getByRole("button", {
        name: "SOLD OUT",
      })
    ).toBeDisabled();
  });

  it("should display EXPIRED after the airdrop end timestamp", () => {
    const drop = createDrop({
      dropEpochMs: FIXED_NOW - 15000,
      dropEndEpochMs: FIXED_NOW - 1000,
      remainingStock: 10,
    });

    const { container } = render(
      <CrateClaimCard drop={drop} />
    );

    expect(
      container.querySelector(".drop-card__status")
    ).toHaveTextContent("EXPIRED");

    expect(
      screen.getByRole("button", {
        name: "EXPIRED",
      })
    ).toBeDisabled();
  });
});
