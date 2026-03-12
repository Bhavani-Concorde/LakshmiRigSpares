const crypto = require('crypto');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const Booking = require('../models/Booking');

const isDev = process.env.NODE_ENV !== 'production';
const isPlaceholderKeys = () => {
    const keyId = process.env.RAZORPAY_KEY_ID || '';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
    // Check if keys are empty or still using the placeholder strings
    return !keyId || !keySecret ||
        keyId.includes('AbCdEf123456') ||
        keySecret.includes('xyz123456789abcdef');
};

/**
 * Create Razorpay Order
 * @route POST /api/payments/create-order
 */
exports.createOrder = async (req, res) => {
    try {
        const { amount, orderId, bookingId, currency = 'INR' } = req.body;

        if (!amount) {
            return res.status(400).json({ success: false, message: 'Amount is required' });
        }

        const amountInPaise = Math.round(amount * 100);
        let razorpayOrder;

        // DEV MODE with placeholder keys — skip Razorpay API entirely
        if (isDev && isPlaceholderKeys()) {
            console.warn('⚠️  DEV MODE: Simulating Razorpay order (placeholder API keys detected).');
            console.warn('   Replace RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env with real keys for production.');
            razorpayOrder = {
                id: `order_dev_${Date.now()}`,
                amount: amountInPaise,
                currency: currency,
                status: 'created',
                _devMode: true
            };
        } else {
            // REAL MODE — call Razorpay API
            const razorpay = require('../config/razorpay');
            const options = {
                amount: amountInPaise,
                currency,
                receipt: `receipt_${Date.now()}`,
            };

            razorpayOrder = await razorpay.orders.create(options);

            if (!razorpayOrder) {
                return res.status(500).json({ success: false, message: 'Failed to create Razorpay order' });
            }
        }

        // Save payment attempt in database
        const payment = new Payment({
            user: req.user._id,
            orderId: orderId || null,
            bookingId: bookingId || null,
            razorpayOrderId: razorpayOrder.id,
            amount: amount,
            currency: currency,
            status: 'created'
        });

        await payment.save();

        res.status(200).json({
            success: true,
            devMode: razorpayOrder._devMode || false,
            order: {
                id: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency
            }
        });
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
};

/**
 * Verify Razorpay Payment
 * @route POST /api/payments/verify
 */
exports.verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        // DEV MODE: Auto-verify simulated payments
        const isDevPayment = razorpay_order_id && razorpay_order_id.startsWith('order_dev_');

        if (isDevPayment && isDev) {
            console.warn('⚠️  DEV MODE: Auto-verifying simulated payment for order:', razorpay_order_id);

            const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });

            if (!payment) {
                return res.status(404).json({ success: false, message: 'Payment record not found' });
            }

            payment.razorpayPaymentId = razorpay_payment_id || `pay_dev_${Date.now()}`;
            payment.razorpaySignature = razorpay_signature || 'dev_signature';
            payment.status = 'captured';
            await payment.save();

            // Update associated Order or Booking
            if (payment.orderId) {
                await Order.findByIdAndUpdate(payment.orderId, {
                    paymentStatus: 'paid',
                    'paymentDetails.transactionId': payment.razorpayPaymentId,
                    'paymentDetails.paidAmount': payment.amount,
                    'paymentDetails.paidAt': new Date()
                });
            } else if (payment.bookingId) {
                await Booking.findByIdAndUpdate(payment.bookingId, {
                    paymentStatus: 'paid'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Payment verified successfully (DEV MODE)',
                paymentId: payment.razorpayPaymentId
            });
        }

        // PRODUCTION: Real signature verification
        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest('hex');

        if (razorpay_signature === expectedSign) {
            const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });

            if (!payment) {
                return res.status(404).json({ success: false, message: 'Payment record not found' });
            }

            payment.razorpayPaymentId = razorpay_payment_id;
            payment.razorpaySignature = razorpay_signature;
            payment.status = 'captured';
            await payment.save();

            if (payment.orderId) {
                await Order.findByIdAndUpdate(payment.orderId, {
                    paymentStatus: 'paid',
                    'paymentDetails.transactionId': razorpay_payment_id,
                    'paymentDetails.paidAmount': payment.amount,
                    'paymentDetails.paidAt': new Date()
                });
            } else if (payment.bookingId) {
                await Booking.findByIdAndUpdate(payment.bookingId, {
                    paymentStatus: 'paid'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Payment verified successfully',
                paymentId: razorpay_payment_id
            });
        } else {
            return res.status(400).json({ success: false, message: 'Invalid signature sent!' });
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
};
