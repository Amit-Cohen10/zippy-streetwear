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

// Process checkout
router.post('/checkout', requireAuth, async (req, res) => {
  try {
    const { 
      shippingAddress, 
      billingAddress, 
      paymentMethod, 
      cardNumber, 
      expiryDate, 
      cvv,
      rememberCard = false
    } = req.body;
    
    // Validate required fields
    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({ error: 'Shipping address and payment method are required' });
    }
    
    // Get user's cart
    const carts = await persist.readData(persist.cartsFile);
    const userCart = carts[req.user.id] || [];
    
    if (userCart.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }
    
    // Validate cart items
    const products = await persist.readData(persist.productsFile);
    const validationResults = [];
    let isValid = true;
    let total = 0;
    
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
      
      total += product.price * item.quantity;
    }
    
    if (!isValid) {
      return res.status(400).json({ 
        error: 'Cart validation failed',
        validationResults 
      });
    }
    
    // Mock payment processing
    const paymentResult = await processMockPayment({
      amount: total,
      cardNumber,
      expiryDate,
      cvv,
      paymentMethod
    });
    
    if (!paymentResult.success) {
      return res.status(400).json({ 
        error: 'Payment failed',
        message: paymentResult.message 
      });
    }
    
    // Create order
    const orders = await persist.readData(persist.ordersFile);
    const orderItems = userCart.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        productId: item.productId,
        title: product.title,
        price: product.price,
        quantity: item.quantity,
        size: item.size,
        brand: product.brand,
        image: product.images[0]
      };
    });
    
    const newOrder = {
      id: persist.generateId('order'),
      userId: req.user.id,
      items: orderItems,
      total: parseFloat(total.toFixed(2)),
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      paymentMethod,
      paymentId: paymentResult.paymentId,
      status: 'processing',
      trackingNumber: generateTrackingNumber(),
      createdAt: new Date().toISOString()
    };
    
    // Save order
    if (!orders[req.user.id]) {
      orders[req.user.id] = [];
    }
    orders[req.user.id].push(newOrder);
    await persist.writeData(persist.ordersFile, orders);
    
    // Update product stock
    for (const item of userCart) {
      const productIndex = products.findIndex(p => p.id === item.productId);
      if (productIndex !== -1) {
        products[productIndex].stock[item.size] -= item.quantity;
      }
    }
    await persist.writeData(persist.productsFile, products);
    
    // Clear cart
    carts[req.user.id] = [];
    await persist.writeData(persist.cartsFile, carts);
    
    // Log activity
    await persist.logActivity(req.user.id, 'order_placed', { 
      orderId: newOrder.id,
      total: newOrder.total,
      itemCount: orderItems.length
    });
    
    res.status(201).json({
      message: 'Order placed successfully',
      order: newOrder,
      paymentResult: {
        success: true,
        paymentId: paymentResult.paymentId
      }
    });
    
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Checkout failed' });
  }
});

// Get user's orders
router.get('/orders', requireAuth, async (req, res) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;
    
    const orders = await persist.readData(persist.ordersFile);
    let userOrders = orders[req.user.id] || [];
    
    // Filter by status
    if (status) {
      userOrders = userOrders.filter(order => order.status === status);
    }
    
    // Sort by creation date
    userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedOrders = userOrders.slice(startIndex, endIndex);
    
    res.json({
      orders: paginatedOrders,
      pagination: {
        total: userOrders.length,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(userOrders.length / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('Orders fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get order by ID
router.get('/orders/:orderId', requireAuth, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const orders = await persist.readData(persist.ordersFile);
    const userOrders = orders[req.user.id] || [];
    const order = userOrders.find(o => o.id === orderId);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json({ order });
    
  } catch (error) {
    console.error('Order fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Cancel order
router.post('/orders/:orderId/cancel', requireAuth, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const orders = await persist.readData(persist.ordersFile);
    const userOrders = orders[req.user.id] || [];
    const orderIndex = userOrders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const order = userOrders[orderIndex];
    
    // Check if order can be cancelled
    if (order.status === 'shipped' || order.status === 'delivered') {
      return res.status(400).json({ error: 'Order cannot be cancelled at this stage' });
    }
    
    // Update order status
    userOrders[orderIndex].status = 'cancelled';
    userOrders[orderIndex].cancelledAt = new Date().toISOString();
    
    orders[req.user.id] = userOrders;
    await persist.writeData(persist.ordersFile, orders);
    
    // Restore product stock
    const products = await persist.readData(persist.productsFile);
    for (const item of order.items) {
      const productIndex = products.findIndex(p => p.id === item.productId);
      if (productIndex !== -1) {
        products[productIndex].stock[item.size] += item.quantity;
      }
    }
    await persist.writeData(persist.productsFile, products);
    
    // Log activity
    await persist.logActivity(req.user.id, 'order_cancelled', { 
      orderId,
      total: order.total
    });
    
    res.json({
      message: 'Order cancelled successfully',
      order: userOrders[orderIndex]
    });
    
  } catch (error) {
    console.error('Order cancellation error:', error);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

// Get order tracking
router.get('/orders/:orderId/tracking', requireAuth, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const orders = await persist.readData(persist.ordersFile);
    const userOrders = orders[req.user.id] || [];
    const order = userOrders.find(o => o.id === orderId);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Generate mock tracking info
    const trackingInfo = generateTrackingInfo(order);
    
    res.json({ trackingInfo });
    
  } catch (error) {
    console.error('Tracking fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch tracking info' });
  }
});

// Mock payment processing function
async function processMockPayment(paymentData) {
  // Simulate payment processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock validation
  if (!paymentData.cardNumber || paymentData.cardNumber.length < 13) {
    return {
      success: false,
      message: 'Invalid card number'
    };
  }
  
  if (!paymentData.expiryDate || !paymentData.cvv) {
    return {
      success: false,
      message: 'Missing payment details'
    };
  }
  
  // Simulate random payment failures (5% chance)
  if (Math.random() < 0.05) {
    return {
      success: false,
      message: 'Payment declined. Please try again.'
    };
  }
  
  return {
    success: true,
    paymentId: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    message: 'Payment processed successfully'
  };
}

// Generate tracking number
function generateTrackingNumber() {
  const prefix = 'ZIPPY';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

// Generate mock tracking info
function generateTrackingInfo(order) {
  const statuses = ['processing', 'shipped', 'out_for_delivery', 'delivered'];
  const currentStatus = order.status;
  const statusIndex = statuses.indexOf(currentStatus);
  
  const trackingEvents = [
    {
      status: 'processing',
      description: 'Order confirmed and being prepared',
      timestamp: order.createdAt,
      location: 'Zippy Warehouse'
    }
  ];
  
  if (statusIndex >= 1) {
    trackingEvents.push({
      status: 'shipped',
      description: 'Package has been shipped',
      timestamp: new Date(Date.parse(order.createdAt) + 24 * 60 * 60 * 1000).toISOString(),
      location: 'Zippy Warehouse'
    });
  }
  
  if (statusIndex >= 2) {
    trackingEvents.push({
      status: 'out_for_delivery',
      description: 'Package is out for delivery',
      timestamp: new Date(Date.parse(order.createdAt) + 48 * 60 * 60 * 1000).toISOString(),
      location: 'Local Distribution Center'
    });
  }
  
  if (statusIndex >= 3) {
    trackingEvents.push({
      status: 'delivered',
      description: 'Package has been delivered',
      timestamp: new Date(Date.parse(order.createdAt) + 72 * 60 * 60 * 1000).toISOString(),
      location: order.shippingAddress.city || 'Delivery Address'
    });
  }
  
  return {
    trackingNumber: order.trackingNumber,
    status: currentStatus,
    events: trackingEvents,
    estimatedDelivery: new Date(Date.parse(order.createdAt) + 72 * 60 * 60 * 1000).toISOString()
  };
}

// Get all orders for user
router.get('/orders', requireAuth, async (req, res) => {
  try {
    // Read orders data
    const orders = await persist.readData(persist.ordersFile);
    const userOrders = orders.filter(o => o.userId === req.user.id);
    
    // Sort by most recent first
    userOrders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json(userOrders);
    
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get order details by ID
router.get('/order/:orderId', requireAuth, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Read orders data
    const orders = await persist.readData(persist.ordersFile);
    const order = orders.find(o => o.id === orderId && o.userId === req.user.id);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Return order details
    res.json(order);
    
  } catch (error) {
    console.error('Failed to fetch order:', error);
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
});

module.exports = router; 