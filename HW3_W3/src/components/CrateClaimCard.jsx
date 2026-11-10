
import { useEffect, useRef } from "react";

import { DROP_PHASE, CLAIM_STATUS } from "../domain/pubgContracts.js";

import { usePubgAirdropTimer } from "../hooks/usePubgAirdropTimer.js";

import { useOptimisticInventory } from "../hooks/useOptimisticInventory.js";

import { claimDrop } from "../services/mockClaimService.js";

import "./AirdropCountdown.css";

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

function formatCountdown(remainingMs) {
  const totalSeconds = Math.ceil(remainingMs / 1000);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (value) => String(value).padStart(2, "0");

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  return `${pad(minutes)}:${pad(seconds)}`;
}

export default function CrateClaimCard({ drop }) {
  const { remainingMs } = usePubgAirdropTimer(
    drop.dropEpochMs
  );

  const {
    remainingStock,
    claimState,
    isClaimPending,
    beginClaim,
    completeClaim,
    rejectClaim,
  } = useOptimisticInventory(drop.remainingStock);

  const attemptRef = useRef(0);
  const abortControllerRef = useRef(null);
  const mountedRef = useRef(true);

  // Cancel pending requests when the card unmounts.
  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  const isLive = remainingMs === 0;

  let phase;

  if (!isLive) {
    phase = DROP_PHASE.WARMUP;
  } else if (remainingStock === 0) {
    phase = DROP_PHASE.LOOTED_OUT;
  } else {
    phase = DROP_PHASE.AIRDROP_LIVE;
  }

  const phaseLabels = {
    [DROP_PHASE.WARMUP]: "COMING SOON",
    [DROP_PHASE.AIRDROP_LIVE]: "AIRDROP LIVE",
    [DROP_PHASE.LOOTED_OUT]: "LOOTED OUT",
    [DROP_PHASE.EXPIRED]: "EXPIRED",
  };

  const handleClaim = async () => {
    const claimId = `${drop.id}-${++attemptRef.current}`;

    // Reserve stock immediately.
    const transaction = beginClaim(claimId);

    if (!transaction) {
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const result = await claimDrop(drop.id, {
        signal: controller.signal,
      });

      if (!mountedRef.current) {
        return;
      }

      if (result.ok && result.status === 200) {
        completeClaim(claimId);
      } else {
        rejectClaim(
          claimId,
          result.status,
          result.message
        );
      }
    } catch (error) {
      if (
        !mountedRef.current ||
        error.name === "AbortError"
      ) {
        return;
      }

      rejectClaim(
        claimId,
        500,
        error.message || "Unable to process claim."
      );
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  };

  const statusMessages = {
    [CLAIM_STATUS.IDLE]: "",
    [CLAIM_STATUS.PENDING]: "Processing your claim...",
    [CLAIM_STATUS.SUCCESS]: "Claim completed successfully!",
    [CLAIM_STATUS.CONFLICT]: claimState.error,
    [CLAIM_STATUS.ERROR]: claimState.error,
  };

  return (
    <article
      className={`drop-card drop-card--${phase.toLowerCase()}`}
      aria-labelledby={`drop-title-${drop.id}`}
    >
      <header className="drop-card__header">
        <span className="drop-card__category">
          PUBG VIETNAM SERIES
        </span>

        <span
          className={`drop-card__status drop-card__status--${phase.toLowerCase()}`}
        >
          {phaseLabels[phase]}
        </span>
      </header>

      <h3
        className="drop-card__title"
        id={`drop-title-${drop.id}`}
      >
        {drop.title}
      </h3>

      <div className="drop-card__price">
        {currencyFormatter.format(drop.priceVnd)}
      </div>

      <div className="drop-card__countdown">
        <span className="drop-card__label">
          {isLive ? "AIRDROP STATUS" : "AIRDROP STARTS IN"}
        </span>

        <output
          className="drop-card__timer"
          aria-label="Airdrop countdown"
        >
          {formatCountdown(remainingMs)}
        </output>
      </div>

      <footer className="drop-card__footer">
        <span>REMAINING STOCK</span>

        <strong>
          {remainingStock.toLocaleString("en-US")} units
        </strong>
      </footer>

      <button
        type="button"
        className="drop-card__claim"
        onClick={handleClaim}
        disabled={
          !isLive ||
          remainingStock <= 0 ||
          isClaimPending
        }
      >
        {isClaimPending
          ? "PROCESSING..."
          : remainingStock <= 0
            ? "SOLD OUT"
            : !isLive
              ? "COMING SOON"
              : "CLAIM NOW"}
      </button>

      {claimState.status !== CLAIM_STATUS.IDLE && (
        <p
          className={`drop-card__message drop-card__message--${claimState.status.toLowerCase()}`}
          role="status"
          aria-live="polite"
        >
          {statusMessages[claimState.status]}
        </p>
      )}
    </article>
  );
}
