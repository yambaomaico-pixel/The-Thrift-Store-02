import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
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
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressMsg, setAddressMsg] = useState('');
  
  // Shipping details state
  const [address, setAddress] = useState(currentUser?.address?.address || '');
  const [city, setCity] = useState(currentUser?.address?.city || '');
  const [zip, setZip] = useState(currentUser?.address?.zip || '');
  const [contact, setContact] = useState(currentUser?.phone || '');
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const ordersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort on client side to avoid Firestore composite index requirement
        ordersData.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
          return dateB - dateA;
        });
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

  const calculateETA = (deliveryDate) => {
    if (!deliveryDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(deliveryDate);
    targetDate.setHours(0, 0, 0, 0);
    const diffTime = targetDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleConfirmReceived = async (orderId) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'Delivered',
        deliveryConfirmed: true,
        deliveredAt: new Date()
      });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'Delivered', deliveryConfirmed: true } : o));
    } catch (error) {
      console.error("Error confirming delivery:", error);
      alert("Failed to confirm delivery.");
    }
  };

  const handleReportNotReceived = async (orderId) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'Parcel Has Arrived',
        deliveryIssue: true,
        issueStatus: 'Pending Review'
      });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'Parcel Has Arrived', deliveryIssue: true, issueStatus: 'Pending Review' } : o));
    } catch (error) {
      console.error("Error reporting issue:", error);
      alert("Failed to report issue.");
    }
  };

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

  const handleUpdateShipping = async (e) => {
    e.preventDefault();
    setAddressLoading(true);
    setAddressMsg('');
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        phone: contact,
        address: { address, city, zip }
      });
      // Optionally update currentUser in context if needed, but context reloads on refresh
      setAddressMsg('Shipping details updated successfully.');
    } catch (err) {
      console.error(err);
      setAddressMsg('Failed to update shipping details.');
    } finally {
      setAddressLoading(false);
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
            <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-4)' }}>Shipping Details</h2>
            {addressMsg && (
              <div style={{ backgroundColor: addressMsg.includes('Failed') ? 'var(--color-error)' : 'var(--color-success)', color: 'white', padding: 'var(--spacing-2)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--spacing-4)', fontSize: 'var(--font-size-sm)' }}>
                {addressMsg}
              </div>
            )}
            <form onSubmit={handleUpdateShipping} className="flex flex-col gap-4">
              <Input label="Street Address" value={address} onChange={(e) => setAddress(e.target.value)} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
                <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} />
                <Input label="ZIP / Postal Code" value={zip} onChange={(e) => setZip(e.target.value)} />
              </div>
              <Input label="Contact Number" type="tel" value={contact} onChange={(e) => setContact(e.target.value)} />
              <Button type="submit" isLoading={addressLoading} style={{ alignSelf: 'flex-start' }}>Save Information</Button>
            </form>
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
                {orders.map(order => {
                  const etaDays = calculateETA(order.estimatedDeliveryDate);
                  let displayedStatus = order.status;
                  if (order.status === 'Shipped' && etaDays !== null && etaDays <= 0) {
                    displayedStatus = 'Parcel Has Arrived';
                  }

                  return (
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
                          Status: {displayedStatus}
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
                      {order.estimatedDeliveryDate ? (
                        <div>
                          <p style={{ fontSize: 'var(--font-size-sm)' }}>
                            <span style={{ color: 'var(--color-text-secondary)' }}>Est. Delivery: </span>
                            <strong>{new Date(order.estimatedDeliveryDate).toLocaleDateString()}</strong>
                          </p>
                          {etaDays > 0 ? (
                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-accent)', marginTop: '2px' }}>
                              <strong>ETA:</strong> {etaDays} day(s)
                            </p>
                          ) : displayedStatus === 'Parcel Has Arrived' ? (
                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-accent)', marginTop: '2px', fontWeight: 'bold' }}>
                              Your parcel has arrived!
                            </p>
                          ) : null}
                        </div>
                      ) : (
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                          Waiting for admin to confirm estimated delivery date.
                        </p>
                      )}

                      {/* Customer Confirmation Section */}
                      {displayedStatus === 'Parcel Has Arrived' && !order.deliveryIssue && (
                        <div style={{ marginTop: 'var(--spacing-3)' }}>
                          <p style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-2)' }}>Please confirm you have received your order.</p>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleConfirmReceived(order.id)} 
                              className="btn btn-primary"
                              style={{ padding: '4px 8px', fontSize: 'var(--font-size-xs)' }}
                            >
                              Confirm Received
                            </button>
                            <button 
                              onClick={() => handleReportNotReceived(order.id)} 
                              className="btn btn-outline"
                              style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)', padding: '4px 8px', fontSize: 'var(--font-size-xs)' }}
                            >
                              Report Not Received
                            </button>
                          </div>
                        </div>
                      )}

                      {order.deliveryIssue && (
                        <div style={{ marginTop: 'var(--spacing-3)' }}>
                          <p style={{ color: 'var(--color-danger)', fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>
                            Delivery issue reported. Status: {order.issueStatus}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )})}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
