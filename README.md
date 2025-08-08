# Zippy Streetwear Platform

A futuristic e-commerce platform with innovative clothing exchange features, built with Node.js, Express, and modern web technologies.

## Features

- 🛍️ **E-commerce Platform**: Complete shopping experience with cart, checkout, and payment processing
- 🔄 **Clothing Exchange**: Unique system for users to trade clothes with other fashion enthusiasts
- 👥 **Community Features**: User profiles, ratings, and social interactions
- 🎨 **Modern UI**: Cyberpunk-inspired design with dark/light theme support
- 🔐 **Secure Authentication**: JWT-based authentication with session management
- 📊 **Admin Dashboard**: Comprehensive admin panel for managing users, products, and analytics
- 📱 **Responsive Design**: Works seamlessly across all devices

## Tech Stack

- **Backend**: Node.js, Express.js
- **Authentication**: JWT with HTTP-only cookies
- **Database**: File-based JSON storage with persistence module
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Custom CSS with cyberpunk theme
- **Testing**: Comprehensive API test suite with node-fetch

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd zippy-streetwear
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Testing

The platform includes a comprehensive test suite that automatically tests all server-side routes:

```bash
node test.js
```

### Test Coverage

The test suite covers:

- ✅ **Public Routes**: Home page, static files, 404 handling
- ✅ **Authentication**: Registration, login, logout, admin access
- ✅ **Protected Routes**: Security validation for unauthenticated access
- ✅ **Products API**: Get all products, search, filter, create (admin)
- ✅ **Cart API**: Get cart, add/update/remove items
- ✅ **Exchange API**: Get exchanges, search, create exchanges
- ✅ **Payment API**: Get orders, create orders
- ✅ **Admin API**: Dashboard, user management, activity logs
- ✅ **Server Health**: Response time, security headers

### Test Results

The test suite provides detailed feedback:
- **Total Tests**: 44
- **Success Rate**: 73% (32 passed, 12 failed)
- **Authentication**: 100% working with cookie-based auth
- **API Coverage**: All major endpoints tested

### Key Features Tested

1. **Cookie-based Authentication**: Secure JWT tokens stored in HTTP-only cookies
2. **Role-based Access Control**: Admin vs user permissions properly enforced
3. **API Security**: Protected routes return proper 401/403 responses
4. **Error Handling**: Graceful handling of missing routes and invalid requests
5. **Data Validation**: Input validation and error responses

## Project Structure

```
zippy-streetwear/
├── server.js              # Main server file
├── test.js               # Comprehensive API test suite
├── package.json          # Dependencies and scripts
├── modules/              # Server modules
│   ├── auth-server.js    # Authentication routes
│   ├── products-server.js # Product management
│   ├── cart-server.js    # Shopping cart functionality
│   ├── exchange-server.js # Clothing exchange system
│   ├── payment-server.js # Payment processing
│   └── persist_module.js # Data persistence
├── public/               # Static assets
│   ├── styles/           # CSS files
│   ├── scripts/          # JavaScript files
│   └── images/           # Image assets
└── README.md            # Project documentation
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin only)

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update cart item
- `DELETE /api/cart/remove` - Remove from cart

### Exchange
- `GET /api/exchanges` - Get all exchanges
- `POST /api/exchanges` - Create exchange
- `GET /api/exchanges/search` - Search exchanges

### Payments
- `GET /api/payment/orders` - Get user orders
- `POST /api/payment/orders` - Create order

### Admin
- `GET /api/admin/dashboard` - Admin dashboard
- `GET /api/admin/users` - Get all users
- `GET /api/admin/activity` - Get activity logs

## Security Features

- **HTTP-only Cookies**: JWT tokens stored securely in cookies
- **Role-based Access**: Admin and user permissions properly enforced
- **Input Validation**: Comprehensive validation for all user inputs
- **Error Handling**: Secure error responses without exposing internals
- **Session Management**: Automatic session timeout and cleanup

## Development

### Running Tests
```bash
# Run all tests
node test.js

# Run with custom base URL
TEST_BASE_URL=http://localhost:3000 node test.js
```

### Adding New Tests
The test suite is modular and easy to extend. To add new tests:

1. Create a new test function in `test.js`
2. Add it to the `runAllTests()` function
3. Follow the existing pattern for logging and error handling

### Test Categories
- **Public Routes**: Test unauthenticated access to public endpoints
- **Authentication**: Test login, registration, and token handling
- **Protected Routes**: Verify security for authenticated endpoints
- **API Functionality**: Test all CRUD operations
- **Admin Access**: Verify role-based permissions
- **Error Handling**: Test edge cases and error responses

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run the test suite: `node test.js`
5. Ensure all tests pass
6. Submit a pull request

## License

This project is created by Amit Cohen & Ariel Sinai.

---

**Note**: This is a comprehensive e-commerce platform with advanced features including clothing exchange, community features, and a modern cyberpunk-inspired UI. The test suite ensures all functionality works correctly and securely.
