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
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [brand, setBrand] = useState('');
  const [condition, setCondition] = useState('Good');
  const [category, setCategory] = useState('T-Shirts');
  const [imageUrl, setImageUrl] = useState('');
  
  // Promotional Form State
  const [isFeatured, setIsFeatured] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [promotionalText, setPromotionalText] = useState('');

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

  const resetForm = () => {
    setName('');
    setPrice('');
    setBrand('');
    setCondition('Good');
    setCategory('T-Shirts');
    setImageUrl('');
    setIsFeatured(false);
    setDiscountPercentage(0);
    setPromotionalText('');
    setEditingId(null);
  };

  const handleEditClick = (product) => {
    setEditingId(product.id);
    setName(product.name);
    setPrice(product.price);
    setBrand(product.brand);
    setCondition(product.condition || 'Good');
    setCategory(product.category || 'T-Shirts');
    setImageUrl(product.images && product.images[0] ? product.images[0] : '');
    setIsFeatured(product.isFeatured || false);
    setDiscountPercentage(product.discountPercentage || 0);
    setPromotionalText(product.promotionalText || '');
    setIsAdding(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const productData = {
        name,
        price: parseFloat(price),
        brand,
        condition,
        category,
        images: imageUrl ? [imageUrl] : [],
        isFeatured,
        discountPercentage: isFeatured ? parseFloat(discountPercentage) : 0,
        promotionalText: isFeatured ? promotionalText : '',
        stock: 1,
        status: 'active'
      };

      if (editingId) {
        await updateDoc(doc(db, 'products', editingId), productData);
      } else {
        await addDoc(collection(db, 'products'), {
          ...productData,
          createdAt: new Date(),
        });
      }
      
      setIsAdding(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error("Error saving product: ", error);
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

  // Calculate Sale Price for display
  const currentPrice = parseFloat(price) || 0;
  const currentDiscount = parseFloat(discountPercentage) || 0;
  const currentSalePrice = isFeatured && currentDiscount > 0 
    ? currentPrice - (currentPrice * currentDiscount / 100)
    : currentPrice;

  return (
    <AdminLayout title="Manage Products">
      <div className="flex justify-between items-center mb-6" style={{ marginBottom: 'var(--spacing-6)' }}>
        <p>Total Products: {products.length}</p>
        <Button onClick={() => {
          if (!isAdding) resetForm();
          setIsAdding(!isAdding);
        }}>
          {isAdding ? 'Cancel' : 'Add New Product'}
        </Button>
      </div>

      {isAdding && (
        <div className="card mb-6" style={{ padding: 'var(--spacing-6)', marginBottom: 'var(--spacing-6)' }}>
          <h3 style={{ marginBottom: 'var(--spacing-4)' }}>{editingId ? 'Edit Product' : 'Add New Product'}</h3>
          <form onSubmit={handleSaveProduct} className="flex flex-col gap-4">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
              <Input label="Product Name" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input label="Original Price (₱)" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
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
              
              <div style={{ gridColumn: '1 / -1' }}>
                <Input label="Image URL (paste link address here)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
              </div>
            </div>

            {/* Promotional Section */}
            <div style={{ padding: 'var(--spacing-4)', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', marginTop: 'var(--spacing-2)' }}>
              <h4 style={{ marginBottom: 'var(--spacing-3)' }}>Promotional Settings</h4>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-4)' }}>
                <input 
                  type="checkbox" 
                  id="isFeatured" 
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
                />
                <label htmlFor="isFeatured" style={{ fontWeight: 500, cursor: 'pointer' }}>Featured Product (Show in Carousel)</label>
              </div>

              {isFeatured && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
                  <Input 
                    label="Discount Percentage (%)" 
                    type="number" 
                    min="0" 
                    max="100" 
                    value={discountPercentage} 
                    onChange={(e) => setDiscountPercentage(e.target.value)} 
                  />
                  <Input 
                    label="Promotional Text (Optional)" 
                    value={promotionalText} 
                    onChange={(e) => setPromotionalText(e.target.value)} 
                    placeholder="e.g. Limited Time Offer"
                  />
                  
                  <div style={{ gridColumn: '1 / -1', padding: 'var(--spacing-3)', backgroundColor: 'var(--color-primary-light, #e0f2fe)', color: 'var(--color-primary)', borderRadius: 'var(--radius-sm)' }}>
                    <strong>Calculated Sale Price: </strong> 
                    ₱{currentSalePrice.toLocaleString(undefined, {minimumFractionDigits: 0})}
                  </div>
                </div>
              )}
            </div>

            <Button type="submit" isLoading={loading} style={{ alignSelf: 'flex-start', marginTop: 'var(--spacing-2)' }}>
              {editingId ? 'Update Product' : 'Save Product'}
            </Button>
          </form>
        </div>
      )}

      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
              <th style={{ padding: 'var(--spacing-3)' }}>Name</th>
              <th style={{ padding: 'var(--spacing-3)' }}>Original Price</th>
              <th style={{ padding: 'var(--spacing-3)' }}>Status</th>
              <th style={{ padding: 'var(--spacing-3)' }}>Category</th>
              <th style={{ padding: 'var(--spacing-3)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: 'var(--spacing-3)' }}>{product.name}</td>
                <td style={{ padding: 'var(--spacing-3)' }}>₱{(product.price || 0).toLocaleString()}</td>
                <td style={{ padding: 'var(--spacing-3)' }}>
                  {product.isFeatured ? (
                    <span style={{ backgroundColor: 'var(--color-accent)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>
                      Featured {product.discountPercentage ? `(-${product.discountPercentage}%)` : ''}
                    </span>
                  ) : 'Standard'}
                </td>
                <td style={{ padding: 'var(--spacing-3)' }}>{product.category}</td>
                <td style={{ padding: 'var(--spacing-3)' }}>
                  <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                    <Button variant="outline" style={{ padding: 'var(--spacing-1) var(--spacing-2)', fontSize: 'var(--font-size-xs)' }} onClick={() => handleEditClick(product)}>
                      Edit
                    </Button>
                    <Button variant="outline" style={{ padding: 'var(--spacing-1) var(--spacing-2)', fontSize: 'var(--font-size-xs)', color: 'var(--color-error)', borderColor: 'var(--color-error)' }} onClick={() => handleDelete(product.id)}>
                      Delete
                    </Button>
                  </div>
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
