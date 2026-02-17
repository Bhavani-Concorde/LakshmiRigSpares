import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../services/api';
import { processPayment } from '../services/razorpay';
import { FiMapPin, FiCreditCard, FiTruck, FiShoppingBag, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Checkout.css';

const Checkout = () => {
    const { cartItems, getCartTotal, getCartCount, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('online');

    const [shippingAddress, setShippingAddress] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        pincode: user?.address?.pincode || '',
        country: user?.address?.country || 'India'
    });

    useEffect(() => {
        if (cartItems.length === 0) {
            navigate('/cart');
        }
    }, [cartItems, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setShippingAddress(prev => ({ ...prev, [name]: value }));
    };

    const calculateFinalTotal = () => {
        const subtotal = getCartTotal();
        const shipping = subtotal > 10000 ? 0 : 500;
        const tax = Math.round(subtotal * 0.18);
        return subtotal + shipping + tax;
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        // Basic Validation
        const required = ['name', 'phone', 'street', 'city', 'state', 'pincode'];
        for (const field of required) {
            if (!shippingAddress[field]) {
                toast.error(`Please provide ${field}`);
                return;
            }
        }

        setLoading(true);
        try {
            const orderData = {
                items: cartItems.map(item => ({
                    product: item._id,
                    quantity: item.quantity
                })),
                shippingAddress,
                paymentMethod: paymentMethod === 'online' ? 'razorpay' : 'cash',
                notes: 'Order placed via website checkout'
            };

            const { data: response } = await ordersAPI.create(orderData);

            if (response.success) {
                const createdOrder = response.data;

                if (paymentMethod === 'online') {
                    // Trigger Razorpay
                    await processPayment({
                        amount: createdOrder.total,
                        orderId: createdOrder._id,
                        user: user,
                        onSuccess: () => {
                            clearCart();
                            navigate('/my-orders', { state: { orderSuccess: true, orderId: createdOrder.orderId } });
                        },
                        onError: () => {
                            toast.error('Order placed but payment failed. You can pay from your orders page.');
                            clearCart();
                            navigate('/my-orders');
                        }
                    });
                } else {
                    // COD Success
                    toast.success('Order placed successfully (Cash on Delivery)');
                    clearCart();
                    navigate('/my-orders', { state: { orderSuccess: true, orderId: createdOrder.orderId } });
                }
            }
        } catch (error) {
            console.error('Checkout error:', error);
            toast.error(error.response?.data?.message || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="checkout-page">
            <div className="container">
                <h1 className="page-title">Checkout</h1>

                <form onSubmit={handlePlaceOrder} className="checkout-grid">
                    <div className="checkout-main">
                        {/* Shipping Details */}
                        <section className="checkout-section card">
                            <h2 className="checkout-section-title"><FiMapPin /> Shipping Details</h2>
                            <div className="checkout-form-grid">
                                <div className="form-group">
                                    <label className="form-label">Full Name *</label>
                                    <input
                                        type="text" name="name" value={shippingAddress.name}
                                        onChange={handleInputChange} className="form-input" required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Phone Number *</label>
                                    <input
                                        type="tel" name="phone" value={shippingAddress.phone}
                                        onChange={handleInputChange} className="form-input" required
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label className="form-label">Street Address *</label>
                                    <input
                                        type="text" name="street" value={shippingAddress.street}
                                        onChange={handleInputChange} className="form-input" required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">City *</label>
                                    <input
                                        type="text" name="city" value={shippingAddress.city}
                                        onChange={handleInputChange} className="form-input" required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">State *</label>
                                    <input
                                        type="text" name="state" value={shippingAddress.state}
                                        onChange={handleInputChange} className="form-input" required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Pincode *</label>
                                    <input
                                        type="text" name="pincode" value={shippingAddress.pincode}
                                        onChange={handleInputChange} className="form-input" required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Country</label>
                                    <input
                                        type="text" name="country" value={shippingAddress.country}
                                        onChange={handleInputChange} className="form-input"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Payment Method */}
                        <section className="checkout-section card">
                            <h2 className="checkout-section-title"><FiCreditCard /> Payment Method</h2>
                            <div className="payment-methods">
                                <div
                                    className={`payment-method-option ${paymentMethod === 'online' ? 'selected' : ''}`}
                                    onClick={() => setPaymentMethod('online')}
                                >
                                    <div className="payment-method-icon"><FiCreditCard /></div>
                                    <div className="payment-method-info">
                                        <div className="payment-method-name">Online Payment</div>
                                        <div className="payment-method-desc">Pay securely via Razorpay (UPI, Card, NetBanking)</div>
                                    </div>
                                    {paymentMethod === 'online' && <FiCheckCircle style={{ color: 'var(--primary-500)' }} />}
                                </div>

                                <div
                                    className={`payment-method-option ${paymentMethod === 'cod' ? 'selected' : ''}`}
                                    onClick={() => setPaymentMethod('cod')}
                                >
                                    <div className="payment-method-icon"><FiTruck /></div>
                                    <div className="payment-method-info">
                                        <div className="payment-method-name">Cash on Delivery (COD)</div>
                                        <div className="payment-method-desc">Pay when your order is delivered</div>
                                    </div>
                                    {paymentMethod === 'cod' && <FiCheckCircle style={{ color: 'var(--primary-500)' }} />}
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="checkout-summary card">
                        <h2 className="summary-title"><FiShoppingBag /> Order Summary</h2>

                        <div className="order-items-preview">
                            {cartItems.map((item, idx) => (
                                <div key={idx} className="order-item-preview">
                                    <span>
                                        <span className="order-item-qty">{item.quantity}x</span>
                                        {item.name}
                                    </span>
                                    <span>₹{((item.discountPrice || item.price) * item.quantity).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>

                        <div className="checkout-total-row">
                            <span>Subtotal</span>
                            <span>₹{getCartTotal().toLocaleString()}</span>
                        </div>
                        <div className="checkout-total-row">
                            <span>Shipping</span>
                            <span style={{ color: 'var(--success-500)' }}>{getCartTotal() > 10000 ? 'Free' : '₹500'}</span>
                        </div>
                        <div className="checkout-total-row">
                            <span>GST (18%)</span>
                            <span>₹{Math.round(getCartTotal() * 0.18).toLocaleString()}</span>
                        </div>

                        <div className="checkout-total-row grand-total">
                            <span>Total Payable</span>
                            <span>₹{calculateFinalTotal().toLocaleString()}</span>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg place-order-btn"
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : (paymentMethod === 'online' ? 'Pay Now & Place Order' : 'Place Order (COD)')}
                        </button>

                        <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--dark-400)', textAlign: 'center' }}>
                            By placing your order, you agree to our Terms of Service and Privacy Policy.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Checkout;
