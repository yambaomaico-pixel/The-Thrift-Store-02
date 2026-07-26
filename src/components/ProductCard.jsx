import { Link, useNavigate } from 'react-router-dom';
import Button from './ui/Button';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

import { toast } from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Add to cart button clicked for product:", product.id);
    
    if (!currentUser) {
      toast.error("Please log in to add items to cart.");
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
      toast.success(`${product.name} added to cart!`, {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart.");
    }
  };

  return (
    <div className="card flex flex-col h-full">
      <Link to={`/product/${product.id}`} style={{ display: 'block', position: 'relative', paddingTop: '133%', overflow: 'hidden' }}>
        <img
          src={product.images?.[0] || 'https://via.placeholder.com/300x400?text=No+Image'}
          alt={product.name}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </Link>
      <div className="flex flex-col flex-1" style={{ padding: 'var(--spacing-4)' }}>
        <div className="flex justify-between items-start mb-2">
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, margin: 0 }}>
            <Link to={`/product/${product.id}`}>{product.name}</Link>
          </h3>
          <span style={{ fontWeight: 'bold', color: 'var(--color-accent)' }}>${product.price?.toFixed(2)}</span>
        </div>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-4)', flex: 1 }}>
          {product.brand} &bull; {product.condition}
        </p>
        <Button variant="primary" className="w-full" onClick={handleAddToCart}>Add to Cart</Button>
      </div>
    </div>
  );
};

export default ProductCard;
