import { NavLink, Link, useNavigate } from 'react-router-dom';

/**
 * StatusBadge — status indicator chip with glowing urgency markers.
 */
export function StatusBadge({ status }) {
  const cls = {
    Active: 'status-badge--active',
    'Expiring Soon': 'status-badge--expiring',
    Expired: 'status-badge--expired',
  }[status] || 'status-badge--expired';

  return (
    <span className={`status-badge ${cls}`}>
      <span className="status-badge__dot" />
      {status}
    </span>
  );
}

/**
 * Navbar — Executive luxury header with wax crest branding,
 * navigation ledger links, and guaranteed click redirection to home.
 */
function Navbar() {
  const navigate = useNavigate();

  const handleBrandClick = (e) => {
    e.preventDefault();
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="navbar" aria-label="Main navigation">
      {/* ── Brand Crest & Title (Click to Redirect Home) ─────── */}
      <Link
        to="/"
        onClick={handleBrandClick}
        className="navbar__brand"
        title="Return to Executive Dashboard"
        aria-label="BusinessDocument Expiry - Return to Dashboard"
      >
        <div className="navbar__crest">
          {/* Custom SVG Wax Seal / Heraldic Column Crest */}
          <svg viewBox="0 0 36 36" width="34" height="34" fill="none" aria-hidden="true">
            <circle cx="18" cy="18" r="16" fill="url(#waxGradient)" stroke="#E6CFA9" strokeWidth="1.5" />
            <circle cx="18" cy="18" r="13" stroke="#C1856D" strokeWidth="0.75" strokeDasharray="2 1" />
            {/* Columns of Justice / Temple icon */}
            <path d="M11 25H25" stroke="#FBF9D1" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M12 23V15" stroke="#FBF9D1" strokeWidth="1.25" strokeLinecap="round" />
            <path d="M16 23V15" stroke="#FBF9D1" strokeWidth="1.25" strokeLinecap="round" />
            <path d="M20 23V15" stroke="#FBF9D1" strokeWidth="1.25" strokeLinecap="round" />
            <path d="M24 23V15" stroke="#FBF9D1" strokeWidth="1.25" strokeLinecap="round" />
            <path d="M10 14H26L18 9L10 14Z" fill="#FBF9D1" stroke="#FBF9D1" strokeWidth="0.5" />
            <defs>
              <linearGradient id="waxGradient" x1="4" y1="4" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#9A3F3F" />
                <stop offset="0.6" stopColor="#7A2E2E" />
                <stop offset="1" stopColor="#4A1818" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="navbar__titles">
          <span className="navbar__name">BusinessDocument Expiry</span>
          <span className="navbar__sub">Executive Compliance &amp; Renewal Register</span>
        </div>
      </Link>

      {/* ── Navigation Links & System Badge ─────────────────── */}
      <div className="navbar__right">
        <ul className="navbar__list" role="list">
          <li>
            <NavLink to="/" end className="navbar__link">
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/documents" className="navbar__link">
              Register
            </NavLink>
          </li>
        </ul>

        <div className="navbar__badge" title="Permanent Audit Ledger Verified">
          <span className="navbar__badge-icon">&bull;</span>
          <span>Ledger Verified</span>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
