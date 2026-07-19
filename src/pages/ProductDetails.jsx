import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, getDocs, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.log("No such product!");
          navigate('/shop');
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleAddToCart = async () => {
    if (!currentUser) {
      alert("Please log in to add items to cart.");
      navigate('/login');
      return;
    }
    
    try {
      const cartRef = doc(db, `users/${currentUser.uid}/cart`, product.id);
      const cartSnap = await getDoc(cartRef);
      
      if (cartSnap.exists()) {
        const currentQty = cartSnap.data().quantity || 1;
        await setDoc(cartRef, { quantity: currentQty + 1 }, { merge: true });
      } else {
        await setDoc(cartRef, {
          name: product.name,
          price: product.price,
          image: product.images?.[0] || 'https://via.placeholder.com/80',
          quantity: 1,
          addedAt: new Date()
        });
      }
      alert("Added to cart!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add to cart.");
    }
  };

  if (loading) {
    return <div className="container" style={{ padding: 'var(--spacing-8) 0', textAlign: 'center' }}>Loading product details...</div>;
  }

  if (!product) return null;

  return (
    <div className="container" style={{ padding: 'var(--spacing-12) 0' }}>
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 'var(--spacing-8)' }}>
        
        {/* Product Image Gallery */}
        <div style={{ flex: '1 1 300px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
          <div style={{ width: '100%', maxWidth: '400px', position: 'relative', paddingBottom: '133.33%', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
            <img 
              src={product.images?.[0] || 'https://via.placeholder.com/600x800?text=No+Image'} 
              alt={product.name}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>

        {/* Product Info */}
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
          <div>
            <p style={{ color: 'var(--color-text-secondary)', fontWeight: 600, marginBottom: 'var(--spacing-2)' }}>{product.brand}</p>
            <h1 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--spacing-2)' }}>{product.name}</h1>
            <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', color: 'var(--color-accent)' }}>${product.price?.toFixed(2)}</p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-4)', fontSize: 'var(--font-size-sm)', flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Condition:</span>
            <span style={{ fontWeight: 500 }}>{product.condition}</span>
            <span style={{ color: 'var(--color-text-secondary)' }}>Category:</span>
            <span style={{ fontWeight: 500 }}>{product.category}</span>
          </div>

          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--spacing-6)' }}>
            <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-2)' }}>Description</h3>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              {product.description || "No description provided for this item."}
            </p>
          </div>

          <div style={{ marginTop: 'auto' }}>
            <Button size="lg" className="w-full" style={{ padding: 'var(--spacing-3)' }} onClick={handleAddToCart}>
              Add to Cart
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetails;
