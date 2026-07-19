import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import AdminLayout from '../../components/AdminLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [brand, setBrand] = useState('');
  const [condition, setCondition] = useState('Good');
  const [category, setCategory] = useState('T-Shirts');

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'products'), {
        name,
        price: parseFloat(price),
        brand,
        condition,
        category,
        createdAt: new Date(),
        images: [], // Placeholder
        stock: 1,
        status: 'active'
      });
      setIsAdding(false);
      setName(''); setPrice(''); setBrand('');
      fetchProducts();
    } catch (error) {
      console.error("Error adding product: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await deleteDoc(doc(db, 'products', id));
      fetchProducts();
    }
  };

  return (
    <AdminLayout title="Manage Products">
      <div className="flex justify-between items-center mb-6" style={{ marginBottom: 'var(--spacing-6)' }}>
        <p>Total Products: {products.length}</p>
        <Button onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? 'Cancel' : 'Add New Product'}
        </Button>
      </div>

      {isAdding && (
        <div className="card mb-6" style={{ padding: 'var(--spacing-6)', marginBottom: 'var(--spacing-6)' }}>
          <h3 style={{ marginBottom: 'var(--spacing-4)' }}>Add New Product</h3>
          <form onSubmit={handleAddProduct} className="flex flex-col gap-4">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
              <Input label="Product Name" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input label="Price ($)" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
              <Input label="Brand" value={brand} onChange={(e) => setBrand(e.target.value)} required />
              
              <div className="flex flex-col gap-1">
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>Category</label>
                <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {['T-Shirts', 'Hoodies', 'Jackets', 'Pants', 'Shorts', 'Dresses', 'Shoes', 'Accessories'].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>Condition</label>
                <select className="input" value={condition} onChange={(e) => setCondition(e.target.value)}>
                  {['Excellent', 'Good', 'Fair'].map(cond => (
                    <option key={cond} value={cond}>{cond}</option>
                  ))}
                </select>
              </div>
            </div>
            <Button type="submit" isLoading={loading} style={{ alignSelf: 'flex-start', marginTop: 'var(--spacing-2)' }}>Save Product</Button>
          </form>
        </div>
      )}

      <div className="card">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
              <th style={{ padding: 'var(--spacing-3)' }}>Name</th>
              <th style={{ padding: 'var(--spacing-3)' }}>Price</th>
              <th style={{ padding: 'var(--spacing-3)' }}>Category</th>
              <th style={{ padding: 'var(--spacing-3)' }}>Condition</th>
              <th style={{ padding: 'var(--spacing-3)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: 'var(--spacing-3)' }}>{product.name}</td>
                <td style={{ padding: 'var(--spacing-3)' }}>${product.price}</td>
                <td style={{ padding: 'var(--spacing-3)' }}>{product.category}</td>
                <td style={{ padding: 'var(--spacing-3)' }}>{product.condition}</td>
                <td style={{ padding: 'var(--spacing-3)' }}>
                  <Button variant="outline" style={{ padding: 'var(--spacing-1) var(--spacing-2)', fontSize: 'var(--font-size-xs)', color: 'var(--color-error)', borderColor: 'var(--color-error)' }} onClick={() => handleDelete(product.id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: 'var(--spacing-6)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default ManageProducts;
