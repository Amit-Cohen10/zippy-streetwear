const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import modules
const authServer = require('./modules/auth-server');
const productsServer = require('./modules/products-server');
const cartServer = require('./modules/cart-server');
const exchangeServer = require('./modules/exchange-server');
const paymentServer = require('./modules/payment-server');
const adminServer = require('./modules/admin-server');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files
app.use(express.static('public'));

// Rate limiting middleware for DOS protection
const rateLimit = require('express-rate-limit');

// Only apply rate limiting in production
if (process.env.NODE_ENV === 'production') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
  });
  app.use(limiter);
}

// Security middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Routes
app.use('/api/auth', authServer);
app.use('/api/products', productsServer);
app.use('/api/cart', cartServer);
app.use('/api/exchanges', exchangeServer);
app.use('/api/payment', paymentServer);
app.use('/api/admin', adminServer);

// Public routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/products', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'products.html'));
});

app.get('/product/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'product-detail.html'));
});

app.get('/exchange', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'exchange.html'));
});

app.get('/community', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'community.html'));
});

app.get('/brands', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'brands.html'));
});

app.get('/style-guide', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'style-guide.html'));
});

app.get('/sustainability', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'sustainability.html'));
});

app.get('/fitting-room', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'fitting-room.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/cart', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cart.html'));
});

app.get('/my-items', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'my-items.html'));
});

app.get('/checkout', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'checkout.html'));
});

app.get('/thank-you', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'thank-you.html'));
});

app.get('/wishlist', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'wishlist.html'));
});

app.get('/readme.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'readme.html'));
});

app.get('/llm.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'llm.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Zippy server running on port ${PORT}`);
  console.log(`🌐 Visit: http://localhost:${PORT}`);
  console.log(`🌐 External: http://0.0.0.0:${PORT}`);
  console.log(`👨‍💼 Admin panel: http://localhost:${PORT}/admin`);
  console.log(`📧 Default admin: admin / admin`);
}); 