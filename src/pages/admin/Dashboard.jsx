import { useState, useEffect } from 'react';
import { collection, getDocs, getCountFromServer, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';

const Dashboard = () => {
  const [stats, setStats] = useState([
    { label: 'Total Customers', value: '...' },
    { label: 'Total Products', value: '...' },
    { label: 'Total Orders', value: '...' },
    { label: 'Total Revenue', value: '...' },
  ]);
  const [deliveryIssuesCount, setDeliveryIssuesCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 1. Total Customers
        const usersSnap = await getCountFromServer(collection(db, 'users'));
        const totalCustomers = usersSnap.data().count;

        // 2. Total Products
        const productsSnap = await getCountFromServer(collection(db, 'products'));
        const totalProducts = productsSnap.data().count;

        // 3. Total Orders & Revenue
        const ordersSnapshot = await getDocs(collection(db, 'orders'));
        const totalOrders = ordersSnapshot.size;
        let totalRevenue = 0;
        ordersSnapshot.forEach(doc => {
          totalRevenue += (doc.data().totalAmount || 0);
        });

        setStats([
          { label: 'Total Customers', value: totalCustomers.toString() },
          { label: 'Total Products', value: totalProducts.toString() },
          { label: 'Total Orders', value: totalOrders.toString() },
          { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}` },
        ]);

        // 4. Delivery Issues
        const issuesQuery = query(
          collection(db, 'orders'),
          where('deliveryIssue', '==', true),
          where('issueStatus', '==', 'Pending Review')
        );
        const issuesSnap = await getCountFromServer(issuesQuery);
        setDeliveryIssuesCount(issuesSnap.data().count);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        setStats([
          { label: 'Total Customers', value: 'Error' },
          { label: 'Total Products', value: 'Error' },
          { label: 'Total Orders', value: 'Error' },
          { label: 'Total Revenue', value: 'Error' },
        ]);
      }
    };

    fetchStats();
  }, []);

  return (
    <AdminLayout title="Dashboard Overview">
      {deliveryIssuesCount > 0 && (
        <div style={{ marginBottom: 'var(--spacing-6)' }}>
          <Link to="/admin/orders" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ 
              padding: 'var(--spacing-4)', 
              backgroundColor: 'rgba(239, 68, 68, 0.1)', 
              borderLeft: '4px solid var(--color-danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h3 style={{ color: 'var(--color-danger)', margin: 0 }}>Delivery Issues ({deliveryIssuesCount})</h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', margin: '4px 0 0 0' }}>
                  Customers have reported issues with their deliveries. Click to review.
                </p>
              </div>
              <span style={{ color: 'var(--color-danger)' }}>&rarr;</span>
            </div>
          </Link>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-6)' }}>
        {stats.map((stat, i) => (
          <div key={i} className="card" style={{ padding: 'var(--spacing-6)', textAlign: 'center' }}>
            <h3 style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-2)' }}>{stat.label}</h3>
            <p style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', color: 'var(--color-accent)' }}>{stat.value}</p>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
