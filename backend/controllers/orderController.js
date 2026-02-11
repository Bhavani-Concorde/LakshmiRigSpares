/**
 * Order Controller - Order management
 */

const Order = require('../models/Order');
const Product = require('../models/Product');
const { sendOrderConfirmation } = require('../utils/emailService');
const { asyncHandler } = require('../middleware/errorMiddleware');

// Create order
const createOrder = asyncHandler(async (req, res) => {
    const { items, shippingAddress, billingAddress, paymentMethod, notes } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ success: false, message: 'No items in order' });
    }

    // Calculate totals and validate products
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) return res.status(404).json({ success: false, message: `Product ${item.product} not found` });
        if (product.stock < item.quantity) return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });

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

        // Update stock
        product.stock -= item.quantity;
        await product.save();
    }

    const taxRate = 18; // GST
    const tax = Math.round(subtotal * taxRate / 100);
    const shippingCost = subtotal > 10000 ? 0 : 500; // Free shipping over 10000
    const total = subtotal + tax + shippingCost;

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

    // Send confirmation email
    sendOrderConfirmation(req.user, order).catch(err => console.error('Order email failed:', err));

    const populatedOrder = await Order.findById(order._id).populate('items.product', 'name images');
    res.status(201).json({ success: true, message: 'Order placed successfully', data: populatedOrder });
});

// Get user orders
const getUserOrders = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { user: req.user._id };
    if (req.query.status) query.status = req.query.status;

    const [orders, total] = await Promise.all([
        Order.find(query).populate('items.product', 'name images').sort({ createdAt: -1 }).skip(skip).limit(limit),
        Order.countDocuments(query)
    ]);

    res.json({ success: true, data: { orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
});

// Get single order
const getOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate('items.product', 'name images sku').populate('user', 'name email phone');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (req.userRole !== 'admin' && req.userRole !== 'superadmin' && order.user._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: order });
});

// Update order status (Admin)
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status, paymentStatus, shipping, internalNotes } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (status) {
        order.status = status;
        order.history.push({ status, note: `Status changed to ${status}`, updatedBy: req.user._id, updatedByModel: 'Admin', updatedAt: new Date() });
    }
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (shipping) order.shipping = { ...order.shipping, ...shipping };
    if (internalNotes) order.internalNotes = internalNotes;

    await order.save();
    res.json({ success: true, message: 'Order updated', data: order });
});

// Cancel order
const cancelOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (req.userRole !== 'admin' && req.userRole !== 'superadmin' && order.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (['shipped', 'delivered', 'cancelled'].includes(order.status)) {
        return res.status(400).json({ success: false, message: 'Cannot cancel this order' });
    }

    // Restore stock
    for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }

    order.status = 'cancelled';
    order.history.push({ status: 'cancelled', note: req.body.reason || 'Order cancelled', updatedAt: new Date() });
    await order.save();

    res.json({ success: true, message: 'Order cancelled', data: order });
});

// Get all orders (Admin)
const getAllOrders = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.paymentStatus) query.paymentStatus = req.query.paymentStatus;

    const [orders, total] = await Promise.all([
        Order.find(query).populate('user', 'name email phone').sort({ createdAt: -1 }).skip(skip).limit(limit),
        Order.countDocuments(query)
    ]);

    res.json({ success: true, data: { orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
});

module.exports = { createOrder, getUserOrders, getOrder, updateOrderStatus, cancelOrder, getAllOrders };
