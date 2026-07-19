import AdminLayout from '../../components/AdminLayout';

const Dashboard = () => {
  // Mock data for overview
  const stats = [
    { label: 'Total Customers', value: '156' },
    { label: 'Total Products', value: '84' },
    { label: 'Total Orders', value: '342' },
    { label: 'Total Revenue', value: '$12,450' },
  ];

  return (
    <AdminLayout title="Dashboard Overview">
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
