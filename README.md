# Zippy Streetwear - Futuristic E-commerce Platform

## Store Name
Zippy Streetwear - Futuristic E-commerce Platform with Clothing Exchange

## What are you selling?
We sell premium streetwear clothing like hoodies, t-shirts, and pants with a unique cyberpunk style. Our platform has both regular online shopping and a cool clothing exchange system where users can trade items with each other. We focus on futuristic designs with neon colors, inspired by brands like Stussy and Jin G, and we care about sustainability through our exchange feature.

## What additional page(s) did you add? How to operate it?
I added 8 extra pages beyond the basic requirements:

1. Exchange Hub (/exchange) - Users can browse exchanges, create new offers, and chat with other users to negotiate trades. The system finds good matches based on what people want to trade.

2. Community Feed (/community) - A social page where users can share their outfits, get style inspiration, and connect with other fashion lovers through ratings and reviews.

3. Brand Stories (/brands) - Shows featured streetwear brands with their history and philosophy. Also includes a guide to spot fake products.

4. Style Guide (/style-guide) - A comprehensive fashion resource with streetwear tips, size guides for different brands, care instructions, and an interactive outfit builder tool. Users can mix and match different pieces to create complete looks and get personalized style recommendations.

5. Sustainability (/sustainability) - Shows environmental impact, comparing buying new clothes vs exchanging them. Includes a carbon footprint calculator and recycling stats.

6. User Dashboard (/dashboard) - Your personal hub showing your orders, exchanges, wishlist, and profile settings with activity tracking.

7. My Items (/my-items) - A detailed page showing all items you've purchased and exchanged. Users can view their purchase history, track order status, see exchange history, and manage their wardrobe. The page includes order details, shipping information, and exchange status updates.

8. Wishlist (/wishlist) - A personalized page where users can save items they want to buy later. Users can add products to their wishlist, organize them by categories, set price alerts, and easily move items to their cart when ready to purchase.

9. Admin Panel (/admin) - A comprehensive admin interface with real-time user activity monitoring, product management, and analytics dashboard.

## What was hard to do?

The most challenging parts of this project were:

1. Authentication System - Making the login system work with different token expiration times (12 days for "Remember Me" vs 30 minutes for regular sessions) was really tricky. I had to carefully manage tokens and create middleware.

2. Exchange System Algorithm - Building the matching algorithm for clothing exchanges was super complex. I had to think about many factors like category compatibility, brand matching, size availability, price ranges, and user ratings to calculate good matches.

3. File-based Database - Creating a reliable data storage system using JSON files instead of a real database was challenging. I had to handle multiple users accessing data at the same time, validate data, and recover from errors.

4. Real-time Messaging - Making the chat system for exchange negotiations work was hard. I had to manage message threads, user notifications, and real-time updates without using WebSockets.

5. Shopping Cart - Making the cart save between sessions while checking stock and size availability was tricky, especially with the file-based storage.

6. Payment Processing - Creating a fake payment system that validates credit card info, processes transactions, and generates order confirmations required lots of error handling.

7. Admin Panel Updates - Building the admin dashboard with live activity monitoring and user management needed efficient data polling and state management.

8. CSS Animation Performance - The cyberpunk design with neon effects and smooth animations caused performance problems on mobile devices. I had to do lots of CSS optimizations and use hardware acceleration.

9. Responsive Design - Making the futuristic design work on all devices while keeping the cyberpunk look was difficult, especially with complex grid layouts.

10. Security Features - Adding comprehensive security including rate limiting, input validation, XSS protection, and CSRF tokens required careful thinking about attack methods.

11. Error Handling - Creating good error handling for all API endpoints while giving users helpful feedback was complex, especially for the exchange system.

12. Data Synchronization - Keeping user data, cart items, and exchange status synchronized across different modules required careful state management.

13. Image Loading - Handling product images with fallbacks and optimizing loading performance while keeping good visual quality was challenging.

14. Cross-browser Compatibility - Making sure the futuristic design and animations work the same way across different browsers required lots of testing and polyfills.

15. Testing Strategy - Creating a comprehensive test suite that covers all functionality including edge cases for the exchange system and payment processing took a long time.

## Who is your partner? Name and ID. What did you do? What did your partner do?

Amit Cohen (ID: 318556016) - I worked on the core architecture and backend development. I built the server using Node.js and Express, made the authentication system with JWT tokens and bcrypt password hashing, created the modular server structure with separate modules for different functions, and built the file-based database system using JSON files. I also handled security including rate limiting, input validation, and DOS attack protection. I wrote lots of JavaScript code for frontend features like product browsing with real-time search and filtering, shopping cart management with persistent storage, exchange system interface with matching algorithms, admin panel with real-time activity monitoring, payment processing forms with validation, user dashboard with order tracking, and comprehensive error handling for all user interactions. I made the dark mode toggle using localStorage and created smooth animations throughout the app.

Ariel Sinai (ID: 322270935) - Ariel worked on the frontend design and user experience. She created the cyberpunk-inspired visual design with neon color schemes, made the responsive CSS layouts, built the interactive JavaScript components for product browsing and cart management, and developed the user interface animations and transitions. Ariel also handled the client-side data management and localStorage implementation for user preferences. She designed the product card layouts and implemented the filtering system for the product catalog. Ariel created the checkout form design and implemented the payment form validation on the frontend side. She also worked on the mobile responsiveness and ensured the design looked great on all screen sizes.

Collaborative Work - We worked together on many parts of the project. For the exchange system, Amit handled the backend matching algorithm while Ariel developed the frontend exchange interface and chat system. We collaborated on the admin panel where Amit built the server-side activity monitoring and Ariel created the admin dashboard interface with real-time updates. We developed the testing strategy together, with Amit focusing on server-side tests and Ariel handling frontend testing scenarios.

We worked together on the product catalog, where Amit handled the backend filtering and search while Ariel designed the product cards and implemented the frontend filtering interface. For the shopping cart, Amit built the backend persistence system while Ariel created the cart UI and animations. We also collaborated on the user dashboard, where Amit handled the data fetching and Ariel designed the dashboard layout and user profile interface.

The payment system was a joint effort where Amit built the backend validation and Ariel created the payment form design and frontend validation. We worked together on the wishlist feature, where Amit handled the backend storage while Ariel designed the wishlist interface and animations. For the my-items page, Amit built the order history system while Ariel created the layout and order tracking interface.

We also collaborated on the community feed, where Amit handled the backend post system while Ariel designed the social interface and user interaction features. We worked together on the sustainability page, where Amit built the environmental impact calculations and Ariel created the visual charts and interactive elements. For the style guide, Amit developed the outfit recommendation algorithm while Ariel designed the interactive outfit builder interface.

## Specify all the different routes your app supports

Public Routes:
- GET / - Homepage with featured products and exchange preview
- GET /readme.html - Project documentation
- GET /llm.html - LLM-generated code documentation

Authentication Routes:
- POST /api/auth/register - User registration with email validation
- POST /api/auth/login - User login with JWT token generation
- POST /api/auth/logout - User logout and token invalidation
- GET /api/auth/verify-token - Token validation endpoint

Protected User Routes:
- GET /products - Product catalog with search and filtering
- GET /product/:id - Individual product details
- GET /exchange - Exchange marketplace
- GET /community - Community feed and social features
- GET /brands - Brand showcase and authentication guide
- GET /style-guide - Fashion tips and size guides
- GET /sustainability - Environmental impact metrics
- GET /dashboard - User dashboard and profile
- GET /cart - Shopping cart management
- GET /my-items - User's purchased and exchanged items
- GET /checkout - Multi-step checkout process
- GET /thank-you - Order confirmation page
- GET /wishlist - Saved items for later

API Routes:
- GET /api/products - Get all products with filtering
- POST /api/products - Add new product (admin only)
- PUT /api/products/:id - Update product (admin only)
- DELETE /api/products/:id - Delete product (admin only)
- GET /api/cart - Get user's cart
- POST /api/cart/add - Add item to cart
- PUT /api/cart/update/:id - Update cart item quantity
- DELETE /api/cart/remove/:id - Remove item from cart
- GET /api/exchanges - Get all exchanges
- POST /api/exchanges/create - Create new exchange
- PUT /api/exchanges/:id - Update exchange status
- POST /api/exchanges/:id/message - Send exchange message
- POST /api/payment/checkout - Process payment and create order
- GET /api/admin/activity - Get user activity logs (admin only)
- GET /api/admin/users - Get all users (admin only)
- POST /api/admin/products - Admin product management

## Explain how did you test it

I created a comprehensive testing strategy using a custom test suite in test.js that covers all major functionality:

Authentication Testing:
- User registration with email validation
- Password hashing with bcrypt
- JWT token generation and verification
- Remember Me functionality (12-day vs 30-minute tokens)
- Logout and token invalidation
- Default admin account creation

Product Management Testing:
- Product creation, reading, updating, and deletion
- Product listing with pagination
- Real-time search functionality
- Advanced filtering by category, brand, price, and size
- Stock management and validation
- Product image handling

Shopping Cart Testing:
- Add to cart functionality with authentication
- Cart persistence across sessions
- Quantity updates and item removal
- Stock validation before checkout
- Mini cart dropdown functionality
- Cart clearing and summary calculation

Exchange System Testing:
- Exchange creation and listing
- Matching algorithm accuracy
- Exchange filtering and search
- In-app messaging system
- Exchange rating and trust building
- Exchange history tracking

Payment Processing Testing:
- Multi-step checkout flow
- Credit card validation
- Order creation and confirmation
- Payment error handling
- Order tracking number generation

Admin Panel Testing:
- User activity monitoring
- Product management operations
- User account management
- Analytics dashboard functionality
- System health monitoring

Security Testing:
- Rate limiting implementation
- Input validation and sanitization
- XSS protection
- CSRF token validation
- Password strength requirements

Performance Testing:
- File system operations
- Database read/write operations
- API response times
- Memory usage optimization
- Concurrent user handling

The test suite runs automatically and shows detailed feedback on each test category, displaying pass/fail status and specific error details. It covers over 50 individual test cases across 8 major categories, making sure everything works properly.
