const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const Booking = require('../models/Booking');

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

        const options = {
            amount: Math.round(amount * 100), // Razorpay expects amount in paise
            currency,
            receipt: `receipt_${Date.now()}`,
        };

        const razorpayOrder = await razorpay.orders.create(options);

        if (!razorpayOrder) {
            return res.status(500).json({ success: false, message: 'Failed to create Razorpay order' });
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

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            // Payment verified
            const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });

            if (!payment) {
                return res.status(404).json({ success: false, message: 'Payment record not found' });
            }

            payment.razorpayPaymentId = razorpay_payment_id;
            payment.razorpaySignature = razorpay_signature;
            payment.status = 'captured';
            await payment.save();

            // Update associated Order or Booking
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
                message: "Payment verified successfully",
                paymentId: razorpay_payment_id
            });
        } else {
            return res.status(400).json({ success: false, message: "Invalid signature sent!" });
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
};
