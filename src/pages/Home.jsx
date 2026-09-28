import { useState, useEffect } from 'react';
import { collection, getDocs, query, limit, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';
import PromotionalCarousel from '../components/PromotionalCarousel';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch latest products, filter out sold ones, and limit to 12
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(25));
        const querySnapshot = await getDocs(q);
        const productsData = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(p => p.status !== 'sold')
          .slice(0, 12);
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
      <PromotionalCarousel />

      {/* Featured Products */}
      <section className="container" style={{ padding: 'var(--spacing-12) 0' }}>
        <h2 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--spacing-8)', textAlign: 'center' }}>New Arrivals</h2>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>Loading products...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 'var(--spacing-4)' }}>
            {products.map(product => (
              <div key={product.id}>
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
