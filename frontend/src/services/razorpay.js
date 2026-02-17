import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Load Razorpay script dynamically
 */
export const loadRazorpay = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
            resolve(true);
        };
        script.onerror = () => {
            resolve(false);
        };
        document.body.appendChild(script);
    });
};

/**
 * Handle Payment flow
 * @param {Object} options - { amount, orderId, bookingId, onSuccess, onError }
 */
export const processPayment = async ({ amount, orderId, bookingId, user, onSuccess, onError }) => {
    try {
        const res = await loadRazorpay();

        if (!res) {
            toast.error('Razorpay SDK failed to load. Are you online?');
            return;
        }

        // 1. Create order on backend
        const token = localStorage.getItem('token');
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };

        const { data: orderResponse } = await axios.post(`${API_URL}/payments/create-order`, {
            amount,
            orderId,
            bookingId
        }, config);

        if (!orderResponse.success) {
            toast.error('Server error. Please try again.');
            return;
        }

        const { amount: rAmount, id: rOrderId, currency } = orderResponse.order;

        // 2. Open Razorpay Checkout
        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_AbCdEf123456',
            amount: rAmount,
            currency: currency,
            name: "Sri Lakshmi Rig Spares",
            description: orderId ? `Payment for Order #${orderId}` : `Payment for Booking`,
            order_id: rOrderId,
            handler: async (response) => {
                try {
                    // 3. Verify payment on backend
                    const { data: verifyResponse } = await axios.post(`${API_URL}/payments/verify`, {
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                    }, config);

                    if (verifyResponse.success) {
                        toast.success('Payment Successful!');
                        if (onSuccess) onSuccess(verifyResponse);
                    } else {
                        toast.error('Payment Verification Failed');
                        if (onError) onError(verifyResponse);
                    }
                } catch (err) {
                    console.error('Verification error:', err);
                    toast.error('Error verifying payment');
                    if (onError) onError(err);
                }
            },
            prefill: {
                name: user?.name || '',
                email: user?.email || '',
                contact: user?.phone || '',
            },
            theme: {
                color: "#1a237e", // Industrial Blue
            },
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();

        paymentObject.on('payment.failed', function (response) {
            toast.error(response.error.description);
            if (onError) onError(response.error);
        });

    } catch (error) {
        console.error('Payment error:', error);
        toast.error('Could not initiate payment');
        if (onError) onError(error);
    }
};
