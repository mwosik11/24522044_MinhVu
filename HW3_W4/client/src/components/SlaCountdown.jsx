import { formatCountdown, formatDateTime } from '../lib/format.js';

/**
 * The ticking digits are NOT a live region (a screen reader would read them every second).
 * A separate status region announces only state changes: urgent, then closed.
 */
export function SlaCountdown({ sla, deadline, clockStatus }) {
  const announcement = sla.isExpired
    ? 'The appeal window has closed.'
    : sla.isUrgent
      ? 'Less than one hour left to file an appeal.'
      : '';

  return (
    <section className="sla-card" aria-labelledby="sla-heading">
      <h2 id="sla-heading">Appeal window</h2>
      <p
        className={`sla${sla.isUrgent ? ' sla--urgent' : ''}${sla.isExpired ? ' sla--expired' : ''}`}
        data-testid="sla-countdown"
      >
        {sla.isExpired ? 'Closed' : formatCountdown(sla)}
      </p>
      <p className="sla-card__deadline">
        Deadline: <time dateTime={deadline}>{formatDateTime(deadline)}</time>
        {clockStatus === 'error' && ' · using this device’s clock (server time unavailable)'}
      </p>
      <p className="visually-hidden" role="status">
        {announcement}
      </p>
    </section>
  );
}