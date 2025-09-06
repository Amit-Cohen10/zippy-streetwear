const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import all our custom modules - each handles a different part of the application
// This follows the requirement to implement different screens in different node.js modules
const authServer = require('./modules/auth-server');        // Handles login/register
const productsServer = require('./modules/products-server'); // Handles product management
const cartServer = require('./modules/cart-server');        // Handles shopping cart
const exchangeServer = require('./modules/exchange-server'); // Handles product exchanges
const paymentServer = require('./modules/payment-server');  // Handles payment processing
const adminServer = require('./modules/admin-server');      // Handles admin functions
const { requireAuth, requireAdmin, optionalAuth } = require('./modules/auth-middleware'); // Authentication checks

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup - these are functions that run before our route handlers
// They process the request and prepare it for our application
app.use(cors()); // Allows requests from different domains (needed for frontend)
app.use(express.json({ limit: '10mb' })); // Parses JSON requests, limit size to prevent memory attacks
app.use(express.urlencoded({ extended: true })); // Parses form data
app.use(cookieParser()); // Parses cookies for user sessions

// Serve static files (HTML, CSS, JS, images) from the 'public' folder
// This is how users can access our frontend files
app.use(express.static('public'));

// Rate limiting middleware for DOS (Denial of Service) attack protection
// This is a security requirement from the project specifications
const rateLimit = require('express-rate-limit');

// Only apply rate limiting in production to avoid blocking during development
if (process.env.NODE_ENV === 'production') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes time window
    max: 100, // limit each IP to 100 requests per 15 minutes
    message: 'Too many requests from this IP, please try again later.'
  });
  app.use(limiter);
}

// Security middleware - adds security headers to prevent common attacks
// These headers help protect against XSS, clickjacking, and other vulnerabilities
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff'); // Prevents MIME type sniffing
  res.setHeader('X-Frame-Options', 'DENY'); // Prevents clickjacking attacks
  res.setHeader('X-XSS-Protection', '1; mode=block'); // Basic XSS protection
  next(); // Continue to the next middleware or route handler
});

// API routes - these connect our frontend to our backend modules
// Each route uses a different module as required by the project specifications
app.use('/api/auth', authServer);           // Authentication endpoints
app.use('/api/products', productsServer);   // Product management endpoints
app.use('/api/cart', cartServer);           // Shopping cart endpoints
app.use('/api/exchanges', exchangeServer);  // Product exchange endpoints
app.use('/api/payment', paymentServer);     // Payment processing endpoints
app.use('/api/admin', adminServer);         // Admin functionality endpoints

// Public routes - no authentication required (can be accessed without logging in)
// These are the main pages users see when they first visit the site
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html')); // Homepage
});

app.get('/readme.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'readme.html')); // Project documentation
});

app.get('/llm.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'llm.html')); // LLM-generated code documentation
});

// Protected routes - authentication required (users must be logged in)
// These routes use the requireAuth middleware to check if user is logged in
// If not logged in, they get redirected to login page as per requirements
// Note: products page is public per assignment requirements
app.get('/products', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'products.html')); // Store screen (public)
});

app.get('/product/:id', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'product-detail.html')); // Individual product view
});

app.get('/exchange', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'exchange.html')); // Product exchange feature
});

app.get('/community', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'community.html')); // Community features
});

app.get('/brands', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'brands.html')); // Brand showcase
});

app.get('/style-guide', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'style-guide.html')); // Style guide
});

app.get('/sustainability', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'sustainability.html')); // Sustainability info
});

app.get('/fitting-room', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'fitting-room.html')); // Virtual fitting room
});

app.get('/dashboard', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html')); // User dashboard
});

app.get('/admin', requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html')); // Admin panel (admin only)
});

app.get('/cart', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cart.html')); // Shopping cart
});

app.get('/my-items', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'my-items.html')); // Purchased items
});

app.get('/checkout', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'checkout.html')); // Checkout process
});

app.get('/thank-you', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'thank-you.html')); // Payment confirmation
});

app.get('/wishlist', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'wishlist.html')); // User wishlist
});

// Error handling middleware - catches any errors that occur in our application
// This is required by the project specifications to handle errors gracefully
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error for debugging
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    // In development, show actual error. In production, show generic message for security
  });
});

// 404 handler - catches any routes that don't exist
// This ensures users get a proper response instead of the browser's default 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start the server and listen for incoming connections
// The server will run on all network interfaces (0.0.0.0) so it's accessible from other devices
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Zippy server running on port ${PORT}`);
  console.log(`🌐 Visit: http://localhost:${PORT}`);
  console.log(`🌐 External: http://0.0.0.0:${PORT}`);
  console.log(`👨‍💼 Admin panel: http://localhost:${PORT}/admin`);
  console.log(`📧 Default admin: admin / admin`); // Default admin credentials as required
}); 