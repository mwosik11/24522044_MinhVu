import { formatPercent, formatRatio } from '../lib/format.js';

const VERDICT_CLASS = {
  EXCESSIVE: 'verdict verdict--excessive',
  PROPORTIONATE: 'verdict verdict--ok',
  LENIENT: 'verdict verdict--lenient',
  UNSUPPORTED: 'verdict verdict--unsupported',
};

/** Pure display of the derived matrix — no state, no effects. */
export function MatrixTable({ matrix }) {
  const { rows, totals } = matrix;

  return (
    <section aria-labelledby="matrix-heading">
      <h2 id="matrix-heading">Disproportionality matrix</h2>
      <p className="matrix-help">
        Expected days = guideline × evidence strength. Ratio above ×1.25 is <strong>EXCESSIVE</strong>, below ×0.75 is{' '}
        <strong>LENIENT</strong>.
      </p>
      {/* Scrollable region must be focusable and labelled (WCAG 2.1.1 / 4.1.2). */}
      <div className="table-scroll" role="region" aria-labelledby="matrix-heading" tabIndex={0}>
        <table className="matrix">
          <thead>
            <tr>
              <th scope="col">Code</th>
              <th scope="col">Violation</th>
              <th scope="col">Match</th>
              <th scope="col">Evidence</th>
              <th scope="col">Expected (days)</th>
              <th scope="col">Sanction (days)</th>
              <th scope="col">Ratio</th>
              <th scope="col">Verdict</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.code}>
                <th scope="row">{row.code}</th>
                <td>{row.label}</td>
                <td>{row.matchId}</td>
                <td>{formatPercent(row.evidenceStrength)}</td>
                <td>{row.expectedDays}</td>
                <td>{row.sanctionDays}</td>
                <td>{formatRatio(row.ratio)}</td>
                <td>
                  <span className={VERDICT_CLASS[row.verdict]}>{row.verdict}</span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row" colSpan={4}>
                Total
              </th>
              <td>{totals.expectedDays}</td>
              <td>{totals.sanctionDays}</td>
              <td>{formatRatio(totals.ratio)}</td>
              <td>
                <span className={VERDICT_CLASS[totals.verdict]}>{totals.verdict}</span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}