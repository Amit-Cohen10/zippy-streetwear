const express = require('express');
const persist = require('./persist_module');

const router = express.Router();

// Middleware to require authentication
const requireAuth = async (req, res, next) => {
  try {
    const user = await persist.getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication required' });
  }
};

// Get user's cart
router.get('/', requireAuth, async (req, res) => {
  try {
    const carts = await persist.readData(persist.cartsFile);
    const userCart = carts[req.user.id] || [];
    
    // Get product details for cart items
    const products = await persist.readData(persist.productsFile);
    const cartWithDetails = userCart.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        ...item,
        product: product ? {
          id: product.id,
          title: product.title,
          price: product.price,
          images: product.images,
          brand: product.brand
        } : null
      };
    }).filter(item => item.product); // Remove items with invalid products
    
    const total = cartWithDetails.reduce((sum, item) => 
      sum + (item.product.price * item.quantity), 0
    );
    
    res.json({
      items: cartWithDetails,
      total: parseFloat(total.toFixed(2)),
      itemCount: cartWithDetails.length
    });
    
  } catch (error) {
    console.error('Cart fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Add item to cart
router.post('/add', requireAuth, async (req, res) => {
  try {
    const { productId, quantity = 1, size } = req.body;
    
    if (!productId || !size) {
      return res.status(400).json({ error: 'Product ID and size are required' });
    }
    
    // Validate product exists and has stock
    const products = await persist.readData(persist.productsFile);
    const product = products.find(p => p.id === productId);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    if (!product.sizes.includes(size)) {
      return res.status(400).json({ error: 'Invalid size for this product' });
    }
    
    const stock = product.stock[size] || 0;
    if (stock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }
    
    // Get current cart
    const carts = await persist.readData(persist.cartsFile);
    const userCart = carts[req.user.id] || [];
    
    // Check if item already exists in cart
    const existingItemIndex = userCart.findIndex(item => 
      item.productId === productId && item.size === size
    );
    
    if (existingItemIndex !== -1) {
      // Update quantity
      const newQuantity = userCart[existingItemIndex].quantity + quantity;
      if (newQuantity > stock) {
        return res.status(400).json({ error: 'Insufficient stock for requested quantity' });
      }
      userCart[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      userCart.push({
        id: persist.generateId('cart-item'),
        productId,
        quantity,
        size,
        addedAt: new Date().toISOString()
      });
    }
    
    // Save updated cart
    carts[req.user.id] = userCart;
    await persist.writeData(persist.cartsFile, carts);
    
    // Log activity
    await persist.logActivity(req.user.id, 'cart_add', { 
      productId, 
      quantity, 
      size,
      productTitle: product.title
    });
    
    res.json({
      message: 'Item added to cart',
      cartItem: userCart.find(item => 
        item.productId === productId && item.size === size
      )
    });
    
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// Update cart item quantity
router.put('/update/:itemId', requireAuth, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    
    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Valid quantity is required' });
    }
    
    const carts = await persist.readData(persist.cartsFile);
    const userCart = carts[req.user.id] || [];
    
    const itemIndex = userCart.findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    
    // Validate stock
    const products = await persist.readData(persist.productsFile);
    const product = products.find(p => p.id === userCart[itemIndex].productId);
    const stock = product.stock[userCart[itemIndex].size] || 0;
    
    if (quantity > stock) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }
    
    userCart[itemIndex].quantity = quantity;
    userCart[itemIndex].updatedAt = new Date().toISOString();
    
    carts[req.user.id] = userCart;
    await persist.writeData(persist.cartsFile, carts);
    
    // Log activity
    await persist.logActivity(req.user.id, 'cart_update', { 
      itemId, 
      quantity,
      productTitle: product.title
    });
    
    res.json({
      message: 'Cart item updated',
      item: userCart[itemIndex]
    });
    
  } catch (error) {
    console.error('Cart update error:', error);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
});

// Remove item from cart
router.delete('/remove/:itemId', requireAuth, async (req, res) => {
  try {
    const { itemId } = req.params;
    
    const carts = await persist.readData(persist.cartsFile);
    const userCart = carts[req.user.id] || [];
    
    const itemIndex = userCart.findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    
    const removedItem = userCart[itemIndex];
    userCart.splice(itemIndex, 1);
    
    carts[req.user.id] = userCart;
    await persist.writeData(persist.cartsFile, carts);
    
    // Log activity
    await persist.logActivity(req.user.id, 'cart_remove', { 
      itemId, 
      productId: removedItem.productId,
      quantity: removedItem.quantity
    });
    
    res.json({
      message: 'Item removed from cart',
      removedItem
    });
    
  } catch (error) {
    console.error('Cart remove error:', error);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
});

// Clear entire cart
router.delete('/clear', requireAuth, async (req, res) => {
  try {
    const carts = await persist.readData(persist.cartsFile);
    const userCart = carts[req.user.id] || [];
    
    if (userCart.length === 0) {
      return res.json({ message: 'Cart is already empty' });
    }
    
    carts[req.user.id] = [];
    await persist.writeData(persist.cartsFile, carts);
    
    // Log activity
    await persist.logActivity(req.user.id, 'cart_clear', { 
      itemCount: userCart.length 
    });
    
    res.json({
      message: 'Cart cleared successfully',
      clearedItems: userCart.length
    });
    
  } catch (error) {
    console.error('Cart clear error:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

// Get cart summary (for mini cart)
router.get('/summary', requireAuth, async (req, res) => {
  try {
    const carts = await persist.readData(persist.cartsFile);
    const userCart = carts[req.user.id] || [];
    
    const products = await persist.readData(persist.productsFile);
    const cartWithDetails = userCart.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        ...item,
        product: product ? {
          id: product.id,
          title: product.title,
          price: product.price,
          images: product.images
        } : null
      };
    }).filter(item => item.product);
    
    const total = cartWithDetails.reduce((sum, item) => 
      sum + (item.product.price * item.quantity), 0
    );
    
    res.json({
      itemCount: cartWithDetails.length,
      total: parseFloat(total.toFixed(2)),
      items: cartWithDetails.slice(0, 3) // Show only first 3 items in summary
    });
    
  } catch (error) {
    console.error('Cart summary error:', error);
    res.status(500).json({ error: 'Failed to get cart summary' });
  }
});

// Validate cart before checkout
router.get('/validate', requireAuth, async (req, res) => {
  try {
    const carts = await persist.readData(persist.cartsFile);
    const userCart = carts[req.user.id] || [];
    
    if (userCart.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }
    
    const products = await persist.readData(persist.productsFile);
    const validationResults = [];
    let isValid = true;
    
    for (const item of userCart) {
      const product = products.find(p => p.id === item.productId);
      
      if (!product) {
        validationResults.push({
          itemId: item.id,
          error: 'Product no longer available'
        });
        isValid = false;
        continue;
      }
      
      const stock = product.stock[item.size] || 0;
      if (stock < item.quantity) {
        validationResults.push({
          itemId: item.id,
          error: `Insufficient stock. Available: ${stock}`
        });
        isValid = false;
      }
      
      if (!product.sizes.includes(item.size)) {
        validationResults.push({
          itemId: item.id,
          error: 'Size no longer available'
        });
        isValid = false;
      }
    }
    
    res.json({
      isValid,
      validationResults,
      itemCount: userCart.length
    });
    
  } catch (error) {
    console.error('Cart validation error:', error);
    res.status(500).json({ error: 'Failed to validate cart' });
  }
});

module.exports = router; 