import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { FaRegClock, FaEye } from 'react-icons/fa';

const RecentlyViewed = () => {
  const { currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecentlyViewed = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      
      try {
        const q = query(
          collection(db, `users/${currentUser.uid}/recentlyViewed`),
          orderBy('viewedAt', 'desc'),
          limit(5)
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setItems(data);
      } catch (error) {
        console.error("Error fetching recently viewed:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecentlyViewed();
  }, [currentUser]);

  if (loading) {
    return <div style={{ padding: 'var(--spacing-4)', color: 'var(--color-text-secondary)' }}>Loading history...</div>;
  }

  return (
    <div style={{
      backgroundColor: 'var(--color-surface)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--spacing-6)',
      boxShadow: 'var(--shadow-sm)',
      border: '1px solid var(--color-border)',
      height: '100%'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-6)', color: 'var(--color-text-primary)' }}>
        <FaRegClock size={20} />
        <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'bold' }}>Recently Viewed</h2>
      </div>

      {!currentUser ? (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-4)', color: 'var(--color-text-secondary)' }}>
          <p style={{ marginBottom: 'var(--spacing-4)' }}>Log in to see your recently viewed items.</p>
          <button 
            onClick={() => navigate('/login')}
            className="btn btn-primary w-full"
          >
            Log In
          </button>
        </div>
      ) : items.length === 0 ? (
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>You haven't viewed any items yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
          {items.map(item => (
            <div key={item.id} style={{
              backgroundColor: 'var(--color-bg)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Image Section */}
              <div style={{ position: 'relative', height: '140px' }}>
                <img 
                  src={item.image} 
                  alt={item.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  backgroundColor: 'var(--color-error)',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  letterSpacing: '0.5px'
                }}>
                  VIEWED
                </div>
              </div>
              
              {/* Content Section */}
              <div style={{ padding: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 style={{ fontWeight: 'bold', fontSize: 'var(--font-size-base)', marginBottom: '4px', color: 'var(--color-text-primary)' }}>
                  {item.name}
                </h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem', marginBottom: 'var(--spacing-4)', flex: 1 }}>
                  {item.brand || 'No brand specified'}
                </p>
                <Link 
                  to={`/product/${item.id}`} 
                  style={{
                    backgroundColor: '#111827', // Very dark blue/slate like the screenshot
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    textDecoration: 'none',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1f2937'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#111827'}
                >
                  <FaEye size={14} /> View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentlyViewed;
