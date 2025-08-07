# Zippy Streetwear - Setup Instructions

A modern e-commerce platform for streetwear lovers that combines regular online shopping with a unique clothing exchange system. Built with a cyberpunk-inspired design and neon colors.

## Prerequisites

Before running this project, you need to install:

- **Node.js** (version 14 or higher) - Download from [nodejs.org](https://nodejs.org/)
- **npm** (comes with Node.js) - Package manager for JavaScript
- **Git** (optional) - For version control

## Installation & Setup

### Step 1: Download the Project
```bash
# If you have Git installed:
git clone <repository-url>
cd zippy-streetwear

# Or download the ZIP file and extract it
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Create Environment File
Create a file called `.env` in the project root:
```env
PORT=3000
JWT_SECRET=zippy-secret-key-change-in-production
NODE_ENV=development
```

### Step 4: Start the Server
```bash
# For development (with auto-restart):
npm run dev

# For production:
npm start
```

### Step 5: Open in Browser
Go to `http://localhost:3000` in your web browser.

## System Architecture & Logic

### Backend Architecture
The application uses a modular architecture with separate server modules:

**Server Modules:**
- `auth-server.js` - Handles user registration, login, logout, and token management
- `products-server.js` - Manages product CRUD operations, search, and filtering
- `cart-server.js` - Handles shopping cart operations and persistence
- `exchange-server.js` - Manages the clothing exchange system and matching algorithm
- `payment-server.js` - Processes payments and order creation
- `admin-server.js` - Provides admin functionality and user activity monitoring
- `persist_module.js` - Handles data persistence using JSON files

**Data Flow:**
1. Client makes request to server
2. Server validates authentication (if required)
3. Server processes request through appropriate module
4. Data is persisted to JSON files via persist_module
5. Response is sent back to client

### Authentication Logic
- **JWT Tokens**: Secure session management with different expiration times
- **Remember Me**: 12-day tokens vs 30-minute tokens for regular sessions
- **Password Hashing**: bcrypt with salt rounds for security
- **Token Validation**: Middleware checks tokens on protected routes

### Exchange System Logic
The exchange matching algorithm considers multiple factors:
1. **Category Compatibility** - Same clothing category gets higher score
2. **Brand Matching** - Same brand increases match score
3. **Size Availability** - Matching sizes between users
4. **Price Range** - Items within 20% price difference
5. **User Rating** - Higher rated users get priority
6. **Exchange History** - Users with successful exchanges get preference

**Matching Score Calculation:**
- Category match: +30 points
- Brand match: +20 points
- Size match: +15 points
- Price match: +25 points
- User rating: +2 points per rating star

### Shopping Cart Logic
- **Persistence**: Cart data saved to user profile in JSON files
- **Stock Validation**: Checks available stock before adding to cart
- **Size Validation**: Ensures selected size is available
- **Quantity Management**: Users can update quantities or remove items
- **Session Management**: Cart persists across browser sessions

### Payment Processing Logic
- **Mock Payment**: Simulates real payment processing
- **Credit Card Validation**: Checks card number format and expiry
- **Order Creation**: Generates unique order IDs and tracking numbers
- **Stock Deduction**: Reduces product stock after successful payment
- **Order History**: Saves order details to user profile

### File-based Database Logic
Instead of a traditional database, the application uses JSON files:
- **Users**: `data/users/users.json` - User accounts and profiles
- **Products**: `data/products/products.json` - Product catalog
- **Carts**: `data/carts/carts.json` - Shopping cart data
- **Exchanges**: `data/exchanges/exchanges.json` - Exchange offers
- **Orders**: `data/orders/orders.json` - Order history
- **Activity Logs**: `data/activity-logs/activity.json` - User activity tracking

**Data Structure Example:**
```json
{
  "users": [
    {
      "id": "user123",
      "username": "admin",
      "email": "admin@zippy.com",
      "password": "hashed_password",
      "role": "admin",
      "profile": {
        "displayName": "Admin User",
        "exchangeRating": 5.0
      }
    }
  ]
}
```

### Security Logic
- **Rate Limiting**: 100 requests per 15 minutes per IP address
- **Input Validation**: Sanitizes all user inputs to prevent XSS
- **CSRF Protection**: Token-based protection against cross-site requests
- **Password Requirements**: Minimum 8 characters with complexity
- **Session Management**: Secure cookie handling with HttpOnly flags

### Frontend Logic
- **Responsive Design**: Mobile-first approach with breakpoints
- **Dark Mode**: Cyberpunk theme with neon color scheme
- **Local Storage**: User preferences and cart data persistence
- **Real-time Updates**: Polling for admin panel and exchange updates
- **Error Handling**: User-friendly error messages and validation

## Default Login Credentials

### Admin Account
- **Username**: `admin`
- **Password**: `admin`
- **Access**: Full admin panel, user management, product management

### Test User Account (if you register)
- **Username**: Any email you choose
- **Password**: Any password you choose
- **Access**: Regular user features

## Sample Data for Testing

### Sample Credit Card Details (for payment testing)
Use these details in the checkout form:
- **Card Number**: `4111 1111 1111 1111`
- **Expiry Date**: `12/25`
- **CVV**: `123`
- **Cardholder Name**: `Test User`

### Sample Product Data
The system comes with sample products:
- **Neon Cyber Hoodie** - $129.99
- **Glitch Art Tee** - $49.99
- **Holographic Cargo Pants** - $89.99
- **Digital Camo Jacket** - $159.99
- **Neon Pulse Sweater** - $79.99

### Sample User Data
Default users created:
- **admin/admin** - Administrator account
- **test@example.com** - Test user (if you register)

## How to Use the Application

### 1. Registration and Login
- Go to `http://localhost:3000`
- Click "Register" to create a new account
- Or use admin account: `admin` / `admin`

### 2. Browse Products
- Click "Products" in the navigation
- Use search bar to find specific items
- Filter by category, brand, price, size
- Click on any product to see details

### 3. Add to Cart
- Click "Add to Cart" on any product
- Choose size and quantity
- Cart will show in top navigation
- Click cart icon to view items

### 4. Checkout Process
- Go to cart page
- Review items and quantities
- Click "Proceed to Checkout"
- Fill shipping address
- Use sample credit card: `4111 1111 1111 1111`
- Click "Pay Now"

### 5. Admin Panel
- Login as admin: `admin` / `admin`
- Go to `/admin` or click "Admin" in navigation
- View user activity logs
- Manage products (add/edit/delete)
- Monitor system health

### 6. Exchange System
- Go to `/exchange`
- Browse available exchanges
- Create new exchange offers
- Chat with other users
- Rate exchange experiences

## Project Structure

```
zippy-streetwear/
├── server.js                 # Main server file
├── package.json             # Dependencies and scripts
├── test.js                 # Test suite
├── .env                    # Environment variables
├── modules/                # Backend modules
│   ├── auth-server.js      # Login/register
│   ├── products-server.js  # Product management
│   ├── cart-server.js      # Shopping cart
│   ├── exchange-server.js  # Exchange system
│   ├── payment-server.js   # Payment processing
│   ├── admin-server.js     # Admin panel
│   └── persist_module.js   # Data storage
├── public/                 # Frontend files
│   ├── index.html          # Homepage
│   ├── products.html       # Product catalog
│   ├── exchange.html       # Exchange hub
│   ├── community.html      # Community feed
│   ├── brands.html         # Brand stories
│   ├── style-guide.html    # Style guide
│   ├── sustainability.html # Sustainability page
│   ├── dashboard.html      # User dashboard
│   ├── my-items.html       # Purchase history
│   ├── wishlist.html       # Saved items
│   ├── admin.html          # Admin panel
│   ├── cart.html           # Shopping cart
│   ├── checkout.html       # Checkout page
│   ├── thank-you.html      # Order confirmation
│   ├── styles/            # CSS files
│   ├── scripts/           # JavaScript files
│   └── images/            # Product images
└── data/                  # Data storage
    ├── users/             # User accounts
    ├── products/          # Product data
    ├── exchanges/         # Exchange data
    └── activity-logs/     # User activity
```

## API Routes

### Public Routes
- `GET /` - Homepage
- `GET /readme.html` - Project documentation
- `GET /llm.html` - LLM code documentation

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/verify-token` - Check if user is logged in

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get specific product
- `POST /api/products` - Add new product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Shopping Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update/:id` - Change quantity
- `DELETE /api/cart/remove/:id` - Remove item

### Exchanges
- `GET /api/exchanges` - Get all exchanges
- `POST /api/exchanges/create` - Create new exchange
- `PUT /api/exchanges/:id` - Update exchange
- `POST /api/exchanges/:id/message` - Send message

### Payment
- `POST /api/payment/checkout` - Process payment
- `GET /api/payment/orders` - Get user orders

### Admin
- `GET /api/admin/activity` - Get user activity
- `GET /api/admin/users` - Get all users
- `POST /api/admin/products` - Add product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product

## Testing

Run the test suite to check if everything works:

```bash
npm test
```

The tests check:
- User registration and login
- Product management
- Shopping cart functions
- Exchange system
- Payment processing
- Admin features
- Search and filtering
- Security features

## Security Features

- **Rate Limiting**: Prevents too many requests from same IP
- **Password Hashing**: Passwords are encrypted with bcrypt
- **JWT Tokens**: Secure session management
- **Input Validation**: Prevents XSS and injection attacks
- **CSRF Protection**: Prevents cross-site request forgery

## Design Features

### Color Scheme
- Dark background with neon colors
- Cyan (#00ffff), Pink (#ff00ff), Green (#00ff00)
- Glass-morphism effects

### Typography
- Orbitron font for headings
- Space Grotesk for body text
- Rajdhani for UI elements

### Responsive Design
- Works on desktop, tablet, and mobile
- Smooth animations and transitions
- Cyberpunk aesthetic throughout

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Change port in .env file
   PORT=3001
   ```

2. **Dependencies not installed**
   ```bash
   npm install
   ```

3. **Server won't start**
   - Check if Node.js is installed: `node --version`
   - Check if all dependencies are installed: `npm install`
   - Check if .env file exists

4. **Database errors**
   - The app uses JSON files for storage
   - Check if data/ folder exists
   - Restart server if needed

5. **Payment not working**
   - Use the sample credit card: `4111 1111 1111 1111`
   - Make sure expiry date is future: `12/25`
   - CVV should be 3 digits: `123`

6. **Admin panel not accessible**
   - Make sure you're logged in as admin: `admin` / `admin`
   - Check if you're on the right URL: `/admin`
   - Clear browser cache if needed

### Development Tips

- Use `npm run dev` for development (auto-restart on changes)
- Check browser console for JavaScript errors
- Check terminal for server errors
- Use admin account (admin/admin) to test admin features
- Test payment with sample credit card details
- Check data files in `data/` folder for debugging

## Default Values and Sample Data

### Environment Variables (.env)
```env
PORT=3000
JWT_SECRET=zippy-secret-key-change-in-production
NODE_ENV=development
```

### Sample User Data
```json
{
  "username": "admin",
  "password": "hashed_password",
  "email": "admin@zippy.com",
  "role": "admin"
}
```

### Sample Product Data
```json
{
  "id": "1",
  "title": "Neon Cyber Hoodie",
  "price": 129.99,
  "category": "hoodies",
  "brand": "Zippy Originals",
  "sizes": ["S", "M", "L", "XL"],
  "stock": {"S": 5, "M": 10, "L": 8, "XL": 3}
}
```

### Sample Credit Card (for testing)
- **Number**: `4111 1111 1111 1111`
- **Expiry**: `12/25`
- **CVV**: `123`
- **Name**: `Test User`

## License

This project is for educational purposes.

---

**Zippy Streetwear** - Where fashion meets the future 🔮
