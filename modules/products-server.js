const express = require('express');
const persist = require('./persist_module');

const router = express.Router();

// Get all products with optional filtering
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      category, 
      brand, 
      minPrice, 
      maxPrice, 
      size, 
      condition,
      exchangeable,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      limit = 50,
      page = 1
    } = req.query;
    
    let products = await persist.readData(persist.productsFile);
    
    // Search functionality (prefix search)
    if (search) {
      const searchTerm = search.toLowerCase();
      products = products.filter(product => 
        product.title.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.brand.toLowerCase().includes(searchTerm)
      );
    }
    
    // Filter by category
    if (category) {
      products = products.filter(product => 
        product.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    // Filter by brand
    if (brand) {
      products = products.filter(product => 
        product.brand.toLowerCase().includes(brand.toLowerCase())
      );
    }
    
    // Filter by price range
    if (minPrice) {
      products = products.filter(product => product.price >= parseFloat(minPrice));
    }
    if (maxPrice) {
      products = products.filter(product => product.price <= parseFloat(maxPrice));
    }
    
    // Filter by size
    if (size) {
      products = products.filter(product => 
        product.sizes.includes(size.toUpperCase())
      );
    }
    
    // Filter by condition
    if (condition) {
      products = products.filter(product => 
        product.condition.toLowerCase() === condition.toLowerCase()
      );
    }
    
    // Filter by exchangeable
    if (exchangeable !== undefined) {
      const isExchangeable = exchangeable === 'true';
      products = products.filter(product => product.exchangeable === isExchangeable);
    }
    
    // Sorting
    products.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'price') {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedProducts = products.slice(startIndex, endIndex);
    
    // Get unique categories and brands for filters
    const categories = [...new Set(products.map(p => p.category))];
    const brands = [...new Set(products.map(p => p.brand))];
    
    res.json({
      products: paginatedProducts,
      pagination: {
        total: products.length,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(products.length / parseInt(limit))
      },
      filters: {
        categories,
        brands,
        priceRange: {
          min: Math.min(...products.map(p => p.price)),
          max: Math.max(...products.map(p => p.price))
        }
      }
    });
    
  } catch (error) {
    console.error('Products fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const products = await persist.readData(persist.productsFile);
    const product = products.find(p => p.id === id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ product });
    
  } catch (error) {
    console.error('Product fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Get product categories
router.get('/categories/list', async (req, res) => {
  try {
    const products = await persist.readData(persist.productsFile);
    const categories = [...new Set(products.map(p => p.category))];
    
    res.json({ categories });
    
  } catch (error) {
    console.error('Categories fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get product brands
router.get('/brands/list', async (req, res) => {
  try {
    const products = await persist.readData(persist.productsFile);
    const brands = [...new Set(products.map(p => p.brand))];
    
    res.json({ brands });
    
  } catch (error) {
    console.error('Brands fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
});

// Search products (real-time)
router.get('/search/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }
    
    const products = await persist.readData(persist.productsFile);
    const searchTerm = q.toLowerCase();
    
    const suggestions = products
      .filter(product => 
        product.title.toLowerCase().includes(searchTerm) ||
        product.brand.toLowerCase().includes(searchTerm)
      )
      .slice(0, 5)
      .map(product => ({
        id: product.id,
        title: product.title,
        brand: product.brand,
        price: product.price,
        image: product.images[0]
      }));
    
    res.json({ suggestions });
    
  } catch (error) {
    console.error('Search suggestions error:', error);
    res.status(500).json({ error: 'Failed to get search suggestions' });
  }
});

// Get related products
router.get('/:id/related', async (req, res) => {
  try {
    const { id } = req.params;
    const products = await persist.readData(persist.productsFile);
    const currentProduct = products.find(p => p.id === id);
    
    if (!currentProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Find related products by category and brand
    const relatedProducts = products
      .filter(p => 
        p.id !== id && 
        (p.category === currentProduct.category || p.brand === currentProduct.brand)
      )
      .slice(0, 4);
    
    res.json({ relatedProducts });
    
  } catch (error) {
    console.error('Related products error:', error);
    res.status(500).json({ error: 'Failed to fetch related products' });
  }
});

// Check product stock
router.get('/:id/stock', async (req, res) => {
  try {
    const { id } = req.params;
    const { size } = req.query;
    
    const products = await persist.readData(persist.productsFile);
    const product = products.find(p => p.id === id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    if (size) {
      const stock = product.stock[size] || 0;
      res.json({ stock, available: stock > 0 });
    } else {
      const totalStock = Object.values(product.stock).reduce((sum, count) => sum + count, 0);
      res.json({ 
        totalStock, 
        available: totalStock > 0,
        stockBySize: product.stock
      });
    }
    
  } catch (error) {
    console.error('Stock check error:', error);
    res.status(500).json({ error: 'Failed to check stock' });
  }
});

// Admin routes (require authentication)
const requireAuth = async (req, res, next) => {
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

// Create new product (admin only)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, description, price, category, brand, sizes, stock, exchangeable, condition, images } = req.body;
    
    if (!title || !description || !price || !category || !brand) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const products = await persist.readData(persist.productsFile);
    
    const newProduct = {
      id: persist.generateId('prod'),
      title,
      description,
      price: parseFloat(price),
      images: images || [],
      category,
      sizes: sizes || [],
      stock: stock || {},
      brand,
      exchangeable: exchangeable !== undefined ? exchangeable : true,
      condition: condition || 'new',
      createdAt: new Date().toISOString()
    };
    
    products.push(newProduct);
    await persist.writeData(persist.productsFile, products);
    
    // Log activity
    await persist.logActivity(req.user.id, 'product_create', { 
      productId: newProduct.id, 
      title: newProduct.title 
    });
    
    res.status(201).json({
      message: 'Product created successfully',
      product: newProduct
    });
    
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product (admin only)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const products = await persist.readData(persist.productsFile);
    const productIndex = products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Update product
    products[productIndex] = {
      ...products[productIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    await persist.writeData(persist.productsFile, products);
    
    // Log activity
    await persist.logActivity(req.user.id, 'product_update', { 
      productId: id, 
      title: products[productIndex].title 
    });
    
    res.json({
      message: 'Product updated successfully',
      product: products[productIndex]
    });
    
  } catch (error) {
    console.error('Product update error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product (admin only)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const products = await persist.readData(persist.productsFile);
    const productIndex = products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const deletedProduct = products[productIndex];
    products.splice(productIndex, 1);
    
    await persist.writeData(persist.productsFile, products);
    
    // Log activity
    await persist.logActivity(req.user.id, 'product_delete', { 
      productId: id, 
      title: deletedProduct.title 
    });
    
    res.json({
      message: 'Product deleted successfully',
      product: deletedProduct
    });
    
  } catch (error) {
    console.error('Product deletion error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router; 