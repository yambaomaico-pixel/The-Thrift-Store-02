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

      if (newStatus === 'Delivered') {
        const order = orders.find(o => o.id === orderId);
        if (order && order.items) {
          for (const item of order.items) {
            try {
              await updateDoc(doc(db, 'products', item.id), { status: 'sold' });
            } catch (err) {
              console.error("Error updating product status:", err);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update status.");
    }
  };

  const handlePaymentStatusChange = async (orderId, newPaymentStatus) => {
    try {
      const updates = { paymentStatus: newPaymentStatus };
      if (newPaymentStatus === 'Verified') {
        updates.status = 'Processing';
      }
      
      await updateDoc(doc(db, 'orders', orderId), updates);
      
      setOrders(orders.map(o => {
        if (o.id === orderId) {
          return { 
            ...o, 
            paymentStatus: newPaymentStatus,
            ...(newPaymentStatus === 'Verified' ? { status: 'Processing' } : {})
          };
        }
        return o;
      }));
    } catch (error) {
      console.error("Error updating payment status:", error);
      alert("Failed to update payment status.");
    }
  };

  const handleDeliveryDateChange = async (orderId, newDate) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { estimatedDeliveryDate: newDate });
      setOrders(orders.map(o => o.id === orderId ? { ...o, estimatedDeliveryDate: newDate } : o));
    } catch (error) {
      console.error("Error updating estimated delivery date:", error);
      alert("Failed to update delivery date.");
    }
  };

  const calculateETA = (deliveryDate) => {
    if (!deliveryDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(deliveryDate);
    targetDate.setHours(0, 0, 0, 0);
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const todayStr = new Date().toISOString().split('T')[0];


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
                <th style={{ padding: 'var(--spacing-3)', fontWeight: 600 }}>Payment Status</th>
                <th style={{ padding: 'var(--spacing-3)', fontWeight: 600 }}>Total</th>
                <th style={{ padding: 'var(--spacing-3)', fontWeight: 600 }}>Status</th>
                <th style={{ padding: 'var(--spacing-3)', fontWeight: 600 }}>Est. Delivery</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => {
                const deliveryDate = order.estimatedDeliveryDate || order.estimatedArrival;
                const etaDays = calculateETA(deliveryDate);
                const hasIssue = order.deliveryIssue && order.issueStatus === 'Pending Review';
                return (
                <tr key={order.id} style={{ 
                  borderBottom: '1px solid var(--color-border)',
                  backgroundColor: hasIssue ? 'rgba(239, 68, 68, 0.1)' : 'transparent' 
                }}>
                  <td style={{ padding: 'var(--spacing-3)' }}>
                    {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'N/A'}
                    {hasIssue && (
                      <div style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-xs)', fontWeight: 'bold', marginTop: '4px' }}>
                        Delivery Issue Reported
                      </div>
                    )}
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
                    {order.paymentMethod === 'GCash' && (
                      <div style={{ fontSize: 'var(--font-size-xs)', marginTop: '4px' }}>
                        <div>Ref: {order.gcashReference}</div>
                        {order.paymentReceiptUrl && (
                          <a href={order.paymentReceiptUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}>
                            View Receipt
                          </a>
                        )}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: 'var(--spacing-3)' }}>
                    {order.paymentMethod === 'GCash' ? (
                      <select 
                        value={order.paymentStatus || 'Pending Verification'} 
                        onChange={(e) => handlePaymentStatusChange(order.id, e.target.value)}
                        style={{ 
                          padding: 'var(--spacing-1) var(--spacing-2)', 
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--color-border)',
                          backgroundColor: 'var(--color-bg)'
                        }}
                      >
                        <option value="Pending Verification">Pending Verification</option>
                        <option value="Verified">Verified</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    ) : (
                      <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                        {order.paymentStatus || 'N/A'}
                      </span>
                    )}
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
                      <option value="Parcel Has Arrived">Parcel Has Arrived</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td style={{ padding: 'var(--spacing-3)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <input 
                        type="date" 
                        min={todayStr}
                        value={deliveryDate || ''}
                        onChange={(e) => handleDeliveryDateChange(order.id, e.target.value)}
                        style={{ 
                          padding: 'var(--spacing-1) var(--spacing-2)', 
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--color-border)',
                          backgroundColor: 'var(--color-bg)',
                          width: '130px'
                        }}
                      />
                      {deliveryDate && (
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                          ETA: {etaDays !== null ? (etaDays > 0 ? `${etaDays} day(s)` : (etaDays === 0 ? 'Today' : 'Past Due')) : 'N/A'}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
};

export default ManageOrders;
