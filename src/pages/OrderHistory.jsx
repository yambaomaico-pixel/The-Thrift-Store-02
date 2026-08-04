import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const OrderHistory = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const ordersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        ordersData.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
          return dateB - dateA;
        });
        setOrders(ordersData);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    if (currentUser) {
      fetchOrders();
    }
  }, [currentUser]);

  const calculateETA = (deliveryDate) => {
    if (!deliveryDate) return null;
    const targetDate = new Date(deliveryDate);
    if (isNaN(targetDate.getTime())) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
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

  if (loading) return <div className="container" style={{ padding: 'var(--spacing-8) 0', textAlign: 'center' }}>Loading orders...</div>;

  return (
    <div className="container" style={{ padding: 'var(--spacing-8) 0' }}>
      <h1 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--spacing-8)' }}>My Orders</h1>
      
      {orders.length === 0 ? (
        <div className="card" style={{ padding: 'var(--spacing-12)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          <p style={{ marginBottom: 'var(--spacing-4)' }}>You haven't placed any orders yet.</p>
          <Link to="/shop" className="btn btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {orders.map(order => {
            const deliveryDate = order.estimatedDeliveryDate || order.estimatedArrival;
            const etaDays = calculateETA(deliveryDate);
            let displayedStatus = order.status;
            
            // Automatic Arrival Detection
            if (order.status === 'Shipped' && etaDays !== null && etaDays <= 0) {
              displayedStatus = 'Parcel Has Arrived';
            }

            return (
            <div key={order.id} className="card" style={{ padding: 'var(--spacing-6)' }}>
              <div className="flex justify-between items-center" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--spacing-4)', marginBottom: 'var(--spacing-4)' }}>
                <div>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Order ID: {order.id}</p>
                  <p style={{ fontWeight: 500 }}>Placed on {new Date(order.createdAt?.seconds * 1000).toLocaleDateString()}</p>
                  
                  {deliveryDate && (
                    <div style={{ marginTop: 'var(--spacing-2)' }}>
                      <p style={{ fontSize: 'var(--font-size-sm)' }}>
                        <span style={{ color: 'var(--color-text-secondary)' }}>Estimated Delivery: </span>
                        <strong>{deliveryDate.includes('-') && deliveryDate.length === 10 ? new Date(deliveryDate).toLocaleDateString() : deliveryDate}</strong>
                      </p>
                      {etaDays > 0 && (
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-accent)' }}>
                          ETA: {etaDays} day(s)
                        </p>
                      )}
                    </div>
                  )}

                  <div style={{ marginTop: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Payment: </span> 
                    <strong>{order.paymentMethod || 'COD'}</strong>
                    {order.paymentMethod === 'GCash' && (
                      <span style={{ 
                        marginLeft: 'var(--spacing-2)', 
                        display: 'inline-block', 
                        padding: '2px 8px', 
                        backgroundColor: order.paymentStatus === 'Verified' ? '#10b981' : order.paymentStatus === 'Rejected' ? '#ef4444' : '#f59e0b', 
                        color: 'white', 
                        borderRadius: 'var(--radius-full)', 
                        fontSize: '10px', 
                        fontWeight: 600 
                      }}>
                        {order.paymentStatus || 'Pending Verification'}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'bold' }}>${order.totalAmount.toFixed(2)}</p>
                  <span style={{ display: 'inline-block', padding: 'var(--spacing-1) var(--spacing-2)', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-xs)', fontWeight: 500, color: 'var(--color-accent)', marginTop: 'var(--spacing-1)' }}>
                    {displayedStatus}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col gap-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-center">
                    <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                    <div>
                      <Link to={`/product/${item.id}`} style={{ fontWeight: 500, display: 'block' }}>{item.name}</Link>
                      <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>Qty: {item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Customer Confirmation Section */}
              {displayedStatus === 'Parcel Has Arrived' && !order.deliveryIssue && (
                <div style={{ 
                  marginTop: 'var(--spacing-6)', 
                  padding: 'var(--spacing-4)', 
                  backgroundColor: 'var(--color-bg)', 
                  borderRadius: 'var(--radius-md)', 
                  border: '1px solid var(--color-border)' 
                }}>
                  <h4 style={{ marginBottom: 'var(--spacing-3)', fontWeight: 600 }}>Your parcel has arrived.</h4>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => handleConfirmReceived(order.id)} 
                      className="btn btn-primary"
                    >
                      Confirm Received
                    </button>
                    <button 
                      onClick={() => handleReportNotReceived(order.id)} 
                      className="btn btn-outline"
                      style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
                    >
                      Report Not Received
                    </button>
                  </div>
                </div>
              )}

              {order.deliveryIssue && (
                <div style={{ 
                  marginTop: 'var(--spacing-6)', 
                  padding: 'var(--spacing-4)', 
                  backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                  borderRadius: 'var(--radius-md)', 
                  border: '1px solid var(--color-danger)' 
                }}>
                  <p style={{ color: 'var(--color-danger)', fontWeight: 500 }}>
                    Delivery issue reported. Status: {order.issueStatus}
                  </p>
                </div>
              )}
            </div>
          )})}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
