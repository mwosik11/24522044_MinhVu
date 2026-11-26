const pad = (n) => String(n).padStart(2, '0');

const dateTime = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' });

export const formatDateTime = (iso) => dateTime.format(new Date(iso));

/** 1d 23:59:59 — days only shown when > 0. */
export function formatCountdown({ days, hours, minutes, seconds }) {
  const clock = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  return days > 0 ? `${days}d ${clock}` : clock;
}

export const formatPercent = (fraction) => `${Math.round(fraction * 100)}%`;

export const formatRatio = (ratio) => (ratio === null ? '—' : `×${ratio.toFixed(2)}`);