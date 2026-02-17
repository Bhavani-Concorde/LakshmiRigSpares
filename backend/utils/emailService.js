/**
 * Email Service Utility
 * Handles all email sending operations
 */

const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    },
    pool: false,
    // Decrease timeout to fail faster if blocked
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000
  });
};

/**
 * Send Email
 * @param {Object} options - Email options (to, subject, html, text)
 * @returns {Promise}
 */
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Sri Lakshmi Rig Spares" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

/**
 * Send Welcome Email to new user
 */
const sendWelcomeEmail = async (user) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { color: white; margin: 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏭 Sri Lakshmi Rig Spares</h1>
        </div>
        <div class="content">
          <h2>Welcome, ${user.name}!</h2>
          <p>Thank you for registering with Sri Lakshmi Rig Spares. We're excited to have you on board!</p>
          <p>With your account, you can:</p>
          <ul>
            <li>Browse our extensive catalog of industrial products</li>
            <li>Book our professional services</li>
            <li>Track your orders in real-time</li>
            <li>Submit enquiries and get quick responses</li>
          </ul>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="button">Visit Dashboard</a>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Sri Lakshmi Rig Spares. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: user.email,
    subject: 'Welcome to Sri Lakshmi Rig Spares!',
    html,
    text: `Welcome ${user.name}! Thank you for registering with Sri Lakshmi Rig Spares.`
  });
};

/**
 * Send Order Confirmation Email
 */
const sendOrderConfirmation = async (user, order) => {
  const itemsList = order.items.map(item =>
    `<tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.total.toLocaleString()}</td>
    </tr>`
  ).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { color: white; margin: 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #667eea; color: white; padding: 12px; text-align: left; }
        .total { font-size: 18px; font-weight: bold; color: #667eea; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏭 Order Confirmation</h1>
        </div>
        <div class="content">
          <h2>Thank you for your order, ${user.name}!</h2>
          <p><strong>Order ID:</strong> ${order.orderId}</p>
          <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
          </table>
          
          <p class="total">Total: ₹${order.total.toLocaleString()}</p>
          
          <p>We will process your order soon. You can track your order status in your dashboard.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: user.email,
    subject: `Order Confirmation - ${order.orderId}`,
    html,
    text: `Your order ${order.orderId} has been confirmed. Total: ₹${order.total}`
  });
};

/**
 * Send Booking Confirmation Email
 */
const sendBookingConfirmation = async (user, booking, service) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { color: white; margin: 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #11998e; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📅 Booking Confirmed</h1>
        </div>
        <div class="content">
          <h2>Hello ${user.name},</h2>
          <p>Your service booking has been confirmed!</p>
          
          <div class="info-box">
            <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
            <p><strong>Service:</strong> ${service.name}</p>
            <p><strong>Date:</strong> ${new Date(booking.scheduledDate).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${booking.scheduledTime}</p>
            <p><strong>Location:</strong> ${booking.location.address}, ${booking.location.city}</p>
          </div>
          
          <p>Our team will contact you before the scheduled date to confirm the details.</p>
          <p>For any queries, please contact us at ${process.env.EMAIL_USER}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: user.email,
    subject: `Booking Confirmed - ${booking.bookingId}`,
    html,
    text: `Your booking ${booking.bookingId} for ${service.name} has been confirmed for ${new Date(booking.scheduledDate).toLocaleDateString()}`
  });
};

/**
 * Send Enquiry Received Email
 */
const sendEnquiryReceived = async (email, name, enquiry) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { color: white; margin: 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📩 Enquiry Received</h1>
        </div>
        <div class="content">
          <h2>Hello ${name},</h2>
          <p>Thank you for your enquiry. We have received your message and will get back to you soon.</p>
          <p><strong>Enquiry ID:</strong> ${enquiry.enquiryId}</p>
          <p><strong>Subject:</strong> ${enquiry.subject}</p>
          <p>Our team typically responds within 24-48 hours.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `Enquiry Received - ${enquiry.enquiryId}`,
    html,
    text: `Your enquiry ${enquiry.enquiryId} has been received. We will respond within 24-48 hours.`
  });
};

/**
 * Send Password Reset Email
 */
const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { color: white; margin: 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Password Reset</h1>
        </div>
        <div class="content">
          <h2>Hello ${user.name},</h2>
          <p>You requested to reset your password. Click the button below to set a new password:</p>
          <a href="${resetUrl}" class="button">Reset Password</a>
          <p style="margin-top: 20px; font-size: 12px; color: #666;">
            This link will expire in 1 hour. If you didn't request this, please ignore this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: user.email,
    subject: 'Password Reset Request',
    html,
    text: `Reset your password using this link: ${resetUrl}`
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendOrderConfirmation,
  sendBookingConfirmation,
  sendEnquiryReceived,
  sendPasswordResetEmail
};
