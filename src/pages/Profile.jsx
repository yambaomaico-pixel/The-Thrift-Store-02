import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Profile = () => {
  const { currentUser, updatePassword } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const ordersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(ordersData);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setOrdersLoading(false);
      }
    };
    if (currentUser) {
      fetchOrders();
    }
  }, [currentUser]);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!newPassword) return;
    
    try {
      setError('');
      setMessage('');
      setLoading(true);
      await updatePassword(newPassword);
      setMessage('Password updated successfully.');
      setNewPassword('');
    } catch (err) {
      setError('Failed to update password. You may need to log in again.');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="container" style={{ padding: 'var(--spacing-8) 0' }}>
      <h1 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--spacing-8)' }}>My Profile</h1>
      
      <div className="flex gap-8 flex-col" style={{ md: { flexDirection: 'row' } }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-8)' }}>
          <div className="card" style={{ padding: 'var(--spacing-6)' }}>
            <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-4)' }}>Account Details</h2>
            <div className="flex flex-col gap-4">
              <div>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>Full Name</span>
                <p style={{ fontWeight: 500 }}>{currentUser.fullName || 'Not provided'}</p>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>Email Address</span>
                <p style={{ fontWeight: 500 }}>{currentUser.email}</p>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>Account Role</span>
                <p style={{ fontWeight: 500, textTransform: 'capitalize' }}>{currentUser.role}</p>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 'var(--spacing-6)' }}>
            <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-4)' }}>Security</h2>
            
            {message && <div style={{ backgroundColor: 'var(--color-success)', color: 'white', padding: 'var(--spacing-2)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--spacing-4)', fontSize: 'var(--font-size-sm)' }}>{message}</div>}
            {error && <div style={{ backgroundColor: 'var(--color-error)', color: 'white', padding: 'var(--spacing-2)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--spacing-4)', fontSize: 'var(--font-size-sm)' }}>{error}</div>}

            <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
              <Input 
                label="New Password" 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                required 
                minLength="6"
              />
              <Button type="submit" isLoading={loading} style={{ alignSelf: 'flex-start' }}>Update Password</Button>
            </form>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div className="card" style={{ padding: 'var(--spacing-6)' }}>
            <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-4)' }}>Ordered Items</h2>
            
            {ordersLoading ? (
              <p style={{ color: 'var(--color-text-secondary)' }}>Loading orders...</p>
            ) : orders.length === 0 ? (
              <div>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-4)' }}>You have no recent orders.</p>
                <Link to="/shop" className="btn btn-primary" style={{ display: 'inline-block' }}>Shop Now</Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {orders.map(order => (
                  <div key={order.id} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-4)' }}>
                    <div className="flex justify-between items-start" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--spacing-2)', marginBottom: 'var(--spacing-3)' }}>
                      <div>
                        <p style={{ fontWeight: 600 }}>Order ID: <span style={{ fontWeight: 'normal', fontSize: 'var(--font-size-sm)' }}>{order.id}</span></p>
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                          {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ 
                          display: 'inline-block', 
                          padding: 'var(--spacing-1) var(--spacing-2)', 
                          backgroundColor: 'var(--color-bg)', 
                          borderRadius: 'var(--radius-full)', 
                          fontSize: 'var(--font-size-xs)', 
                          fontWeight: 600, 
                          color: 'var(--color-accent)' 
                        }}>
                          Status: {order.status}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: 'var(--spacing-3)' }}>
                      {order.items.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center" style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-1)' }}>
                          <span>{item.quantity}x {item.name}</span>
                          <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-1)' }}>
                          ...and {order.items.length - 2} more item(s)
                        </p>
                      )}
                    </div>

                    <div style={{ backgroundColor: 'var(--color-bg)', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-sm)' }}>
                      <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 'var(--spacing-1)' }}>Delivery Update:</p>
                      {order.estimatedArrival ? (
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-accent)' }}>
                          <strong>ETA:</strong> Wait for {order.estimatedArrival} to arrive.
                        </p>
                      ) : (
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                          Waiting for admin to confirm estimated arrival time.
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
