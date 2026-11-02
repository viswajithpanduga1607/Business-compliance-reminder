/**
 * ExecutiveStats — Luxury KPI intelligence cards showing compliance health,
 * impending expirations, and overdue instruments at a glance.
 */
function ExecutiveStats({ documents = [] }) {
  const total = documents.length;
  const expired = documents.filter((d) => {
    const days = Math.ceil((new Date(d.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    return d.status === 'Expired' || days < 0;
  }).length;

  const expiringSoon = documents.filter((d) => {
    const days = Math.ceil((new Date(d.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    return d.status === 'Expiring Soon' || (days >= 0 && days <= 30);
  }).length;

  const active = documents.filter((d) => d.status === 'Active' && !expired && !expiringSoon).length;

  const complianceRate = total > 0 ? Math.round(((total - expired) / total) * 100) : 100;

  return (
    <div className="stats-grid">
      {/* ── Card 1: Total Instruments ──────────────────────────── */}
      <div className="stat-card">
        <div className="stat-card__icon stat-card__icon--copper">
          📜
        </div>
        <div className="stat-card__content">
          <span className="stat-card__label">Active Portfolio</span>
          <div className="stat-card__value">
            {total} <span className="stat-card__unit">Instruments</span>
          </div>
          <span className="stat-card__meta">Fully cataloged in register</span>
        </div>
      </div>

      {/* ── Card 2: Expiring Soon (<30 Days) ──────────────────── */}
      <div className="stat-card stat-card--warning">
        <div className="stat-card__icon stat-card__icon--amber">
          ⏳
        </div>
        <div className="stat-card__content">
          <span className="stat-card__label">Renewal Window</span>
          <div className="stat-card__value">
            {expiringSoon} <span className="stat-card__unit">Under 30 Days</span>
          </div>
          <span className="stat-card__meta">Prioritized for extension</span>
        </div>
      </div>

      {/* ── Card 3: Overdue / Expired ──────────────────────────── */}
      <div className={`stat-card ${expired > 0 ? 'stat-card--urgent' : ''}`}>
        <div className="stat-card__icon stat-card__icon--ruby">
          ⚠️
        </div>
        <div className="stat-card__content">
          <span className="stat-card__label">Immediate Attention</span>
          <div className="stat-card__value">
            {expired} <span className="stat-card__unit">Overdue</span>
          </div>
          <span className="stat-card__meta">Lapsed compliance instrument</span>
        </div>
      </div>

      {/* ── Card 4: Compliance Health Score ────────────────────── */}
      <div className="stat-card">
        <div className="stat-card__icon stat-card__icon--emerald">
          ⚖️
        </div>
        <div className="stat-card__content">
          <span className="stat-card__label">Compliance Health</span>
          <div className="stat-card__value">
            {complianceRate}% <span className="stat-card__unit">Verified</span>
          </div>
          <div className="stat-card__progress">
            <div
              className="stat-card__progress-fill"
              style={{ width: `${complianceRate}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExecutiveStats;

