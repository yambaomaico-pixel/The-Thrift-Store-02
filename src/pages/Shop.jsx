import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import ProductCard from '../components/ProductCard';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters state
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
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

  // Filtering Logic
  let filteredProducts = products.filter(product => {
    if (selectedCategory !== 'All' && product.category !== selectedCategory) return false;
    if (selectedCondition !== 'All' && product.condition !== selectedCondition) return false;
    return true;
  });

  // Sorting Logic
  if (sortBy === 'price-asc') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-desc') {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'newest') {
    filteredProducts.sort((a, b) => {
      const dateA = a.createdAt?.seconds || 0;
      const dateB = b.createdAt?.seconds || 0;
      return dateB - dateA;
    });
  }

  const categories = ['All', 'T-Shirts', 'Hoodies', 'Jackets', 'Pants', 'Shorts', 'Dresses', 'Shoes', 'Accessories'];
  const conditions = ['All', 'Excellent', 'Good', 'Fair'];

  return (
    <div className="container flex gap-8" style={{ padding: 'var(--spacing-8) 0' }}>
      {/* Sidebar Filters */}
      <aside style={{ width: '250px', flexShrink: 0 }}>
        <h2 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-6)' }}>Filters</h2>
        
        <div style={{ marginBottom: 'var(--spacing-6)' }}>
          <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginBottom: 'var(--spacing-2)' }}>Category</h3>
          <div className="flex flex-col gap-2">
            {categories.map(cat => (
              <label key={cat} className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="category" 
                  checked={selectedCategory === cat} 
                  onChange={() => setSelectedCategory(cat)} 
                />
                <span style={{ fontSize: 'var(--font-size-sm)' }}>{cat}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginBottom: 'var(--spacing-2)' }}>Condition</h3>
          <div className="flex flex-col gap-2">
            {conditions.map(cond => (
              <label key={cond} className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="condition" 
                  checked={selectedCondition === cond} 
                  onChange={() => setSelectedCondition(cond)} 
                />
                <span style={{ fontSize: 'var(--font-size-sm)' }}>{cond}</span>
              </label>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Product Grid */}
      <main className="flex-1">
        <div className="flex justify-between items-center mb-6" style={{ marginBottom: 'var(--spacing-6)' }}>
          <h1 style={{ fontSize: 'var(--font-size-2xl)' }}>Shop All</h1>
          <select 
            className="input" 
            style={{ width: 'auto', padding: 'var(--spacing-1) var(--spacing-2)' }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Sort by: Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>

        {loading ? (
          <div>Loading products...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 'var(--spacing-6)' }}>
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
            {filteredProducts.length === 0 && (
              <p style={{ gridColumn: '1 / -1', color: 'var(--color-text-secondary)' }}>No products match your filters.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Shop;
