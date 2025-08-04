const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class PersistModule {
  constructor() {
    this.dataDir = path.join(__dirname, '..', 'data');
    this.usersFile = path.join(this.dataDir, 'users', 'users.json');
    this.productsFile = path.join(this.dataDir, 'products', 'products.json');
    this.exchangesFile = path.join(this.dataDir, 'exchanges', 'exchanges.json');
    this.activityFile = path.join(this.dataDir, 'activity-logs', 'activity.json');
    this.cartsFile = path.join(this.dataDir, 'users', 'carts.json');
    this.ordersFile = path.join(this.dataDir, 'users', 'orders.json');
    this.wishlistFile = path.join(this.dataDir, 'users', 'wishlist.json');
    
    this.initializeData();
  }

  async initializeData() {
    try {
      // Ensure directories exist
      await fs.mkdir(path.join(this.dataDir, 'users'), { recursive: true });
      await fs.mkdir(path.join(this.dataDir, 'products'), { recursive: true });
      await fs.mkdir(path.join(this.dataDir, 'exchanges'), { recursive: true });
      await fs.mkdir(path.join(this.dataDir, 'activity-logs'), { recursive: true });

      // Initialize default admin user
      await this.initializeAdminUser();
      
      // Initialize sample products
      await this.initializeSampleProducts();
      
      // Initialize empty data files if they don't exist
      await this.initializeFile(this.usersFile, []);
      await this.initializeFile(this.productsFile, []);
      await this.initializeFile(this.exchangesFile, []);
      await this.initializeFile(this.activityFile, []);
      await this.initializeFile(this.cartsFile, {});
      await this.initializeFile(this.ordersFile, {});
      await this.initializeFile(this.wishlistFile, {});
      
    } catch (error) {
      console.error('Error initializing data:', error);
    }
  }

  async initializeFile(filePath, defaultData) {
    try {
      await fs.access(filePath);
    } catch {
      await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2));
    }
  }

  async initializeAdminUser() {
    try {
      const users = await this.readData(this.usersFile);
      const adminExists = users.find(user => user.username === 'admin');
      
      if (!adminExists) {
        const hashedPassword = await bcrypt.hash('admin', 10);
        const adminUser = {
          id: 'admin-001',
          username: 'admin',
          password: hashedPassword,
          email: 'admin@zippy.com',
          role: 'admin',
          profile: {
            displayName: 'Admin',
            avatar: '/images/admin-avatar.png',
            exchangeRating: 5.0,
            joinDate: new Date().toISOString()
          },
          preferences: {
            darkMode: true,
            language: 'en',
            notifications: true
          }
        };
        
        users.push(adminUser);
        await this.writeData(this.usersFile, users);
        console.log('✅ Default admin user created');
      }
    } catch (error) {
      console.error('Error creating admin user:', error);
    }
  }

  async initializeSampleProducts() {
    try {
      const products = await this.readData(this.productsFile);
      
      if (products.length === 0) {
        const sampleProducts = [
          {
            id: 'prod-001',
            title: 'Neon Cyber Hoodie',
            description: 'Futuristic streetwear hoodie with LED trim and cyberpunk design',
            price: 129.99,
            images: ['/images/cyber-hoodie-1.jpg', '/images/cyber-hoodie-2.jpg'],
            category: 'hoodies',
            sizes: ['S', 'M', 'L', 'XL'],
            stock: { 'S': 10, 'M': 15, 'L': 12, 'XL': 8 },
            brand: 'Zippy Originals',
            exchangeable: true,
            condition: 'new',
            createdAt: new Date().toISOString()
          },
          {
            id: 'prod-002',
            title: 'Glitch Art Tee',
            description: 'Digital distortion graphic t-shirt with glitch effects',
            price: 49.99,
            images: ['/images/glitch-tee-1.jpg', '/images/glitch-tee-2.jpg'],
            category: 't-shirts',
            sizes: ['S', 'M', 'L', 'XL', 'XXL'],
            stock: { 'S': 20, 'M': 25, 'L': 20, 'XL': 15, 'XXL': 10 },
            brand: 'Street Tech',
            exchangeable: true,
            condition: 'new',
            createdAt: new Date().toISOString()
          },
          {
            id: 'prod-003',
            title: 'Holographic Cargo Pants',
            description: 'Reflective cargo pants with utility pockets and holographic finish',
            price: 89.99,
            images: ['/images/cargo-pants-1.jpg', '/images/cargo-pants-2.jpg'],
            category: 'pants',
            sizes: ['28', '30', '32', '34', '36'],
            stock: { '28': 8, '30': 12, '32': 15, '34': 10, '36': 6 },
            brand: 'Future Wear',
            exchangeable: true,
            condition: 'new',
            createdAt: new Date().toISOString()
          },
          {
            id: 'prod-004',
            title: 'Neon Grid Jacket',
            description: 'Light-up jacket with programmable LED grid pattern',
            price: 199.99,
            images: ['/images/grid-jacket-1.jpg', '/images/grid-jacket-2.jpg'],
            category: 'hoodies',
            sizes: ['S', 'M', 'L', 'XL'],
            stock: { 'S': 5, 'M': 8, 'L': 6, 'XL': 4 },
            brand: 'Zippy Originals',
            exchangeable: true,
            condition: 'new',
            createdAt: new Date().toISOString()
          },
          {
            id: 'prod-005',
                    title: 'Digital Camo Pants',
        description: 'Pixelated camouflage pants with tech fabric',
        price: 69.99,
        images: ['/images/camo-pants-1.jpg', '/images/camo-pants-2.jpg'],
        category: 'pants',
            sizes: ['S', 'M', 'L', 'XL'],
            stock: { 'S': 12, 'M': 15, 'L': 10, 'XL': 8 },
            brand: 'Street Tech',
            exchangeable: true,
            condition: 'new',
            createdAt: new Date().toISOString()
          }
        ];
        
        await this.writeData(this.productsFile, sampleProducts);
        console.log('✅ Sample products initialized');
      }
    } catch (error) {
      console.error('Error creating sample products:', error);
    }
  }

  async readData(filePath) {
    try {
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${filePath}:`, error);
      return [];
    }
  }

  async writeData(filePath, data) {
    try {
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`Error writing ${filePath}:`, error);
      throw error;
    }
  }

  async logActivity(userId, action, details = {}) {
    try {
      const activities = await this.readData(this.activityFile);
      const activity = {
        id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        action,
        details,
        timestamp: new Date().toISOString(),
        ip: details.ip || 'unknown'
      };
      
      activities.push(activity);
      await this.writeData(this.activityFile, activities);
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

  generateId(prefix = 'id') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async validateToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'zippy-secret-key');
      const users = await this.readData(this.usersFile);
      const user = users.find(u => u.id === decoded.userId);
      return user || null;
    } catch (error) {
      return null;
    }
  }

  async getUserFromToken(req) {
    // Check for X-User-ID header first (for development/testing)
    const userId = req.headers['x-user-id'];
    console.log('🔍 Checking X-User-ID header:', userId);
    
    if (userId) {
      try {
        const users = await this.readData(this.usersFile);
        console.log('📋 Loaded users:', users.length);
        const user = users.find(u => u.id === userId);
        if (user) {
          console.log('✅ User found via X-User-ID header:', userId);
          return user;
        } else {
          console.log('❌ User not found with ID:', userId);
          console.log('Available user IDs:', users.map(u => u.id));
        }
      } catch (error) {
        console.error('❌ Error reading users file:', error);
      }
    }
    
    // Fallback to token-based authentication
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      console.log('❌ No token found in request');
      return null;
    }
    return await this.validateToken(token);
  }
}

module.exports = new PersistModule(); 