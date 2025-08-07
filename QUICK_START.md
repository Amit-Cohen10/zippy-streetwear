# Zippy Streetwear - Quick Start Guide

## Admin Login
- **Username**: `admin`
- **Password**: `admin`
- **URL**: `http://localhost:3000/admin`

## Test Credit Card
- **Card Number**: `4111 1111 1111 1111`
- **Expiry**: `12/25`
- **CVV**: `123`
- **Name**: `Test User`

## Sample Products
- Neon Cyber Hoodie - $129.99
- Glitch Art Tee - $49.99
- Holographic Cargo Pants - $89.99
- Digital Camo Jacket - $159.99
- Neon Pulse Sweater - $79.99

## Quick Test Steps
1. Start server: `npm start`
2. Go to: `http://localhost:3000`
3. Login as admin: `admin` / `admin`
4. Browse products and add to cart
5. Checkout with test credit card
6. Test admin panel at `/admin`

## Important URLs
- Homepage: `/`
- Products: `/products`
- Admin Panel: `/admin`
- Exchange: `/exchange`
- Cart: `/cart`
- Checkout: `/checkout`

## Test User Registration
- Email: `test@example.com`
- Password: `password123`
- Any email/password works for testing

## Environment Setup
Create `.env` file:
```
PORT=3000
JWT_SECRET=zippy-secret-key
NODE_ENV=development
```

## Common Issues
- Port 3000 in use? Change PORT in .env
- Admin not working? Clear browser cache
- Payment failed? Use test credit card above
- Server won't start? Run `npm install`

## File Locations
- User data: `data/users/`
- Product data: `data/products/`
- Cart data: `data/carts/`
- Order data: `data/orders/`

That's it! Everything you need to test the application quickly.
