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
      <Link to={`/product/${product.id}`} className="card-image-container">
        <img
          src={product.images?.[0] || 'https://via.placeholder.com/300x400?text=No+Image'}
          alt={product.name}
          className="card-image"
        />
      </Link>
      <div className="card-content">
        <div className="flex justify-between items-start mb-2">
          <h3 className="card-title">
            <Link to={`/product/${product.id}`}>{product.name}</Link>
          </h3>
          <span className="card-price">₱{product.price?.toFixed(2)}</span>
        </div>
        <p className="card-meta">
          {product.brand} &bull; {product.condition}
        </p>
        <Button variant="primary" className="w-full" onClick={handleAddToCart}>Add to Cart</Button>
      </div>
    </div>
  );
};

export default ProductCard;
