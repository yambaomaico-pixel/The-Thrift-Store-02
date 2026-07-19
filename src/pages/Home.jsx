import { useState, useEffect } from 'react';
import { collection, getDocs, query, limit, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch latest 8 products
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(8));
        const querySnapshot = await getDocs(q);
        const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section style={{ backgroundColor: 'var(--color-accent)', color: 'white', padding: 'var(--spacing-16) 0', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--spacing-4)' }}>Discover Unique Sustainable Fashion</h1>
          <p style={{ fontSize: 'var(--font-size-lg)', opacity: 0.9, marginBottom: 'var(--spacing-8)' }}>Shop pre-loved styles and reduce your carbon footprint.</p>
          <button className="btn btn-outline" style={{ color: 'white', borderColor: 'white' }}>Shop Now</button>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container" style={{ padding: 'var(--spacing-12) 0' }}>
        <h2 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--spacing-8)', textAlign: 'center' }}>New Arrivals</h2>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>Loading products...</div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-6)', justifyContent: 'center' }}>
            {products.map(product => (
              <div key={product.id} style={{ width: '250px', flexGrow: 0, flexShrink: 0 }}>
                <ProductCard product={product} />
              </div>
            ))}
            {products.length === 0 && (
              <p style={{ width: '100%', textAlign: 'center', color: 'var(--color-text-secondary)' }}>No products found. Admin needs to add some!</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
export default Home;
