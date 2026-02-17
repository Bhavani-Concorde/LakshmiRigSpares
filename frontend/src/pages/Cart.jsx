import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FiTrash2, FiPlus, FiMinus, FiShoppingCart, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Cart.css';

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, getCartTotal, getCartCount } = useCart();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleCheckout = () => {
        if (!isAuthenticated) {
            toast.error('Please login to continue to checkout');
            navigate('/login', { state: { from: '/cart' } });
            return;
        }
        // For now, redirect to a checkout page (which we might need to create)
        // or just show a message that checkout is coming soon
        toast.success('Proceeding to checkout...');
        navigate('/checkout');
    };

    if (cartItems.length === 0) {
        return (
            <div className="cart-page">
                <div className="container">
                    <div className="empty-cart card">
                        <FiShoppingCart className="empty-cart-icon" />
                        <h2>Your cart is empty</h2>
                        <p>Looks like you haven't added anything to your cart yet.</p>
                        <Link to="/products" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
                            Browse Products
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <div className="container">
                <h1 className="page-title">Shopping Cart ({getCartCount()} items)</h1>

                <div className="cart-container">
                    <div className="cart-items-section">
                        {cartItems.map((item) => (
                            <div key={item._id} className="cart-item-card">
                                <div className="cart-item-image">
                                    <img
                                        src={item.images?.[0]?.url || 'https://via.placeholder.com/100?text=Product'}
                                        alt={item.name}
                                    />
                                </div>
                                <div className="cart-item-info">
                                    <Link to={`/products/${item.slug}`} className="cart-item-name">
                                        {item.name}
                                    </Link>
                                    <p className="cart-item-category">{item.category}</p>
                                    <div className="cart-item-price">
                                        {item.discountPrice ? (
                                            <>
                                                <span style={{ color: 'var(--primary-600)' }}>₹{item.discountPrice.toLocaleString()}</span>
                                                <span style={{ textDecoration: 'line-through', color: 'var(--dark-300)', marginLeft: '0.5rem', fontSize: '0.9rem' }}>
                                                    ₹{item.price.toLocaleString()}
                                                </span>
                                            </>
                                        ) : (
                                            <span>₹{item.price.toLocaleString()}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="cart-item-qty">
                                    <button
                                        className="qty-btn"
                                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                        disabled={item.quantity <= 1}
                                    >
                                        <FiMinus />
                                    </button>
                                    <span style={{ width: '30px', textAlign: 'center', fontWeight: 'bold' }}>{item.quantity}</span>
                                    <button
                                        className="qty-btn"
                                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                        disabled={item.quantity >= item.stock}
                                    >
                                        <FiPlus />
                                    </button>
                                </div>

                                <div className="cart-item-total" style={{ width: '100px', textAlign: 'right', fontWeight: 'bold' }}>
                                    ₹{((item.discountPrice || item.price) * item.quantity).toLocaleString()}
                                </div>

                                <button className="remove-btn" onClick={() => removeFromCart(item._id)}>
                                    <FiTrash2 />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="cart-summary-card card">
                        <h2 className="summary-title">Order Summary</h2>
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>₹{getCartTotal().toLocaleString()}</span>
                        </div>
                        <div className="summary-row">
                            <span>Shipping</span>
                            <span style={{ color: 'var(--success-600)' }}>{getCartTotal() > 10000 ? 'Free' : '₹500'}</span>
                        </div>
                        <div className="summary-row">
                            <span>GST (18%)</span>
                            <span>₹{(Math.round(getCartTotal() * 0.18)).toLocaleString()}</span>
                        </div>
                        <div className="summary-row total">
                            <span>Total</span>
                            <span>₹{(getCartTotal() + (getCartTotal() > 10000 ? 0 : 500) + Math.round(getCartTotal() * 0.18)).toLocaleString()}</span>
                        </div>

                        <button className="btn btn-primary btn-lg checkout-btn" onClick={handleCheckout}>
                            Checkout <FiArrowRight style={{ marginLeft: '0.5rem' }} />
                        </button>

                        <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--dark-400)', textAlign: 'center' }}>
                            Prices are inclusive of all taxes. Free shipping on orders above ₹10,000.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
