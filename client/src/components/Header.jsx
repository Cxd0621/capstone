// Auth-aware header: Login/Register, or Dashboard/Logout once signed in.
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Layout.module.css';

function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navClass = ({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.brand}>
          Chen Xiaoding
          <span className={styles.brandSub}>Full-stack portfolio</span>
        </Link>

        <nav className={styles.nav} aria-label="Main navigation">
          <NavLink to="/" className={navClass} end>
            Home
          </NavLink>
          <NavLink to="/projects" className={navClass}>
            Projects
          </NavLink>
          <NavLink to="/blog" className={navClass}>
            Blog
          </NavLink>
          <NavLink to="/contact" className={navClass}>
            Contact
          </NavLink>
        </nav>

        <div className={styles.actions}>
          {isAuthenticated ? (
            <>
              <Link to="/admin" className="btn btn-small">
                Dashboard
              </Link>
              <button type="button" className="btn btn-small btn-ghost" onClick={handleLogout}>
                Logout
              </button>
              <span className={styles.user}>signed in as {user.username}</span>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.loginLink}>
                Login
              </Link>
              <Link to="/register" className="btn btn-small">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
