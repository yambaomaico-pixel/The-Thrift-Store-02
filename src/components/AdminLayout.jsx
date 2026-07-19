import { Link, useLocation } from 'react-router-dom';

const AdminLayout = ({ children, title }) => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/admin' },
    { name: 'Products', path: '/admin/products' },
    { name: 'Orders', path: '/admin/orders' },
  ];

  return (
    <div className="container flex gap-6" style={{ padding: 'var(--spacing-8) 0' }}>
      <aside style={{ width: '250px', flexShrink: 0 }}>
        <div className="card" style={{ padding: 'var(--spacing-4)' }}>
          <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-4)', paddingBottom: 'var(--spacing-2)', borderBottom: '1px solid var(--color-border)' }}>Admin Menu</h2>
          <nav className="flex flex-col gap-2">
            {navItems.map(item => (
              <Link 
                key={item.name} 
                to={item.path}
                style={{ 
                  padding: 'var(--spacing-2)', 
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: location.pathname === item.path ? 'var(--color-bg)' : 'transparent',
                  color: location.pathname === item.path ? 'var(--color-accent)' : 'inherit',
                  fontWeight: location.pathname === item.path ? 600 : 400
                }}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </aside>
      <main className="flex-1">
        <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-6)' }}>
          <h1 style={{ fontSize: 'var(--font-size-2xl)' }}>{title}</h1>
        </div>
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
