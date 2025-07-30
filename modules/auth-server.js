const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const persist = require('./persist_module');

const router = express.Router();

// Middleware to validate input
const validateRegistration = (req, res, next) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  if (username.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  
  next();
};

// Register new user
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    const users = await persist.readData(persist.usersFile);
    
    // Check if username or email already exists
    const existingUser = users.find(user => 
      user.username.toLowerCase() === username.toLowerCase() || 
      user.email.toLowerCase() === email.toLowerCase()
    );
    
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const newUser = {
      id: persist.generateId('user'),
      username: username.toLowerCase(),
      password: hashedPassword,
      email: email.toLowerCase(),
      role: 'user',
      profile: {
        displayName: username,
        avatar: '/images/default-avatar.png',
        exchangeRating: 0,
        joinDate: new Date().toISOString()
      },
      preferences: {
        darkMode: true,
        language: 'en',
        notifications: true
      }
    };
    
    users.push(newUser);
    await persist.writeData(persist.usersFile, users);
    
    // Log activity
    await persist.logActivity(newUser.id, 'register', { 
      username, 
      email, 
      ip: req.ip 
    });
    
    // Generate token
    const token = jwt.sign(
      { userId: newUser.id, username: newUser.username },
      process.env.JWT_SECRET || 'zippy-secret-key',
      { expiresIn: '30m' }
    );
    
    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 60 * 1000 // 30 minutes
    });
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        profile: newUser.profile
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { username, password, rememberMe } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    const users = await persist.readData(persist.usersFile);
    const user = users.find(u => 
      u.username.toLowerCase() === username.toLowerCase() || 
      u.email.toLowerCase() === username.toLowerCase()
    );
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate token with different expiration based on rememberMe
    const expiresIn = rememberMe ? '12d' : '30m';
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || 'zippy-secret-key',
      { expiresIn }
    );
    
    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: rememberMe ? 12 * 24 * 60 * 60 * 1000 : 30 * 60 * 1000 // 12 days or 30 minutes
    });
    
    // Log activity
    await persist.logActivity(user.id, 'login', { 
      username: user.username, 
      rememberMe, 
      ip: req.ip 
    });
    
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile,
        preferences: user.preferences
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout user
router.post('/logout', async (req, res) => {
  try {
    const user = await persist.getUserFromToken(req);
    
    if (user) {
      await persist.logActivity(user.id, 'logout', { 
        username: user.username, 
        ip: req.ip 
      });
    }
    
    // Clear cookie
    res.clearCookie('token');
    res.json({ message: 'Logout successful' });
    
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Verify token
router.get('/verify-token', async (req, res) => {
  try {
    const user = await persist.getUserFromToken(req);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    res.json({
      valid: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile,
        preferences: user.preferences
      }
    });
    
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const user = await persist.getUserFromToken(req);
    
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile,
        preferences: user.preferences
      }
    });
    
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const user = await persist.getUserFromToken(req);
    
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const { displayName, avatar, preferences } = req.body;
    
    const users = await persist.readData(persist.usersFile);
    const userIndex = users.findIndex(u => u.id === user.id);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update profile
    if (displayName) {
      users[userIndex].profile.displayName = displayName;
    }
    
    if (avatar) {
      users[userIndex].profile.avatar = avatar;
    }
    
    if (preferences) {
      users[userIndex].preferences = { ...users[userIndex].preferences, ...preferences };
    }
    
    await persist.writeData(persist.usersFile, users);
    
    // Log activity
    await persist.logActivity(user.id, 'profile_update', { 
      displayName, 
      avatar, 
      preferences 
    });
    
    res.json({
      message: 'Profile updated successfully',
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
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router; 