import { NavLink } from 'react-router-dom';

/**
 * StatusBadge — exported so views can use it without importing Navbar.
 */
export function StatusBadge({ status }) {
  const cls = {
    Active:          'status-badge--active',
    'Expiring Soon': 'status-badge--expiring',
    Expired:         'status-badge--expired',
  }[status] || 'status-badge--expired';

  return <span className={`status-badge ${cls}`}>{status}</span>;
}

/**
 * Navbar — sticky top navigation with luxury vintage branding.
 */
function Navbar() {
  return (
    <nav className="navbar" aria-label="Main navigation">
      <NavLink to="/" className="navbar__brand">
        BusinessDocument Expiry
        <span>Compliance &amp; Renewal Register</span>
      </NavLink>

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
    </nav>
  );
}

export default Navbar;
