const express = require('express');
const persist = require('./persist_module');

const router = express.Router();

// Middleware to require authentication
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

// Validation middleware
const validateProduct = (req, res, next) => {
  const { title, description, price, category, brand } = req.body;
  
  if (!title || title.trim().length < 3) {
    return res.status(400).json({ error: 'Title must be at least 3 characters' });
  }
  
  if (!description || description.trim().length < 10) {
    return res.status(400).json({ error: 'Description must be at least 10 characters' });
  }
  
  if (!price || isNaN(price) || parseFloat(price) <= 0) {
    return res.status(400).json({ error: 'Valid price is required' });
  }
  
  if (!category || category.trim().length === 0) {
    return res.status(400).json({ error: 'Category is required' });
  }
  
  if (!brand || brand.trim().length === 0) {
    return res.status(400).json({ error: 'Brand is required' });
  }
  
  next();
};

// Enforce category and brand to be from existing catalog
const enforceKnownCategoryBrand = async (req, res, next) => {
  try {
    const products = await persist.readData(persist.productsFile);
    const categories = [...new Set(products.map(p => p.category))]
      .filter(Boolean)
      .map(v => String(v).toLowerCase());
    const brands = [...new Set(products.map(p => p.brand))]
      .filter(Boolean)
      .map(v => String(v).toLowerCase());

    const inputCategory = String(req.body.category || '').trim().toLowerCase();
    const inputBrand = String(req.body.brand || '').trim().toLowerCase();

    if (!categories.includes(inputCategory)) {
      return res.status(400).json({ error: 'Category must be one of existing categories', allowedCategories: categories });
    }
    if (!brands.includes(inputBrand)) {
      return res.status(400).json({ error: 'Brand must be one of existing brands', allowedBrands: brands });
    }
    next();
  } catch (error) {
    console.error('Category/Brand enforcement error:', error);
    res.status(500).json({ error: 'Failed to validate category/brand' });
  }
};

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
      inStock,
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
    
    // Filter by stock availability
    if (inStock === 'true') {
      products = products.filter(product => {
        const totalStock = Object.values(product.stock).reduce((sum, count) => sum + count, 0);
        return totalStock > 0;
      });
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
    
    // Calculate total stock
    const totalStock = Object.values(product.stock).reduce((sum, count) => sum + count, 0);
    const productWithStock = {
      ...product,
      totalStock,
      inStock: totalStock > 0
    };
    
    res.json({ product: productWithStock });
    
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

// Update product stock (admin only)
router.put('/:id/stock', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;
    
    if (!stock || typeof stock !== 'object') {
      return res.status(400).json({ error: 'Stock data is required' });
    }
    
    const products = await persist.readData(persist.productsFile);
    const productIndex = products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Update stock
    products[productIndex].stock = { ...products[productIndex].stock, ...stock };
    products[productIndex].updatedAt = new Date().toISOString();
    
    await persist.writeData(persist.productsFile, products);
    
    // Log activity
    await persist.logActivity(req.user.id, 'stock_update', { 
      productId: id, 
      title: products[productIndex].title,
      stock
    });
    
    res.json({
      message: 'Stock updated successfully',
      product: products[productIndex]
    });
    
  } catch (error) {
    console.error('Stock update error:', error);
    res.status(500).json({ error: 'Failed to update stock' });
  }
});

// Bulk update products (admin only)
router.put('/bulk', requireAuth, async (req, res) => {
  try {
    const { products: updates } = req.body;
    
    if (!Array.isArray(updates)) {
      return res.status(400).json({ error: 'Products array is required' });
    }
    
    const allProducts = await persist.readData(persist.productsFile);
    const updatedProducts = [];
    const errors = [];
    
    for (const update of updates) {
      const { id, ...updateData } = update;
      const productIndex = allProducts.findIndex(p => p.id === id);
      
      if (productIndex === -1) {
        errors.push({ id, error: 'Product not found' });
        continue;
      }
      
      allProducts[productIndex] = {
        ...allProducts[productIndex],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      
      updatedProducts.push(allProducts[productIndex]);
    }
    
    await persist.writeData(persist.productsFile, allProducts);
    
    // Log activity
    await persist.logActivity(req.user.id, 'bulk_product_update', { 
      updatedCount: updatedProducts.length,
      errorCount: errors.length
    });
    
    res.json({
      message: 'Bulk update completed',
      updated: updatedProducts.length,
      errors: errors.length,
      details: errors.length > 0 ? errors : undefined
    });
    
  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({ error: 'Failed to update products' });
  }
});

// Get low stock products (admin only)
router.get('/admin/low-stock', requireAuth, async (req, res) => {
  try {
    const { threshold = 5 } = req.query;
    const products = await persist.readData(persist.productsFile);
    
    const lowStockProducts = products.filter(product => {
      const totalStock = Object.values(product.stock).reduce((sum, count) => sum + count, 0);
      return totalStock <= parseInt(threshold);
    });
    
    res.json({
      products: lowStockProducts,
      threshold: parseInt(threshold),
      count: lowStockProducts.length
    });
    
  } catch (error) {
    console.error('Low stock fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch low stock products' });
  }
});

// Get product statistics (admin only)
router.get('/admin/stats', requireAuth, async (req, res) => {
  try {
    const products = await persist.readData(persist.productsFile);
    
    const stats = {
      total: products.length,
      byCategory: {},
      byBrand: {},
      stockLevels: {
        inStock: 0,
        lowStock: 0,
        outOfStock: 0
      },
      priceRange: {
        min: Math.min(...products.map(p => p.price)),
        max: Math.max(...products.map(p => p.price)),
        average: products.reduce((sum, p) => sum + p.price, 0) / products.length
      }
    };
    
    products.forEach(product => {
      // Category stats
      stats.byCategory[product.category] = (stats.byCategory[product.category] || 0) + 1;
      
      // Brand stats
      stats.byBrand[product.brand] = (stats.byBrand[product.brand] || 0) + 1;
      
      // Stock levels
      const totalStock = Object.values(product.stock).reduce((sum, count) => sum + count, 0);
      if (totalStock === 0) {
        stats.stockLevels.outOfStock++;
      } else if (totalStock <= 5) {
        stats.stockLevels.lowStock++;
      } else {
        stats.stockLevels.inStock++;
      }
    });
    
    res.json(stats);
    
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch product statistics' });
  }
});

// Create new product (admin only)
router.post('/', requireAuth, validateProduct, enforceKnownCategoryBrand, async (req, res) => {
  try {
    const { title, description, price, category, brand, sizes, stock, exchangeable, condition, images } = req.body;
    
    const products = await persist.readData(persist.productsFile);
    
    const newProduct = {
      id: persist.generateId('prod'),
      title: title.trim(),
      description: description.trim(),
      price: parseFloat(price),
      images: images || [],
      category: category.trim(),
      sizes: sizes || [],
      stock: stock || {},
      brand: brand.trim(),
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
router.put('/:id', requireAuth, validateProduct, enforceKnownCategoryBrand, async (req, res) => {
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

// Bulk delete products (admin only)
router.delete('/bulk', requireAuth, async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!Array.isArray(ids)) {
      return res.status(400).json({ error: 'Product IDs array is required' });
    }
    
    const products = await persist.readData(persist.productsFile);
    const deletedProducts = [];
    const errors = [];
    
    for (const id of ids) {
      const productIndex = products.findIndex(p => p.id === id);
      
      if (productIndex === -1) {
        errors.push({ id, error: 'Product not found' });
        continue;
      }
      
      deletedProducts.push(products[productIndex]);
      products.splice(productIndex, 1);
    }
    
    await persist.writeData(persist.productsFile, products);
    
    // Log activity
    await persist.logActivity(req.user.id, 'bulk_product_delete', { 
      deletedCount: deletedProducts.length,
      errorCount: errors.length
    });
    
    res.json({
      message: 'Bulk delete completed',
      deleted: deletedProducts.length,
      errors: errors.length,
      details: errors.length > 0 ? errors : undefined
    });
    
  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({ error: 'Failed to delete products' });
  }
});

// Get user's wishlist
router.get('/wishlist', requireAuth, async (req, res) => {
  try {
    const wishlist = await persist.readData(persist.wishlistFile);
    const userWishlist = wishlist[req.user.id] || [];
    
    // Get product details for wishlist items
    const products = await persist.readData(persist.productsFile);
    const wishlistWithDetails = userWishlist.map(item => {
      const product = products.find(p => p.id === item.productId);
      return product ? {
        id: item.id,
        productId: item.productId,
        addedAt: item.addedAt,
        title: product.title,
        price: product.price,
        image: product.images[0] || '/images/placeholder.jpg',
        brand: product.brand,
        description: product.description
      } : null;
    }).filter(item => item !== null);
    
    res.json({
      items: wishlistWithDetails,
      count: wishlistWithDetails.length
    });
    
  } catch (error) {
    console.error('Wishlist fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

// Add item to wishlist
router.post('/wishlist', requireAuth, async (req, res) => {
  try {
    const { productId } = req.body;
    
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }
    
    // Validate product exists
    const products = await persist.readData(persist.productsFile);
    const product = products.find(p => p.id === productId);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Get current wishlist
    const wishlist = await persist.readData(persist.wishlistFile);
    const userWishlist = wishlist[req.user.id] || [];
    
    // Check if item already exists in wishlist
    const existingItem = userWishlist.find(item => item.productId === productId);
    
    if (existingItem) {
      return res.status(400).json({ error: 'Item already in wishlist' });
    }
    
    // Add to wishlist
    const wishlistItem = {
      id: persist.generateId('wishlist'),
      productId: productId,
      addedAt: new Date().toISOString()
    };
    
    userWishlist.push(wishlistItem);
    wishlist[req.user.id] = userWishlist;
    
    await persist.writeData(persist.wishlistFile, wishlist);
    
    // Log activity
    await persist.logActivity(req.user.id, 'wishlist_add', { 
      productId, 
      title: product.title 
    });
    
    res.json({
      message: 'Item added to wishlist',
      item: wishlistItem
    });
    
  } catch (error) {
    console.error('Wishlist add error:', error);
    res.status(500).json({ error: 'Failed to add item to wishlist' });
  }
});

// Remove item from wishlist
router.delete('/wishlist/:productId', requireAuth, async (req, res) => {
  try {
    const { productId } = req.params;
    
    const wishlist = await persist.readData(persist.wishlistFile);
    const userWishlist = wishlist[req.user.id] || [];
    
    const itemIndex = userWishlist.findIndex(item => item.productId === productId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found in wishlist' });
    }
    
    const removedItem = userWishlist[itemIndex];
    userWishlist.splice(itemIndex, 1);
    wishlist[req.user.id] = userWishlist;
    
    await persist.writeData(persist.wishlistFile, wishlist);
    
    // Log activity
    await persist.logActivity(req.user.id, 'wishlist_remove', { 
      productId 
    });
    
    res.json({
      message: 'Item removed from wishlist',
      removedItem
    });
    
  } catch (error) {
    console.error('Wishlist remove error:', error);
    res.status(500).json({ error: 'Failed to remove item from wishlist' });
  }
});

// Clear user's wishlist
router.delete('/wishlist', requireAuth, async (req, res) => {
  try {
    const wishlist = await persist.readData(persist.wishlistFile);
    const userWishlist = wishlist[req.user.id] || [];
    
    if (userWishlist.length === 0) {
      return res.status(400).json({ error: 'Wishlist is already empty' });
    }
    
    const removedCount = userWishlist.length;
    wishlist[req.user.id] = [];
    
    await persist.writeData(persist.wishlistFile, wishlist);
    
    // Log activity
    await persist.logActivity(req.user.id, 'wishlist_clear', { 
      removedCount 
    });
    
    res.json({
      message: 'Wishlist cleared',
      removedCount
    });
    
  } catch (error) {
    console.error('Wishlist clear error:', error);
    res.status(500).json({ error: 'Failed to clear wishlist' });
  }
});

module.exports = router; 