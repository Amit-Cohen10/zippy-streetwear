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

// Validation middleware for exchange creation
const validateExchangeOffer = (req, res, next) => {
  const { recipientId, offeredItems, requestedItems, message } = req.body;
  
  if (!recipientId) {
    return res.status(400).json({ error: 'Recipient ID is required' });
  }
  
  if (!Array.isArray(offeredItems) || offeredItems.length === 0) {
    return res.status(400).json({ error: 'Must offer at least one item' });
  }
  
  if (!Array.isArray(requestedItems) || requestedItems.length === 0) {
    return res.status(400).json({ error: 'Must request at least one item' });
  }
  
  if (message && message.trim().length > 500) {
    return res.status(400).json({ error: 'Message must be less than 500 characters' });
  }
  
  next();
};

// Matching algorithm to find potential exchanges
const findPotentialMatches = async (userId, productId) => {
  const exchanges = await persist.readData(persist.exchangesFile);
  const products = await persist.readData(persist.productsFile);
  const users = await persist.readData(persist.usersFile);
  
  const currentProduct = products.find(p => p.id === productId);
  if (!currentProduct) return [];
  
  const potentialMatches = [];
  
  // Find exchanges where someone is offering the current product
  const relevantExchanges = exchanges.filter(e => 
    e.status === 'pending' && 
    e.requestedItems.includes(productId) &&
    e.initiatorId !== userId
  );
  
  for (const exchange of relevantExchanges) {
    const initiator = users.find(u => u.id === exchange.initiatorId);
    const offeredProducts = products.filter(p => exchange.offeredItems.includes(p.id));
    
    // Calculate match score based on various factors
    let matchScore = 0;
    
    // Category match (higher score for same category)
    const categoryMatch = offeredProducts.some(p => p.category === currentProduct.category);
    if (categoryMatch) matchScore += 30;
    
    // Brand match
    const brandMatch = offeredProducts.some(p => p.brand === currentProduct.brand);
    if (brandMatch) matchScore += 20;
    
    // Size match
    const sizeMatch = offeredProducts.some(p => 
      p.sizes.some(size => currentProduct.sizes.includes(size))
    );
    if (sizeMatch) matchScore += 15;
    
    // Price range match (within 20% difference)
    const priceMatch = offeredProducts.some(p => {
      const priceDiff = Math.abs(p.price - currentProduct.price) / currentProduct.price;
      return priceDiff <= 0.2;
    });
    if (priceMatch) matchScore += 25;
    
    // User rating (higher rating = higher score)
    const userRating = initiator.profile.exchangeRating || 0;
    matchScore += userRating * 2;
    
    potentialMatches.push({
      exchange,
      initiator,
      offeredProducts,
      matchScore,
      reasons: {
        categoryMatch,
        brandMatch,
        sizeMatch,
        priceMatch,
        userRating
      }
    });
  }
  
  // Sort by match score (highest first)
  return potentialMatches.sort((a, b) => b.matchScore - a.matchScore);
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

// Find potential matches for a product
router.get('/matches/:productId', requireAuth, async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 10 } = req.query;
    
    const matches = await findPotentialMatches(req.user.id, productId);
    const limitedMatches = matches.slice(0, parseInt(limit));
    
    res.json({
      matches: limitedMatches,
      total: matches.length
    });
    
  } catch (error) {
    console.error('Match finding error:', error);
    res.status(500).json({ error: 'Failed to find matches' });
  }
});

// Get exchange recommendations for user
router.get('/recommendations/user', requireAuth, async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const exchanges = await persist.readData(persist.exchangesFile);
    const products = await persist.readData(persist.productsFile);
    const users = await persist.readData(persist.usersFile);
    
    // Get user's exchangeable products
    const userProducts = products.filter(p => 
      p.exchangeable && p.ownerId === req.user.id
    );
    
    const recommendations = [];
    
    for (const product of userProducts) {
      const matches = await findPotentialMatches(req.user.id, product.id);
      if (matches.length > 0) {
        recommendations.push({
          product,
          topMatch: matches[0],
          matchCount: matches.length
        });
      }
    }
    
    // Sort by match count and score
    recommendations.sort((a, b) => {
      if (a.matchCount !== b.matchCount) {
        return b.matchCount - a.matchCount;
      }
      return b.topMatch.matchScore - a.topMatch.matchScore;
    });
    
    res.json({
      recommendations: recommendations.slice(0, parseInt(limit)),
      total: recommendations.length
    });
    
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Create new exchange
router.post('/create', requireAuth, validateExchangeOffer, async (req, res) => {
  try {
    const { recipientId, offeredItems, requestedItems, message } = req.body;
    
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
        message: message.trim(),
        timestamp: new Date().toISOString()
      }] : [],
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
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
    const { status, rating, review, reason } = req.body;
    
    if (!['accepted', 'rejected', 'completed', 'cancelled'].includes(status)) {
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
    
    // Only recipient can accept/reject, both can mark as completed/cancelled
    if (status === 'accepted' || status === 'rejected') {
      if (exchange.recipientId !== req.user.id) {
        return res.status(403).json({ error: 'Only recipient can accept or reject exchanges' });
      }
    }
    
    // Update exchange
    exchanges[exchangeIndex].status = status;
    exchanges[exchangeIndex].updatedAt = new Date().toISOString();
    exchanges[exchangeIndex].lastActivity = new Date().toISOString();
    
    if (reason) {
      exchanges[exchangeIndex].statusReason = reason;
    }
    
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
      rating: rating || null,
      reason: reason || null
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
    
    if (message.trim().length > 500) {
      return res.status(400).json({ error: 'Message must be less than 500 characters' });
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
    
    // Check if exchange is still active
    if (exchange.status === 'completed' || exchange.status === 'cancelled') {
      return res.status(400).json({ error: 'Cannot send messages to completed or cancelled exchanges' });
    }
    
    // Add message
    const newMessage = {
      id: persist.generateId('msg'),
      userId: req.user.id,
      message: message.trim(),
      timestamp: new Date().toISOString()
    };
    
    exchanges[exchangeIndex].messages.push(newMessage);
    exchanges[exchangeIndex].lastActivity = new Date().toISOString();
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

// Get exchange messages
router.get('/:id/messages', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50, before } = req.query;
    
    const exchanges = await persist.readData(persist.exchangesFile);
    const exchange = exchanges.find(e => e.id === id);
    
    if (!exchange) {
      return res.status(404).json({ error: 'Exchange not found' });
    }
    
    // Check if user is part of this exchange
    if (exchange.initiatorId !== req.user.id && exchange.recipientId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to view messages in this exchange' });
    }
    
    let messages = exchange.messages || [];
    
    // Filter by timestamp if 'before' is provided
    if (before) {
      messages = messages.filter(m => new Date(m.timestamp) < new Date(before));
    }
    
    // Limit messages
    messages = messages.slice(-parseInt(limit));
    
    // Get user details for messages
    const users = await persist.readData(persist.usersFile);
    const messagesWithUsers = messages.map(msg => {
      const user = users.find(u => u.id === msg.userId);
      return {
        ...msg,
        user: user ? {
          id: user.id,
          username: user.username,
          profile: user.profile
        } : null
      };
    });
    
    res.json({
      messages: messagesWithUsers,
      total: exchange.messages ? exchange.messages.length : 0
    });
    
  } catch (error) {
    console.error('Exchange messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Get user's exchanges
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, limit = 20, page = 1 } = req.query;
    
    const exchanges = await persist.readData(persist.exchangesFile);
    let userExchanges = exchanges.filter(e => 
      e.initiatorId === userId || e.recipientId === userId
    );
    
    if (status) {
      userExchanges = userExchanges.filter(e => e.status === status);
    }
    
    // Sort by last activity
    userExchanges.sort((a, b) => new Date(b.lastActivity || b.createdAt) - new Date(a.lastActivity || a.createdAt));
    
    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedExchanges = userExchanges.slice(startIndex, endIndex);
    
    // Get product and user details
    const products = await persist.readData(persist.productsFile);
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
        total: userExchanges.length,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(userExchanges.length / parseInt(limit))
      }
    });
    
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
      cancelled: userExchanges.filter(e => e.status === 'cancelled').length,
      initiated: userExchanges.filter(e => e.initiatorId === userId).length,
      received: userExchanges.filter(e => e.recipientId === userId).length,
      successRate: userExchanges.length > 0 ? 
        ((userExchanges.filter(e => e.status === 'completed').length / userExchanges.length) * 100).toFixed(1) : 0
    };
    
    res.json({ stats });
    
  } catch (error) {
    console.error('Exchange stats error:', error);
    res.status(500).json({ error: 'Failed to fetch exchange statistics' });
  }
});

// Get exchange notifications for user
router.get('/notifications/user', requireAuth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const exchanges = await persist.readData(persist.exchangesFile);
    const userExchanges = exchanges.filter(e => 
      (e.initiatorId === req.user.id || e.recipientId === req.user.id) &&
      e.status === 'pending'
    );
    
    // Sort by last activity
    userExchanges.sort((a, b) => new Date(b.lastActivity || b.createdAt) - new Date(a.lastActivity || a.createdAt));
    
    const notifications = userExchanges.slice(0, parseInt(limit)).map(exchange => {
      const isInitiator = exchange.initiatorId === req.user.id;
      const otherUserId = isInitiator ? exchange.recipientId : exchange.initiatorId;
      
      return {
        id: exchange.id,
        type: isInitiator ? 'sent' : 'received',
        status: exchange.status,
        lastActivity: exchange.lastActivity || exchange.createdAt,
        unreadMessages: exchange.messages ? 
          exchange.messages.filter(m => 
            m.userId !== req.user.id && 
            new Date(m.timestamp) > new Date(exchange.lastRead?.[req.user.id] || 0)
          ).length : 0
      };
    });
    
    res.json({ notifications });
    
  } catch (error) {
    console.error('Notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark exchange messages as read
router.put('/:id/read', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const exchanges = await persist.readData(persist.exchangesFile);
    const exchangeIndex = exchanges.findIndex(e => e.id === id);
    
    if (exchangeIndex === -1) {
      return res.status(404).json({ error: 'Exchange not found' });
    }
    
    const exchange = exchanges[exchangeIndex];
    
    // Check if user is part of this exchange
    if (exchange.initiatorId !== req.user.id && exchange.recipientId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to mark messages as read' });
    }
    
    // Mark as read
    if (!exchange.lastRead) {
      exchange.lastRead = {};
    }
    exchange.lastRead[req.user.id] = new Date().toISOString();
    
    await persist.writeData(persist.exchangesFile, exchanges);
    
    res.json({ message: 'Messages marked as read' });
    
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

// Get user's exchanges
router.get('/user', requireAuth, async (req, res) => {
  try {
    const { status, limit = 20 } = req.query;
    
    const exchanges = await persist.readData(persist.exchangesFile);
    let userExchanges = exchanges.filter(e => 
      e.initiatorId === req.user.id || e.recipientId === req.user.id
    );
    
    // Filter by status if provided
    if (status && status !== 'all') {
      userExchanges = userExchanges.filter(e => e.status === status);
    }
    
    // Sort by creation date (newest first)
    userExchanges.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Limit results
    userExchanges = userExchanges.slice(0, parseInt(limit));
    
    // Get user details for exchanges
    const users = await persist.readData(persist.usersFile);
    const exchangesWithUsers = userExchanges.map(exchange => {
      const isInitiator = exchange.initiatorId === req.user.id;
      const otherUserId = isInitiator ? exchange.recipientId : exchange.initiatorId;
      const otherUser = users.find(u => u.id === otherUserId);
      
      return {
        id: exchange.id,
        title: exchange.title || `Exchange #${exchange.id}`,
        status: exchange.status,
        createdAt: exchange.createdAt,
        lastActivity: exchange.lastActivity || exchange.createdAt,
        partner: otherUser ? otherUser.username : 'Unknown User',
        partnerId: otherUserId,
        isInitiator: isInitiator,
        initiatorId: exchange.initiatorId,
        recipientId: exchange.recipientId,
        unreadMessages: exchange.messages ? 
          exchange.messages.filter(m => 
            m.userId !== req.user.id && 
            new Date(m.timestamp) > new Date(exchange.lastRead?.[req.user.id] || 0)
          ).length : 0
      };
    });
    
    res.json({
      exchanges: exchangesWithUsers,
      count: exchangesWithUsers.length
    });
    
  } catch (error) {
    console.error('User exchanges fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch user exchanges' });
  }
});

module.exports = router; 