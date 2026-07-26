import { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, orderBy, query } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import AdminLayout from '../../components/AdminLayout';

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const ordersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersData);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update status.");
    }
  };

  return (
    <AdminLayout title="Manage Orders">
      <div className="card" style={{ padding: 'var(--spacing-6)', overflowX: 'auto' }}>
        {loading ? (
          <p style={{ textAlign: 'center' }}>Loading orders...</p>
        ) : orders.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>No orders found.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: 'var(--spacing-3)', fontWeight: 600 }}>Order Date</th>
                <th style={{ padding: 'var(--spacing-3)', fontWeight: 600 }}>Customer</th>
                <th style={{ padding: 'var(--spacing-3)', fontWeight: 600 }}>Address</th>
                <th style={{ padding: 'var(--spacing-3)', fontWeight: 600 }}>Payment</th>
                <th style={{ padding: 'var(--spacing-3)', fontWeight: 600 }}>Total</th>
                <th style={{ padding: 'var(--spacing-3)', fontWeight: 600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: 'var(--spacing-3)' }}>
                    {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={{ padding: 'var(--spacing-3)' }}>
                    <div><strong>{order.customerName}</strong></div>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{order.contactNumber}</div>
                  </td>
                  <td style={{ padding: 'var(--spacing-3)', maxWidth: '250px' }}>
                    <div style={{ fontSize: 'var(--font-size-sm)' }}>
                      {order.shippingAddress?.address}, {order.shippingAddress?.city} {order.shippingAddress?.zip}
                    </div>
                  </td>
                  <td style={{ padding: 'var(--spacing-3)' }}>
                    {order.paymentMethod}
                  </td>
                  <td style={{ padding: 'var(--spacing-3)', fontWeight: 'bold' }}>
                    ${order.totalAmount?.toFixed(2)}
                  </td>
                  <td style={{ padding: 'var(--spacing-3)' }}>
                    <select 
                      value={order.status} 
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      style={{ 
                        padding: 'var(--spacing-1) var(--spacing-2)', 
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-border)',
                        backgroundColor: 'var(--color-bg)'
                      }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
};

export default ManageOrders;
