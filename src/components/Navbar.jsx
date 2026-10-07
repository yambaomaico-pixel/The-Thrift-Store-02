import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Button from './ui/Button';
import { FiSun, FiMoon } from 'react-icons/fi';

import logoUrl from '../assets/logo.png';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="container flex justify-between items-center">
        <Link to="/" className="nav-brand" style={{ display: 'flex', alignItems: 'center' }}>
          <img src={logoUrl} alt="The Thrift Store" className="theme-logo" style={{ height: '80px', width: 'auto' }} />
        </Link>
        <div className="flex gap-4 items-center">
          <Link to="/shop" className="font-medium">Shop</Link>
          
          {currentUser ? (
            <>
              {currentUser.role === 'admin' && (
                <Link to="/admin" className="font-bold" style={{ color: 'var(--color-warning)' }}>Admin</Link>
              )}
              <Link to="/cart" className="font-medium">Cart</Link>
              <Link to="/profile" className="font-medium">Profile</Link>
              <Button variant="outline" onClick={handleLogout} style={{ padding: 'var(--spacing-1) var(--spacing-4)' }}>Logout</Button>
            </>
          ) : (
            <>
              <Link to="/cart" className="font-medium">Cart</Link>
              <Link to="/login">
                <Button variant="primary">Login</Button>
              </Link>
            </>
          )}
          <button 
            onClick={toggleTheme} 
            className="theme-toggle"
            aria-label="Toggle Dark Mode"
          >
            {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
