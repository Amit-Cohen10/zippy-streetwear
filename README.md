# Zippy Streetwear - Futuristic E-commerce Platform

A cutting-edge e-commerce platform for streetwear enthusiasts that combines traditional online shopping with an innovative clothing exchange system, featuring a cyberpunk-inspired design aesthetic.

## 🌟 Features

### Core E-commerce
- **Product Catalog**: Dynamic grid view with search and filtering
- **Shopping Cart**: Persistent cart with quantity management
- **Checkout System**: Multi-step checkout with payment processing
- **User Authentication**: JWT-based auth with "Remember Me" functionality

### Unique Exchange System
- **Clothing Exchange**: Trade items with community members
- **Exchange Marketplace**: Browse available exchanges
- **Messaging System**: In-app communication for negotiations
- **Rating System**: Build trust through community ratings

### Additional Pages (6+ Required)
- **Exchange Hub** (`/exchange`): Browse and create exchanges
- **Community Feed** (`/community`): User posts and style inspiration
- **Brand Stories** (`/brands`): Featured brands and authentication guide
- **Style Guide** (`/style-guide`): Fashion tips and outfit builder
- **Sustainability** (`/sustainability`): Environmental impact metrics
- **Virtual Fitting Room** (`/fitting-room`): AR try-on simulation
- **User Dashboard** (`/dashboard`): Orders, exchanges, wishlist
- **Product Detail** (`/product-detail`): Image gallery and exchange info

### Design & UX
- **Cyberpunk Aesthetic**: Dark theme with neon accents
- **Responsive Design**: Mobile-first approach
- **Smooth Animations**: Glitch effects and neon glow
- **Modern Typography**: Orbitron, Space Grotesk, Rajdhani fonts

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd zippy-streetwear
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Default Admin Credentials
- **Username**: `admin`
- **Password**: `admin`

## 📁 Project Structure

```
zippy-streetwear/
├── server.js                 # Main server file
├── package.json             # Dependencies and scripts
├── test.js                 # Comprehensive test suite
├── modules/                # Backend modules
│   ├── auth-server.js      # Authentication routes
│   ├── products-server.js  # Product management
│   ├── cart-server.js      # Shopping cart logic
│   ├── exchange-server.js  # Clothing exchange system
│   ├── payment-server.js   # Payment processing
│   ├── admin-server.js     # Admin functionality
│   └── persist_module.js   # Data persistence
├── public/                 # Frontend files
│   ├── index.html          # Homepage
│   ├── products.html       # Product catalog
│   ├── exchange.html       # Exchange hub
│   ├── community.html      # Community feed
│   ├── brands.html         # Brand stories
│   ├── style-guide.html    # Style guide
│   ├── sustainability.html # Sustainability page
│   ├── fitting-room.html   # Virtual fitting room
│   ├── dashboard.html      # User dashboard
│   ├── product-detail.html # Product detail page
│   ├── admin.html          # Admin panel
│   ├── styles/            # CSS files
│   ├── scripts/           # JavaScript files
│   └── images/            # Image assets
└── data/                  # Data storage
    ├── users/             # User data
    ├── products/          # Product data
    ├── exchanges/         # Exchange data
    └── activity-logs/     # Activity logs
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify-token` - Token validation

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add to cart
- `PUT /api/cart/update` - Update cart item
- `DELETE /api/cart/remove/:id` - Remove from cart

### Exchanges
- `GET /api/exchanges` - Get all exchanges
- `POST /api/exchanges/create` - Create exchange
- `PUT /api/exchanges/:id` - Update exchange
- `POST /api/exchanges/:id/message` - Send message

### Payment
- `POST /api/payment/checkout` - Process checkout
- `GET /api/payment/orders` - Get user orders

### Admin
- `GET /api/admin/activity` - Get activity logs
- `GET /api/admin/users` - Get all users
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product

## 🎨 Design System

### Color Palette
```css
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

### Typography
- **Primary**: Orbitron (Headings)
- **Secondary**: Space Grotesk (Body text)
- **Accent**: Rajdhani (UI elements)

## 🧪 Testing

Run the comprehensive test suite:

```bash
npm test
```

The test suite covers:
- Authentication system
- Product CRUD operations
- Cart functionality
- Exchange system
- Payment flow
- Admin operations
- Search functionality
- User preferences

## 🔒 Security Features

- **DOS Protection**: Rate limiting on all endpoints
- **Password Hashing**: bcrypt implementation
- **JWT Tokens**: Secure session management
- **Input Validation**: XSS and injection protection
- **CSRF Protection**: Token-based security

## 🌱 Sustainability Features

- **Exchange vs Buy Impact**: Environmental impact comparison
- **Carbon Footprint Calculator**: User impact assessment
- **Recycling Program**: Material processing statistics
- **Water Usage Tracking**: Conservation metrics

## 🚀 Deployment

### Production Build
```bash
npm start
```

### Environment Variables
Create a `.env` file:
```env
PORT=3000
JWT_SECRET=your-secret-key
NODE_ENV=production
```

## 📊 Performance

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Image Optimization**: Responsive images with fallbacks
- **Caching**: Static asset caching
- **Compression**: Gzip compression enabled

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by cyberpunk aesthetics and streetwear culture
- Built with modern web technologies
- Designed for sustainability and community

---

**Zippy Streetwear** - Where fashion meets the future 🔮 