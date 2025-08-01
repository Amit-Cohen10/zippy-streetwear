const express = require('express');
const persist = require('./persist_module');

const router = express.Router();

// Middleware to require admin authentication
const requireAdmin = async (req, res, next) => {
  try {
    const user = await persist.getUserFromToken(req);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication required' });
  }
};

// Get activity logs
router.get('/activity', requireAdmin, async (req, res) => {
  try {
    const { 
      action, 
      userId, 
      startDate, 
      endDate, 
      limit = 50, 
      page = 1 
    } = req.query;
    
    let activities = await persist.readData(persist.activityFile);
    
    // Filter by action
    if (action) {
      activities = activities.filter(activity => activity.action === action);
    }
    
    // Filter by user
    if (userId) {
      activities = activities.filter(activity => activity.userId === userId);
    }
    
    // Filter by date range
    if (startDate) {
      activities = activities.filter(activity => 
        new Date(activity.timestamp) >= new Date(startDate)
      );
    }
    
    if (endDate) {
      activities = activities.filter(activity => 
        new Date(activity.timestamp) <= new Date(endDate)
      );
    }
    
    // Sort by timestamp (newest first)
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedActivities = activities.slice(startIndex, endIndex);
    
    // Get user details for activities
    const users = await persist.readData(persist.usersFile);
    const activitiesWithDetails = paginatedActivities.map(activity => {
      const user = users.find(u => u.id === activity.userId);
      return {
        ...activity,
        user: user ? {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        } : null
      };
    });
    
    res.json({
      activities: activitiesWithDetails,
      pagination: {
        total: activities.length,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(activities.length / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('Activity fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
});

// Get all users
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const { 
      role, 
      search, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      limit = 50,
      page = 1
    } = req.query;
    
    let users = await persist.readData(persist.usersFile);
    
    // Filter by role
    if (role) {
      users = users.filter(user => user.role === role);
    }
    
    // Search by username or email
    if (search) {
      const searchTerm = search.toLowerCase();
      users = users.filter(user => 
        user.username.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
      );
    }
    
    // Sort users
    users.sort((a, b) => {
      let aValue = a[sortBy] || a.profile?.joinDate || '';
      let bValue = b[sortBy] || b.profile?.joinDate || '';
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedUsers = users.slice(startIndex, endIndex);
    
    // Remove sensitive data
    const safeUsers = paginatedUsers.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      profile: user.profile,
      preferences: user.preferences,
      createdAt: user.profile?.joinDate
    }));
    
    res.json({
      users: safeUsers,
      pagination: {
        total: users.length,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(users.length / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/users/:userId', requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const users = await persist.readData(persist.usersFile);
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get user's orders
    const orders = await persist.readData(persist.ordersFile);
    const userOrders = orders[userId] || [];
    
    // Get user's exchanges
    const exchanges = await persist.readData(persist.exchangesFile);
    const userExchanges = exchanges.filter(e => 
      e.initiatorId === userId || e.recipientId === userId
    );
    
    // Get user's activity
    const activities = await persist.readData(persist.activityFile);
    const userActivities = activities.filter(a => a.userId === userId);
    
    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      profile: user.profile,
      preferences: user.preferences,
      stats: {
        orders: userOrders.length,
        exchanges: userExchanges.length,
        activities: userActivities.length,
        totalSpent: userOrders.reduce((sum, order) => sum + order.total, 0)
      }
    };
    
    res.json({ user: safeUser });
    
  } catch (error) {
    console.error('User fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user
router.put('/users/:userId', requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, profile, preferences } = req.body;
    
    const users = await persist.readData(persist.usersFile);
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update user fields
    if (role) {
      users[userIndex].role = role;
    }
    
    if (profile) {
      users[userIndex].profile = { ...users[userIndex].profile, ...profile };
    }
    
    if (preferences) {
      users[userIndex].preferences = { ...users[userIndex].preferences, ...preferences };
    }
    
    await persist.writeData(persist.usersFile, users);
    
    // Log activity
    await persist.logActivity(req.user.id, 'admin_user_update', { 
      targetUserId: userId,
      updatedFields: Object.keys(req.body)
    });
    
    res.json({
      message: 'User updated successfully',
      user: {
        id: users[userIndex].id,
        username: users[userIndex].username,
        email: users[userIndex].email,
        role: users[userIndex].role,
        profile: users[userIndex].profile,
        preferences: users[userIndex].preferences
      }
    });
    
  } catch (error) {
    console.error('User update error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user
router.delete('/users/:userId', requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete yourself' });
    }
    
    const users = await persist.readData(persist.usersFile);
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const deletedUser = users[userIndex];
    users.splice(userIndex, 1);
    
    await persist.writeData(persist.usersFile, users);
    
    // Log activity
    await persist.logActivity(req.user.id, 'admin_user_delete', { 
      targetUserId: userId,
      username: deletedUser.username
    });
    
    res.json({
      message: 'User deleted successfully',
      deletedUser: {
        id: deletedUser.id,
        username: deletedUser.username,
        email: deletedUser.email
      }
    });
    
  } catch (error) {
    console.error('User deletion error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get analytics dashboard
router.get('/analytics', requireAdmin, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    // Get data
    const users = await persist.readData(persist.usersFile);
    const products = await persist.readData(persist.productsFile);
    const orders = await persist.readData(persist.ordersFile);
    const exchanges = await persist.readData(persist.exchangesFile);
    const activities = await persist.readData(persist.activityFile);
    
    // Filter by date range
    const recentUsers = users.filter(user => 
      new Date(user.profile?.joinDate) >= startDate
    );
    
    const recentOrders = Object.values(orders).flat().filter(order => 
      new Date(order.createdAt) >= startDate
    );
    
    const recentExchanges = exchanges.filter(exchange => 
      new Date(exchange.createdAt) >= startDate
    );
    
    const recentActivities = activities.filter(activity => 
      new Date(activity.timestamp) >= startDate
    );
    
    // Calculate metrics
    const totalRevenue = recentOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = recentOrders.length;
    const totalExchanges = recentExchanges.length;
    const newUsers = recentUsers.length;
    const totalProducts = products.length;
    
    // Activity breakdown
    const activityBreakdown = {};
    recentActivities.forEach(activity => {
      activityBreakdown[activity.action] = (activityBreakdown[activity.action] || 0) + 1;
    });
    
    // Top products
    const productSales = {};
    recentOrders.forEach(order => {
      order.items.forEach(item => {
        productSales[item.productId] = (productSales[item.productId] || 0) + item.quantity;
      });
    });
    
    const topProducts = Object.entries(productSales)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([productId, quantity]) => {
        const product = products.find(p => p.id === productId);
        return {
          id: productId,
          title: product?.title || 'Unknown Product',
          quantity,
          revenue: quantity * (product?.price || 0)
        };
      });
    
    // Exchange statistics
    const exchangeStats = {
      pending: recentExchanges.filter(e => e.status === 'pending').length,
      accepted: recentExchanges.filter(e => e.status === 'accepted').length,
      completed: recentExchanges.filter(e => e.status === 'completed').length,
      rejected: recentExchanges.filter(e => e.status === 'rejected').length
    };
    
    res.json({
      period,
      metrics: {
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalOrders,
        totalExchanges,
        newUsers,
        totalProducts,
        averageOrderValue: totalOrders > 0 ? parseFloat((totalRevenue / totalOrders).toFixed(2)) : 0
      },
      activityBreakdown,
      topProducts,
      exchangeStats,
      recentActivity: recentActivities.slice(0, 10)
    });
    
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get system health
router.get('/health', requireAdmin, async (req, res) => {
  try {
    const users = await persist.readData(persist.usersFile);
    const products = await persist.readData(persist.productsFile);
    const orders = await persist.readData(persist.ordersFile);
    const exchanges = await persist.readData(persist.exchangesFile);
    const activities = await persist.readData(persist.activityFile);
    
    const totalOrders = Object.values(orders).flat().length;
    const totalRevenue = Object.values(orders).flat().reduce((sum, order) => sum + order.total, 0);
    
    res.json({
      status: 'healthy',
      data: {
        users: users.length,
        products: products.length,
        orders: totalOrders,
        exchanges: exchanges.length,
        activities: activities.length,
        totalRevenue: parseFloat(totalRevenue.toFixed(2))
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      status: 'unhealthy',
      error: 'Failed to check system health'
    });
  }
});

// Get recent activity summary
router.get('/activity/summary', requireAdmin, async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const activities = await persist.readData(persist.activityFile);
    const recentActivities = activities.filter(activity => 
      new Date(activity.timestamp) >= cutoffTime
    );
    
    const summary = {
      total: recentActivities.length,
      byAction: {},
      byUser: {},
      timeline: []
    };
    
    recentActivities.forEach(activity => {
      // Count by action
      summary.byAction[activity.action] = (summary.byAction[activity.action] || 0) + 1;
      
      // Count by user
      summary.byUser[activity.userId] = (summary.byUser[activity.userId] || 0) + 1;
      
      // Add to timeline
      summary.timeline.push({
        timestamp: activity.timestamp,
        action: activity.action,
        userId: activity.userId,
        details: activity.details
      });
    });
    
    // Sort timeline by timestamp
    summary.timeline.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json(summary);
    
  } catch (error) {
    console.error('Activity summary error:', error);
    res.status(500).json({ error: 'Failed to fetch activity summary' });
  }
});

// Check admin access
router.get('/check', requireAdmin, async (req, res) => {
  try {
    res.json({ 
      message: 'Admin access verified',
      user: req.user 
    });
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ error: 'Failed to verify admin access' });
  }
});

// Get analytics data
router.get('/analytics', requireAdmin, async (req, res) => {
  try {
    const [orders, users, activities, exchanges] = await Promise.all([
      persist.readData(persist.ordersFile),
      persist.readData(persist.usersFile),
      persist.readData(persist.activityFile),
      persist.readData(persist.exchangesFile)
    ]);
    
    // Calculate analytics
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalOrders = orders.length;
    const activeUsers = users.filter(user => {
      const lastActivity = new Date(user.lastActivity || user.createdAt);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return lastActivity > thirtyDaysAgo;
    }).length;
    const totalExchanges = exchanges.length;
    
    res.json({
      totalRevenue,
      totalOrders,
      activeUsers,
      totalExchanges
    });
    
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get users list
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const users = await persist.readData(persist.usersFile);
    
    // Remove sensitive information
    const safeUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role || 'user',
      createdAt: user.createdAt,
      lastActivity: user.lastActivity
    }));
    
    res.json(safeUsers);
    
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router; 