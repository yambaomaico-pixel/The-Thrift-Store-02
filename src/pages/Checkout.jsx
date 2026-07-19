import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Checkout = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  // Form state
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [contact, setContact] = useState('');

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, `users/${currentUser.uid}/cart`));
        const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCartItems(items);
        if (items.length === 0) navigate('/cart');
      } catch (error) {
        console.error("Error fetching cart for checkout:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [currentUser, navigate]);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 5.00;
  const total = subtotal + shipping;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setPlacingOrder(true);
    try {
      // 1. Create order document
      const orderRef = await addDoc(collection(db, 'orders'), {
        userId: currentUser.uid,
        customerName: currentUser.fullName || currentUser.email,
        items: cartItems,
        shippingAddress: { address, city, zip },
        contactNumber: contact,
        totalAmount: total,
        shippingFee: shipping,
        paymentMethod: 'COD',
        status: 'Pending',
        createdAt: new Date()
      });

      // 2. Clear user's cart
      for (const item of cartItems) {
        await deleteDoc(doc(db, `users/${currentUser.uid}/cart`, item.id));
      }

      alert('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      console.error("Error placing order:", error);
      alert('Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) return <div className="container" style={{ padding: 'var(--spacing-8) 0', textAlign: 'center' }}>Loading checkout...</div>;

  return (
    <div className="container" style={{ padding: 'var(--spacing-8) 0' }}>
      <h1 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--spacing-8)' }}>Checkout</h1>
      
      <div className="flex gap-8 flex-col" style={{ md: { flexDirection: 'row' } }}>
        <div style={{ flex: 2 }}>
          <div className="card" style={{ padding: 'var(--spacing-6)' }}>
            <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-4)' }}>Shipping Information</h2>
            <form id="checkout-form" onSubmit={handlePlaceOrder} className="flex flex-col gap-4">
              <Input label="Street Address" value={address} onChange={(e) => setAddress(e.target.value)} required />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
                <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} required />
                <Input label="ZIP / Postal Code" value={zip} onChange={(e) => setZip(e.target.value)} required />
              </div>
              <Input label="Contact Number" type="tel" value={contact} onChange={(e) => setContact(e.target.value)} required />
              
              <div style={{ marginTop: 'var(--spacing-4)' }}>
                <h3 style={{ fontSize: 'var(--font-size-base)', marginBottom: 'var(--spacing-2)' }}>Payment Method</h3>
                <div style={{ padding: 'var(--spacing-3)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-bg)' }}>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked readOnly /> 
                    <span>Cash on Delivery (COD)</span>
                  </label>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div className="card" style={{ padding: 'var(--spacing-6)' }}>
            <h2 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-4)' }}>Order Summary</h2>
            <div className="flex flex-col gap-4 mb-6">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between" style={{ fontSize: 'var(--font-size-sm)' }}>
                  <span>{item.quantity}x {item.name}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--spacing-4)', marginBottom: 'var(--spacing-6)' }}>
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mt-4" style={{ fontWeight: 'bold', fontSize: 'var(--font-size-lg)' }}>
                <span>Total</span>
                <span style={{ color: 'var(--color-accent)' }}>${total.toFixed(2)}</span>
              </div>
            </div>
            <Button type="submit" form="checkout-form" className="w-full" isLoading={placingOrder}>
              Place Order
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
