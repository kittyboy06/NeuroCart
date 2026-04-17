import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const { cartCount } = useCart();
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="navbar-logo">🧠</span>
          <span className="navbar-title">NeuroCart</span>
        </Link>

        <div className="navbar-actions">
          {isDashboard ? (
            <Link to="/" className="navbar-link">
              <span className="navbar-link-icon">←</span> Store
            </Link>
          ) : (
            <>
              <Link to="/cart" className="navbar-cart">
                <span className="cart-icon">🛒</span>
                {cartCount > 0 && (
                  <span className="cart-badge">{cartCount}</span>
                )}
              </Link>
              <Link to="/dashboard" className="navbar-link">
                Retailer View
              </Link>
            </>
          )}

          {user && (
            <div className="navbar-user">
              <span className="user-email">{user.email?.split('@')[0]}</span>
              <button onClick={signOut} className="btn-logout">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
