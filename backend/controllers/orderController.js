/**
 * Order Controller - Order management
 */

const Order = require('../models/Order');
const Product = require('../models/Product');
const { sendOrderConfirmation } = require('../utils/emailService');
const { asyncHandler } = require('../middleware/errorMiddleware');

// Create order
const createOrder = asyncHandler(async (req, res) => {
    console.log('Order Creation Request Body:', JSON.stringify(req.body, null, 2));
    const { items, shippingAddress, billingAddress, paymentMethod, notes } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ success: false, message: 'No items in order' });
    }

    // Calculate totals and validate products
    let subtotal = 0;
    const orderItems = [];
    const productsToUpdate = [];

    try {
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ success: false, message: `Product not found: ${item.product}` });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
            }

            const price = product.discountPrice || product.price;
            const total = price * item.quantity;
            subtotal += total;

            orderItems.push({
                product: product._id,
                name: product.name,
                quantity: item.quantity,
                price,
                total
            });

            productsToUpdate.push({ product, quantity: item.quantity });
        }

        const taxRate = 18; // 18% GST
        const tax = Math.round(subtotal * taxRate / 100);
        const shippingCost = subtotal > 10000 ? 0 : 500;
        const total = subtotal + tax + shippingCost;

        // Create order
        const order = await Order.create({
            user: req.user._id,
            items: orderItems,
            subtotal,
            tax,
            taxRate,
            shippingCost,
            total,
            shippingAddress,
            billingAddress: billingAddress || shippingAddress,
            paymentMethod,
            notes,
            history: [{ status: 'pending', note: 'Order placed', updatedAt: new Date() }]
        });

        // Update stock only after order is created successfully
        for (const { product, quantity } of productsToUpdate) {
            product.stock -= quantity;
            await product.save();
        }

        // Send confirmation email (don't await to avoid blocking)
        sendOrderConfirmation(req.user, order).catch(err => console.error('Order email failed:', err));

        const populatedOrder = await Order.findById(order._id).populate('items.product', 'name images');

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            data: populatedOrder
        });

    } catch (error) {
        console.error('Order Creation Error:', error);

        // Handle Mongoose validation errors explicitly
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }

        res.status(400).json({
            success: false,
            message: error.message || 'Failed to place order'
        });
    }
});

// Get user orders
const getUserOrders = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { user: req.user._id };
    if (req.query.status && req.query.status !== 'all') {
        query.status = req.query.status;
    }

    const orders = await Order.find(query)
        .populate('items.product', 'name images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Order.countDocuments(query);

    res.status(200).json({
        success: true,
        data: {
            orders,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        }
    });
});

// Get single order
const getOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('items.product', 'name images category brand')
        .populate('user', 'name email phone');

    if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check if user is authorized to view this order
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.status(200).json({ success: true, data: order });
});

// Update order status (Admin only)
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = status;
    order.history.push({
        status,
        note: note || `Order status updated to ${status}`,
        updatedAt: new Date()
    });

    if (status === 'delivered') {
        order.paymentStatus = 'paid';
        order.deliveredAt = new Date();
    }

    await order.save();

    res.status(200).json({ success: true, message: 'Order status updated', data: order });
});

// Cancel order
const cancelOrder = asyncHandler(async (req, res) => {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check authorization
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to cancel this order' });
    }

    if (order.status !== 'pending') {
        return res.status(400).json({ success: false, message: 'Order cannot be cancelled as it is already ' + order.status });
    }

    order.status = 'cancelled';
    order.history.push({
        status: 'cancelled',
        note: reason || 'Order cancelled by user',
        updatedAt: new Date()
    });

    // Restore stock
    for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity }
        });
    }

    await order.save();

    res.status(200).json({ success: true, message: 'Order cancelled successfully' });
});

// Get all orders (Admin)
const getAllOrders = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status && req.query.status !== 'all') {
        query.status = req.query.status;
    }
    if (req.query.search) {
        query.orderId = { $regex: req.query.search, $options: 'i' };
    }

    const orders = await Order.find(query)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Order.countDocuments(query);

    res.status(200).json({
        success: true,
        data: {
            orders,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        }
    });
});

module.exports = {
    createOrder,
    getUserOrders,
    getOrder,
    updateOrderStatus,
    cancelOrder,
    getAllOrders
};
