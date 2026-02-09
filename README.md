# Sri Lakshmi Rig Spares - Industrial Management System

A complete industrial management system built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## 🏭 About

Sri Lakshmi Rig Spares Industrial Management System is a comprehensive solution for managing products, services, bookings, enquiries, customers, suppliers, and orders for industrial spare parts business.

## 🚀 Features

### Admin Panel
- ✅ Secure admin login with JWT authentication
- ✅ Dashboard with analytics and statistics
- ✅ Product Management (CRUD operations)
- ✅ Service Management (CRUD operations)
- ✅ Customer Management
- ✅ Supplier Management
- ✅ Enquiry Management
- ✅ Booking Management
- ✅ Order Management
- ✅ User Management

### User Panel
- ✅ User registration & login
- ✅ Google OAuth integration
- ✅ Personal Dashboard
- ✅ Browse products & services
- ✅ Book services
- ✅ Product enquiry submission
- ✅ Order tracking
- ✅ Profile management
- ✅ View enquiry status

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js, React Router, Context API |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Authentication | JWT + Google OAuth 2.0 |
| Styling | Custom CSS with modern design |

## 📁 Project Structure

```
mcaproject/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── serviceController.js
│   │   ├── bookingController.js
│   │   ├── enquiryController.js
│   │   ├── orderController.js
│   │   ├── supplierController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Admin.js
│   │   ├── Product.js
│   │   ├── Service.js
│   │   ├── Booking.js
│   │   ├── Enquiry.js
│   │   ├── Order.js
│   │   └── Supplier.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── serviceRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── enquiryRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── supplierRoutes.js
│   │   └── adminRoutes.js
│   ├── utils/
│   │   ├── generateToken.js
│   │   └── emailService.js
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB
- Google Cloud Console account (for OAuth)

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

Create a `.env` file in the backend folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_app_password
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## 📊 Database Collections

- **users** - Customer accounts
- **admins** - Admin accounts
- **products** - Industrial products catalog
- **services** - Available services
- **bookings** - Service bookings
- **enquiries** - Product/service enquiries
- **orders** - Customer orders
- **suppliers** - Supplier information

## 🔐 Authentication

- JWT-based authentication with refresh tokens
- Google OAuth 2.0 integration
- Secure password hashing with bcrypt
- Role-based access control (Admin/User)

## 📝 API Endpoints

### Auth Routes
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Product Routes
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Service Routes
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get single service
- `POST /api/services` - Create service (Admin)
- `PUT /api/services/:id` - Update service (Admin)
- `DELETE /api/services/:id` - Delete service (Admin)

### Booking Routes
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking status

### Order Routes
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order status

## 👨‍💻 Author

Sri Lakshmi Rig Spares Development Team

## 📄 License

This project is proprietary software for Sri Lakshmi Rig Spares.
