
import { DROP_PHASE } from "../domain/pubgContracts.js";
import { usePubgAirdropTimer } from "../hooks/usePubgAirdropTimer.js";
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

export default function AirdropCountdown({ drop }) {
  const { remainingMs } = usePubgAirdropTimer(drop.dropEpochMs);

  let phase;

  if (remainingMs > 0) {
    phase = DROP_PHASE.WARMUP;
  } else if (drop.remainingStock <= 0) {
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
          {phase === DROP_PHASE.WARMUP
            ? "AIRDROP STARTS IN"
            : "AIRDROP COUNTDOWN"}
        </span>

        <output
          className="drop-card__timer"
          aria-label={
            phase === DROP_PHASE.WARMUP
              ? "Time until airdrop starts"
              : "Airdrop start time reached"
          }
        >
          {formatCountdown(remainingMs)}
        </output>
      </div>

      <footer className="drop-card__footer">
        <span>REMAINING STOCK</span>

        <strong>
          {drop.remainingStock.toLocaleString("en-US")} units
        </strong>
      </footer>
    </article>
  );
}
