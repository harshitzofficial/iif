import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, Package, ShoppingBag, ShoppingCart, CreditCard, ArrowRight } from 'lucide-react';
import API_URL from '../config';
import { getCartItems, getCartTotals, updateQuantity as updateCartQuantity, removeFromCart as removeCartItem } from '../utils/cartStore';

export default function CartPage() {
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCart = () => {
    setCartData({
      items: getCartItems(),
      totals: getCartTotals()
    });
    setLoading(false);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = (productId, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    
    updateCartQuantity(productId, newQty);
    fetchCart();
  };

  const removeItem = (productId) => {
    removeCartItem(productId);
    fetchCart();
  };

  if (loading) {
    return (
      <div className="animate-fade-in-up">
        <div style={{ height: '50px', width: '250px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '3rem', animation: 'pulse 2s infinite' }}></div>
        <div className="cart-container">
          <div className="cart-items">
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{ height: '160px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-xl)', animation: 'pulse 2s infinite', border: '1px solid rgba(255,255,255,0.05)' }}></div>
            ))}
          </div>
          <div style={{ height: '400px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-xl)', animation: 'pulse 2s infinite', border: '1px solid rgba(255,255,255,0.05)' }}></div>
        </div>
      </div>
    );
  }

  const { items, totals } = cartData;

  if (items.length === 0) {
    return (
      <div className="empty-cart animate-scale-in" style={{ padding: '8rem 2rem', background: 'var(--color-bg-glass)', border: '1px solid var(--color-border)', backdropFilter: 'blur(12px)', boxShadow: 'var(--shadow-glass)' }}>
        <div style={{ display: 'inline-block', padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '50%', marginBottom: '2rem', boxShadow: 'inset 0 0 30px rgba(139, 92, 246, 0.1), 0 0 30px rgba(139, 92, 246, 0.1)' }}>
          <ShoppingBag size={80} color="var(--color-primary)" style={{ opacity: 0.9 }} />
        </div>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', letterSpacing: '-1px', fontWeight: '800' }}>Your cart is empty</h2>
        <p className="detail-desc" style={{ marginBottom: '3rem', fontSize: '1.15rem', maxWidth: '450px', margin: '0 auto 3rem' }}>
          Looks like you haven't added anything to your cart yet. Discover our premium collection of curated assets.
        </p>
        <Link to="/products" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '1.2rem 2.5rem' }}>
          <ShoppingCart size={20} /> Browse Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <ShoppingCart color="var(--color-primary)" size={36} /> Your Cart
      </h1>
      <div className="cart-container">
        <div className="cart-items">
          {items.map((item, index) => (
            <div key={item.product.id} className="cart-item animate-fade-in-up" style={{ animationDelay: `${index * 0.08}s` }}>
              <div style={{ position: 'relative' }}>
                {item.product.imageUrl ? (
                  <img src={item.product.imageUrl} alt={item.product.name} className="cart-item-image" />
                ) : (
                  <div className="cart-item-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Package size={40} color="#94a3b8" />
                  </div>
                )}
              </div>
              
              <div className="cart-item-info">
                <Link to={`/product/${item.product.id}`} className="cart-item-name" style={{ display: 'block', transition: 'color 0.3s ease' }} onMouseOver={(e) => e.target.style.color = 'var(--color-primary)'} onMouseOut={(e) => e.target.style.color = 'var(--color-text)'}>
                  {item.product.name}
                </Link>
                <div className="cart-item-price" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>₹{item.product.price.toFixed(2)} each</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', background: 'rgba(0,0,0,0.2)', padding: '0.5rem 0.75rem', borderRadius: '8px', display: 'inline-block', border: '1px solid rgba(255,255,255,0.05)' }}>
                  + ₹{item.product.securityDeposit.toFixed(2)} Security
                  <span style={{ margin: '0 0.5rem', color: 'rgba(255,255,255,0.2)' }}>|</span>
                  + ₹{item.product.deliveryCharges.toFixed(2)} Delivery
                </div>
              </div>
              
              <div className="cart-item-actions">
                <button className="qty-btn" onClick={() => updateQuantity(item.product.id, item.quantity, -1)}>
                  <Minus size={16} />
                </button>
                <span style={{ width: '24px', textAlign: 'center', fontWeight: '700', fontSize: '1.1rem' }}>{item.quantity}</span>
                <button className="qty-btn" onClick={() => updateQuantity(item.product.id, item.quantity, 1)}>
                  <Plus size={16} />
                </button>
              </div>

              <div style={{ fontWeight: '800', width: '120px', textAlign: 'right', fontSize: '1.3rem', color: 'var(--color-text)' }}>
                ₹{((item.product.price + item.product.securityDeposit + item.product.deliveryCharges) * item.quantity).toFixed(2)}
              </div>

              <button className="remove-btn" onClick={() => removeItem(item.product.id)} title="Remove item" style={{ marginLeft: '1rem' }}>
                <Trash2 size={22} />
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
          <h2 className="summary-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CreditCard size={24} color="var(--color-primary)" /> Order Summary
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="fee-row">
              <span>Subtotal (Products)</span>
              <span>₹{totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="fee-row">
              <span>Total Security Deposit</span>
              <span>₹{totals.totalSecurityDeposit.toFixed(2)}</span>
            </div>
            <div className="fee-row">
              <span>Total Delivery Charges</span>
              <span>₹{totals.totalDeliveryCharges.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="fee-row total" style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <span>Grand Total</span>
            <span style={{ fontSize: '1.8rem', color: 'var(--color-success)', textShadow: '0 0 15px rgba(16, 185, 129, 0.4)' }}>
              ₹{totals.grandTotal.toFixed(2)}
            </span>
          </div>

          <button className="btn-primary" style={{ width: '100%', marginTop: '2.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', padding: '1.25rem', fontSize: '1.25rem' }}>
            Proceed to Checkout <ArrowRight size={20} />
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            Secure checkout powered by Stripe
          </div>
        </div>
      </div>
    </div>
  );
}
