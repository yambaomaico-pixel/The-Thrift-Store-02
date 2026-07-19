import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
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
    <nav style={{ padding: 'var(--spacing-4)', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', position: 'sticky', top: 0, zIndex: 50 }}>
      <div className="container flex justify-between items-center">
        <Link to="/" style={{ fontWeight: 'bold', fontSize: 'var(--font-size-xl)', color: 'var(--color-accent)' }}>ThriftStore.</Link>
        <div className="flex gap-4 items-center">
          <Link to="/shop" style={{ fontWeight: 500 }}>Shop</Link>
          
          {currentUser ? (
            <>
              {currentUser.role === 'admin' && (
                <Link to="/admin" style={{ fontWeight: 500, color: 'var(--color-warning)' }}>Admin</Link>
              )}
              <Link to="/cart" style={{ fontWeight: 500 }}>Cart</Link>
              <Link to="/profile" style={{ fontWeight: 500 }}>Profile</Link>
              <Button variant="outline" onClick={handleLogout} style={{ padding: 'var(--spacing-1) var(--spacing-3)', fontSize: 'var(--font-size-sm)' }}>Logout</Button>
            </>
          ) : (
            <>
              <Link to="/cart" style={{ fontWeight: 500 }}>Cart</Link>
              <Link to="/login">
                <Button variant="primary" style={{ padding: 'var(--spacing-1) var(--spacing-4)', fontSize: 'var(--font-size-sm)' }}>Login</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
