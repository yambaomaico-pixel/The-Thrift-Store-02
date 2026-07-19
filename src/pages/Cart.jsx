import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';

const Cart = () => {
  const { currentUser } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCart = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    try {
      const querySnapshot = await getDocs(collection(db, `users/${currentUser.uid}/cart`));
      const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCartItems(items);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [currentUser]);

  const handleRemove = async (productId) => {
    try {
      await deleteDoc(doc(db, `users/${currentUser.uid}/cart`, productId));
      setCartItems(cartItems.filter(item => item.id !== productId));
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const handleQuantity = async (productId, currentQty, change) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;
    try {
      await updateDoc(doc(db, `users/${currentUser.uid}/cart`, productId), { quantity: newQty });
      setCartItems(cartItems.map(item => item.id === productId ? { ...item, quantity: newQty } : item));
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 0 ? 5.00 : 0;
  const total = subtotal + shipping;

  if (loading) return <div className="container" style={{ padding: 'var(--spacing-8) 0', textAlign: 'center' }}>Loading cart...</div>;

  if (!currentUser) {
    return (
      <div className="container" style={{ padding: 'var(--spacing-12) 0', textAlign: 'center' }}>
        <h2 style={{ marginBottom: 'var(--spacing-4)' }}>Your Cart</h2>
        <p style={{ marginBottom: 'var(--spacing-6)', color: 'var(--color-text-secondary)' }}>Please log in to view your cart.</p>
        <Link to="/login"><Button>Log In</Button></Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: 'var(--spacing-8) 0' }}>
      <h1 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--spacing-8)' }}>Shopping Cart</h1>
      
      {cartItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-12) 0', color: 'var(--color-text-secondary)' }}>
          <p style={{ marginBottom: 'var(--spacing-4)' }}>Your cart is empty.</p>
          <Link to="/shop"><Button variant="outline">Continue Shopping</Button></Link>
        </div>
      ) : (
        <div className="flex gap-8 flex-col" style={{ md: { flexDirection: 'row' } }}>
          <div style={{ flex: 2 }}>
            <div className="card">
              {cartItems.map(item => (
                <div key={item.id} className="flex gap-4 items-center" style={{ padding: 'var(--spacing-4)', borderBottom: '1px solid var(--color-border)' }}>
                  <img src={item.image} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontWeight: 600 }}><Link to={`/product/${item.id}`}>{item.name}</Link></h3>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>${item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" style={{ padding: 'var(--spacing-1) var(--spacing-2)' }} onClick={() => handleQuantity(item.id, item.quantity, -1)}>-</Button>
                    <span>{item.quantity}</span>
                    <Button variant="outline" style={{ padding: 'var(--spacing-1) var(--spacing-2)' }} onClick={() => handleQuantity(item.id, item.quantity, 1)}>+</Button>
                  </div>
                  <div style={{ fontWeight: 'bold', width: '80px', textAlign: 'right' }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                  <Button variant="outline" style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)', padding: 'var(--spacing-1) var(--spacing-2)' }} onClick={() => handleRemove(item.id)}>Remove</Button>
                </div>
              ))}
            </div>
          </div>
          
          <div style={{ flex: 1 }}>
            <div className="card" style={{ padding: 'var(--spacing-6)' }}>
              <h2 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-4)' }}>Order Summary</h2>
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-4" style={{ paddingBottom: 'var(--spacing-4)', borderBottom: '1px solid var(--color-border)' }}>
                <span>Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-6" style={{ fontWeight: 'bold', fontSize: 'var(--font-size-lg)' }}>
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <Button className="w-full" onClick={() => navigate('/checkout')}>Proceed to Checkout</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
