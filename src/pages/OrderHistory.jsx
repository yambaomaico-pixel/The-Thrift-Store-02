import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
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
          where('userId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const ordersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
          {orders.map(order => (
            <div key={order.id} className="card" style={{ padding: 'var(--spacing-6)' }}>
              <div className="flex justify-between items-center" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--spacing-4)', marginBottom: 'var(--spacing-4)' }}>
                <div>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Order ID: {order.id}</p>
                  <p style={{ fontWeight: 500 }}>Placed on {new Date(order.createdAt?.seconds * 1000).toLocaleDateString()}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'bold' }}>${order.totalAmount.toFixed(2)}</p>
                  <span style={{ display: 'inline-block', padding: 'var(--spacing-1) var(--spacing-2)', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-xs)', fontWeight: 500, color: 'var(--color-accent)', marginTop: 'var(--spacing-1)' }}>
                    {order.status}
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
