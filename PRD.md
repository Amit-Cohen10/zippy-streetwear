# Zippy - Product Requirements Document (PRD)

## 1. Project Overview

### 1.1 Product Name
**Zippy** - Futuristic Streetwear Platform with Clothing Exchange Feature

### 1.2 Vision
Create a cutting-edge e-commerce platform for streetwear enthusiasts that combines traditional online shopping with an innovative clothing exchange system, featuring a cyberpunk-inspired design aesthetic.

### 1.3 Brand Values
- Premium streetwear inspired by brands like Stussy and Jin G
- Sustainability through clothing exchange
- Community-driven fashion marketplace
- Futuristic design with neon accents and dark themes

## 2. Design Requirements

### 2.1 Color Palette
```css
/* Primary Colors */
--primary-dark: #0a0a0a;
--secondary-dark: #1a1a1a;
--accent-neon-cyan: #00ffff;
--accent-neon-pink: #ff00ff;
--accent-neon-green: #00ff00;
--text-light: #ffffff;
--text-gray: #808080;
--card-background: rgba(26, 26, 26, 0.8);
--glass-effect: rgba(255, 255, 255, 0.05);
```

### 2.2 Design Principles
- Dark theme with glowing neon effects
- Smooth animations and futuristic hover effects
- Modern typography (Fonts: Orbitron, Space Grotesk, Rajdhani)
- Dynamic grid layouts for product display
- Glassmorphism effects for cards and modals
- Cyberpunk-inspired UI elements

### 2.3 Visual Elements
- Glitch effects on hover
- Neon glow animations
- Parallax scrolling effects
- Custom cursor with trail effect
- Animated backgrounds with gradient meshes

## 3. Technical Architecture

### 3.1 Backend Structure
```
server.js (Main server file)
├── modules/
│   ├── auth-server.js (Authentication routes)
│   ├── products-server.js (Product management)
│   ├── cart-server.js (Shopping cart logic)
│   ├── exchange-server.js (Clothing exchange system)
│   ├── payment-server.js (Payment processing)
│   ├── admin-server.js (Admin functionality)
│   └── persist_module.js (Data persistence)
├── data/
│   ├── users/
│   ├── products/
│   ├── exchanges/
│   └── activity-logs/
└── public/
    ├── index.html
    ├── styles/
    ├── scripts/
    └── images/
```

### 3.2 Database Schema

#### Users
```json
{
  "id": "unique_id",
  "username": "string",
  "password": "hashed_string",
  "email": "string",
  "profile": {
    "displayName": "string",
    "avatar": "url",
    "exchangeRating": "number",
    "joinDate": "date"
  },
  "preferences": {
    "darkMode": "boolean",
    "language": "string",
    "notifications": "boolean"
  }
}
```

#### Products
```json
{
  "id": "unique_id",
  "title": "string",
  "description": "string",
  "price": "number",
  "images": ["url"],
  "category": "string",
  "sizes": ["S", "M", "L", "XL"],
  "stock": "object",
  "brand": "string",
  "exchangeable": "boolean",
  "condition": "string"
}
```

#### Exchanges
```json
{
  "id": "unique_id",
  "initiatorId": "user_id",
  "recipientId": "user_id",
  "offeredItems": ["product_id"],
  "requestedItems": ["product_id"],
  "status": "pending|accepted|rejected|completed",
  "messages": [{
    "userId": "string",
    "message": "string",
    "timestamp": "date"
  }],
  "createdAt": "date"
}
```

## 4. Core Features

### 4.1 Authentication System
- **Registration**: Email verification, strong password requirements
- **Login**: JWT tokens with "Remember Me" option (12 days vs 30 minutes)
- **Default Admin**: username: "admin", password: "admin"
- **Session Management**: Secure cookie handling

### 4.2 Product Catalog
- **Grid View**: Dynamic product cards with hover effects
- **Search**: Real-time prefix search by name/description
- **Filters**: Category, size, price range, brand, condition
- **Product Details**: Image gallery, size chart, exchange availability

### 4.3 Shopping Cart
- **Add to Cart**: Authentication required
- **Cart Management**: Update quantities, remove items
- **Persistent Cart**: Saved to user profile
- **Quick View**: Mini cart dropdown

### 4.4 Clothing Exchange System (Unique Feature)
- **Exchange Marketplace**: Browse items available for exchange
- **Create Exchange Offer**: Select items to offer and request
- **Exchange Negotiation**: In-app messaging system
- **Exchange Rating System**: Build trust in community
- **Exchange History**: Track all past exchanges

### 4.5 Checkout & Payment
- **Multi-step Checkout**: Cart review → Shipping → Payment
- **Payment Form**: Credit card details (mock payment)
- **Order Confirmation**: Thank you page with order details
- **Email Confirmation**: Order summary sent to user

### 4.6 User Dashboard
- **My Orders**: Purchase history with tracking
- **My Exchanges**: Active and completed exchanges
- **Wishlist**: Save items for later
- **Profile Settings**: Update personal info, preferences

### 4.7 Admin Panel
- **Activity Monitoring**: Real-time user activity table
- **User Management**: View/edit user accounts
- **Product Management**: CRUD operations for products
- **Exchange Moderation**: Resolve disputes
- **Analytics Dashboard**: Sales, exchanges, user metrics

## 5. Additional Pages (4+ Required)

### 5.1 Exchange Hub (/exchange)
- Browse all available exchanges
- Filter by category, size, brand
- Create new exchange listings
- Exchange matching algorithm

### 5.2 Community Feed (/community)
- User outfit posts
- Style inspiration
- Trending items
- User reviews and ratings

### 5.3 Brand Stories (/brands)
- Featured streetwear brands
- Brand history and philosophy
- Exclusive collections
- Brand authentication guide

### 5.4 Style Guide (/style-guide)
- Streetwear fashion tips
- Size guides for different brands
- Care instructions
- Outfit builder tool

### 5.5 Sustainability (/sustainability)
- Environmental impact metrics
- Exchange vs. buy statistics
- Recycling program
- Carbon footprint calculator

### 5.6 Virtual Fitting Room (/fitting-room)
- AR try-on feature (simulated)
- Size recommendation engine
- Fit predictor based on past purchases
- User measurements profile

## 6. Security Requirements

### 6.1 DOS Protection
- Rate limiting on all endpoints
- CAPTCHA for suspicious activity
- Request throttling
- IP blacklisting for repeated violations

### 6.2 Data Security
- Password hashing (bcrypt)
- Input validation and sanitization
- XSS protection
- CSRF tokens

## 7. Testing Strategy

### 7.1 test.js Requirements
```javascript
// Test categories:
// 1. Authentication tests (register, login, logout)
// 2. Product CRUD operations
// 3. Cart functionality
// 4. Exchange system tests
// 5. Payment flow
// 6. Admin operations
// 7. Search functionality
// 8. User preference persistence
```

## 8. Routes Documentation

### 8.1 Public Routes
- `GET /` - Homepage
- `GET /products` - Product catalog
- `GET /product/:id` - Product details
- `GET /readme.html` - Project documentation
- `GET /llm.html` - LLM-generated code documentation

### 8.2 Authentication Routes
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/verify-token` - Token validation

### 8.3 User Routes (Authenticated)
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add to cart
- `DELETE /api/cart/remove/:id` - Remove from cart
- `GET /api/orders` - User orders
- `POST /api/checkout` - Process checkout
- `GET /api/profile` - User profile
- `PUT /api/profile` - Update profile

### 8.4 Exchange Routes
- `GET /api/exchanges` - All exchanges
- `POST /api/exchanges/create` - Create exchange
- `PUT /api/exchanges/:id` - Update exchange
- `POST /api/exchanges/:id/message` - Send message

### 8.5 Admin Routes
- `GET /api/admin/activity` - User activity logs
- `GET /api/admin/users` - All users
- `POST /api/admin/products` - Add product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product

## 9. Package.json Configuration

```json
{
  "name": "zippy-streetwear",
  "version": "1.0.0",
  "description": "Futuristic streetwear platform with clothing exchange",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "node test.js"
  },
  "dependencies": {
    "express": "^4.18.0",
    "cookie-parser": "^1.4.6",
    "bcrypt": "^5.1.0",
    "jsonwebtoken": "^9.0.0",
    "multer": "^1.4.5",
    "node-fetch": "^3.3.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.0"
  }
}
```

## 10. Sample Product Data

```javascript
const sampleProducts = [
  {
    title: "Neon Cyber Hoodie",
    description: "Futuristic streetwear hoodie with LED trim",
    price: 129.99,
    category: "hoodies",
    brand: "Zippy Originals",
    sizes: ["S", "M", "L", "XL"],
    exchangeable: true,
    condition: "new"
  },
  {
    title: "Glitch Art Tee",
    description: "Digital distortion graphic t-shirt",
    price: 49.99,
    category: "t-shirts",
    brand: "Street Tech",
    sizes: ["S", "M", "L", "XL", "XXL"],
    exchangeable: true,
    condition: "new"
  },
  {
    title: "Holographic Cargo Pants",
    description: "Reflective cargo pants with utility pockets",
    price: 89.99,
    category: "pants",
    brand: "Future Wear",
    sizes: ["28", "30", "32", "34", "36"],
    exchangeable: true,
    condition: "new"
  }
];
```

## 11. Implementation Timeline

### Phase 1: Core Setup (Days 1-2)
- Project structure setup
- Basic server configuration
- Authentication system
- Database schema implementation

### Phase 2: E-commerce Features (Days 3-4)
- Product catalog
- Shopping cart
- Checkout process
- User dashboard

### Phase 3: Exchange System (Days 5-6)
- Exchange marketplace
- Offer/request system
- Messaging feature
- Rating system

### Phase 4: Admin & Additional Pages (Days 7-8)
- Admin panel
- Additional feature pages
- UI polish and animations

### Phase 5: Testing & Documentation (Days 9-10)
- Comprehensive testing
- Documentation
- Performance optimization
- Final deployment preparation