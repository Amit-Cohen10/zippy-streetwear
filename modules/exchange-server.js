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

// Get all exchanges with filtering
router.get('/', async (req, res) => {
  try {
    const { 
      status, 
      category, 
      brand, 
      size, 
      userId,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      limit = 20,
      page = 1
    } = req.query;
    
    let exchanges = await persist.readData(persist.exchangesFile);
    
    // Filter by status
    if (status) {
      exchanges = exchanges.filter(exchange => exchange.status === status);
    }
    
    // Filter by user
    if (userId) {
      exchanges = exchanges.filter(exchange => 
        exchange.initiatorId === userId || exchange.recipientId === userId
      );
    }
    
    // Get product details for filtering
    const products = await persist.readData(persist.productsFile);
    
    // Filter by category/brand/size (check offered and requested items)
    if (category || brand || size) {
      exchanges = exchanges.filter(exchange => {
        const allProductIds = [
          ...exchange.offeredItems,
          ...exchange.requestedItems
        ];
        
        const relevantProducts = products.filter(p => allProductIds.includes(p.id));
        
        if (category) {
          const hasCategory = relevantProducts.some(p => p.category === category);
          if (!hasCategory) return false;
        }
        
        if (brand) {
          const hasBrand = relevantProducts.some(p => p.brand.toLowerCase().includes(brand.toLowerCase()));
          if (!hasBrand) return false;
        }
        
        if (size) {
          const hasSize = relevantProducts.some(p => p.sizes.includes(size.toUpperCase()));
          if (!hasSize) return false;
        }
        
        return true;
      });
    }
    
    // Sorting
    exchanges.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedExchanges = exchanges.slice(startIndex, endIndex);
    
    // Get user details for exchanges
    const users = await persist.readData(persist.usersFile);
    
    const exchangesWithDetails = paginatedExchanges.map(exchange => {
      const initiator = users.find(u => u.id === exchange.initiatorId);
      const recipient = users.find(u => u.id === exchange.recipientId);
      
      const offeredProducts = products.filter(p => exchange.offeredItems.includes(p.id));
      const requestedProducts = products.filter(p => exchange.requestedItems.includes(p.id));
      
      return {
        ...exchange,
        initiator: initiator ? {
          id: initiator.id,
          username: initiator.username,
          profile: initiator.profile
        } : null,
        recipient: recipient ? {
          id: recipient.id,
          username: recipient.username,
          profile: recipient.profile
        } : null,
        offeredProducts,
        requestedProducts
      };
    });
    
    res.json({
      exchanges: exchangesWithDetails,
      pagination: {
        total: exchanges.length,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(exchanges.length / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('Exchanges fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch exchanges' });
  }
});

// Get exchange by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const exchanges = await persist.readData(persist.exchangesFile);
    const exchange = exchanges.find(e => e.id === id);
    
    if (!exchange) {
      return res.status(404).json({ error: 'Exchange not found' });
    }
    
    const users = await persist.readData(persist.usersFile);
    const products = await persist.readData(persist.productsFile);
    
    const initiator = users.find(u => u.id === exchange.initiatorId);
    const recipient = users.find(u => u.id === exchange.recipientId);
    
    const offeredProducts = products.filter(p => exchange.offeredItems.includes(p.id));
    const requestedProducts = products.filter(p => exchange.requestedItems.includes(p.id));
    
    const exchangeWithDetails = {
      ...exchange,
      initiator: initiator ? {
        id: initiator.id,
        username: initiator.username,
        profile: initiator.profile
      } : null,
      recipient: recipient ? {
        id: recipient.id,
        username: recipient.username,
        profile: recipient.profile
      } : null,
      offeredProducts,
      requestedProducts
    };
    
    res.json({ exchange: exchangeWithDetails });
    
  } catch (error) {
    console.error('Exchange fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch exchange' });
  }
});

// Create new exchange
router.post('/create', requireAuth, async (req, res) => {
  try {
    const { recipientId, offeredItems, requestedItems, message } = req.body;
    
    if (!recipientId || !offeredItems || !requestedItems) {
      return res.status(400).json({ error: 'Recipient, offered items, and requested items are required' });
    }
    
    if (offeredItems.length === 0 || requestedItems.length === 0) {
      return res.status(400).json({ error: 'Must offer and request at least one item each' });
    }
    
    // Validate recipient exists
    const users = await persist.readData(persist.usersFile);
    const recipient = users.find(u => u.id === recipientId);
    
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }
    
    if (recipient.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot create exchange with yourself' });
    }
    
    // Validate products exist and are exchangeable
    const products = await persist.readData(persist.productsFile);
    
    const allItems = [...offeredItems, ...requestedItems];
    for (const itemId of allItems) {
      const product = products.find(p => p.id === itemId);
      if (!product) {
        return res.status(404).json({ error: `Product ${itemId} not found` });
      }
      if (!product.exchangeable) {
        return res.status(400).json({ error: `Product ${product.title} is not available for exchange` });
      }
    }
    
    // Check if exchange already exists
    const exchanges = await persist.readData(persist.exchangesFile);
    const existingExchange = exchanges.find(e => 
      e.initiatorId === req.user.id && 
      e.recipientId === recipientId &&
      e.status === 'pending'
    );
    
    if (existingExchange) {
      return res.status(400).json({ error: 'Exchange request already exists with this user' });
    }
    
    // Create new exchange
    const newExchange = {
      id: persist.generateId('exchange'),
      initiatorId: req.user.id,
      recipientId,
      offeredItems,
      requestedItems,
      status: 'pending',
      messages: message ? [{
        userId: req.user.id,
        message,
        timestamp: new Date().toISOString()
      }] : [],
      createdAt: new Date().toISOString()
    };
    
    exchanges.push(newExchange);
    await persist.writeData(persist.exchangesFile, exchanges);
    
    // Log activity
    await persist.logActivity(req.user.id, 'exchange_create', { 
      exchangeId: newExchange.id,
      recipientId,
      offeredItems: offeredItems.length,
      requestedItems: requestedItems.length
    });
    
    res.status(201).json({
      message: 'Exchange created successfully',
      exchange: newExchange
    });
    
  } catch (error) {
    console.error('Exchange creation error:', error);
    res.status(500).json({ error: 'Failed to create exchange' });
  }
});

// Update exchange status
router.put('/:id/status', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rating, review } = req.body;
    
    if (!['accepted', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const exchanges = await persist.readData(persist.exchangesFile);
    const exchangeIndex = exchanges.findIndex(e => e.id === id);
    
    if (exchangeIndex === -1) {
      return res.status(404).json({ error: 'Exchange not found' });
    }
    
    const exchange = exchanges[exchangeIndex];
    
    // Check if user is authorized to update this exchange
    if (exchange.recipientId !== req.user.id && exchange.initiatorId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this exchange' });
    }
    
    // Only recipient can accept/reject, both can mark as completed
    if (status === 'accepted' || status === 'rejected') {
      if (exchange.recipientId !== req.user.id) {
        return res.status(403).json({ error: 'Only recipient can accept or reject exchanges' });
      }
    }
    
    // Update exchange
    exchanges[exchangeIndex].status = status;
    exchanges[exchangeIndex].updatedAt = new Date().toISOString();
    
    // Add rating and review if provided
    if (status === 'completed' && rating && review) {
      const users = await persist.readData(persist.usersFile);
      const targetUserId = req.user.id === exchange.initiatorId ? exchange.recipientId : exchange.initiatorId;
      const userIndex = users.findIndex(u => u.id === targetUserId);
      
      if (userIndex !== -1) {
        // Update user's exchange rating
        const currentRating = users[userIndex].profile.exchangeRating || 0;
        const ratingCount = users[userIndex].profile.ratingCount || 0;
        const newRating = ((currentRating * ratingCount) + rating) / (ratingCount + 1);
        
        users[userIndex].profile.exchangeRating = parseFloat(newRating.toFixed(1));
        users[userIndex].profile.ratingCount = (ratingCount || 0) + 1;
        
        await persist.writeData(persist.usersFile, users);
      }
      
      exchanges[exchangeIndex].rating = {
        rating,
        review,
        ratedBy: req.user.id,
        ratedAt: new Date().toISOString()
      };
    }
    
    await persist.writeData(persist.exchangesFile, exchanges);
    
    // Log activity
    await persist.logActivity(req.user.id, 'exchange_status_update', { 
      exchangeId: id,
      status,
      rating: rating || null
    });
    
    res.json({
      message: `Exchange ${status}`,
      exchange: exchanges[exchangeIndex]
    });
    
  } catch (error) {
    console.error('Exchange status update error:', error);
    res.status(500).json({ error: 'Failed to update exchange status' });
  }
});

// Send message in exchange
router.post('/:id/message', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const exchanges = await persist.readData(persist.exchangesFile);
    const exchangeIndex = exchanges.findIndex(e => e.id === id);
    
    if (exchangeIndex === -1) {
      return res.status(404).json({ error: 'Exchange not found' });
    }
    
    const exchange = exchanges[exchangeIndex];
    
    // Check if user is part of this exchange
    if (exchange.initiatorId !== req.user.id && exchange.recipientId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to send message in this exchange' });
    }
    
    // Add message
    const newMessage = {
      userId: req.user.id,
      message: message.trim(),
      timestamp: new Date().toISOString()
    };
    
    exchanges[exchangeIndex].messages.push(newMessage);
    await persist.writeData(persist.exchangesFile, exchanges);
    
    // Log activity
    await persist.logActivity(req.user.id, 'exchange_message', { 
      exchangeId: id,
      messageLength: message.length
    });
    
    res.json({
      message: 'Message sent successfully',
      newMessage
    });
    
  } catch (error) {
    console.error('Exchange message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get user's exchanges
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;
    
    const exchanges = await persist.readData(persist.exchangesFile);
    let userExchanges = exchanges.filter(e => 
      e.initiatorId === userId || e.recipientId === userId
    );
    
    if (status) {
      userExchanges = userExchanges.filter(e => e.status === status);
    }
    
    // Sort by creation date
    userExchanges.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Get product and user details
    const products = await persist.readData(persist.productsFile);
    const users = await persist.readData(persist.usersFile);
    
    const exchangesWithDetails = userExchanges.map(exchange => {
      const initiator = users.find(u => u.id === exchange.initiatorId);
      const recipient = users.find(u => u.id === exchange.recipientId);
      
      const offeredProducts = products.filter(p => exchange.offeredItems.includes(p.id));
      const requestedProducts = products.filter(p => exchange.requestedItems.includes(p.id));
      
      return {
        ...exchange,
        initiator: initiator ? {
          id: initiator.id,
          username: initiator.username,
          profile: initiator.profile
        } : null,
        recipient: recipient ? {
          id: recipient.id,
          username: recipient.username,
          profile: recipient.profile
        } : null,
        offeredProducts,
        requestedProducts
      };
    });
    
    res.json({ exchanges: exchangesWithDetails });
    
  } catch (error) {
    console.error('User exchanges fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch user exchanges' });
  }
});

// Get exchange statistics
router.get('/stats/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const exchanges = await persist.readData(persist.exchangesFile);
    
    const userExchanges = exchanges.filter(e => 
      e.initiatorId === userId || e.recipientId === userId
    );
    
    const stats = {
      total: userExchanges.length,
      pending: userExchanges.filter(e => e.status === 'pending').length,
      accepted: userExchanges.filter(e => e.status === 'accepted').length,
      completed: userExchanges.filter(e => e.status === 'completed').length,
      rejected: userExchanges.filter(e => e.status === 'rejected').length,
      initiated: userExchanges.filter(e => e.initiatorId === userId).length,
      received: userExchanges.filter(e => e.recipientId === userId).length
    };
    
    res.json({ stats });
    
  } catch (error) {
    console.error('Exchange stats error:', error);
    res.status(500).json({ error: 'Failed to fetch exchange statistics' });
  }
});

module.exports = router; 