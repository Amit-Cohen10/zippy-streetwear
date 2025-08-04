// Wishlist Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Only run on wishlist page
    if (!window.location.pathname.includes('wishlist')) {
        return;
    }

    let wishlistItems = [];
    let filteredItems = [];

    // Load wishlist from localStorage
    function loadWishlist() {
        try {
            const savedWishlist = localStorage.getItem('wishlist');
            wishlistItems = savedWishlist ? JSON.parse(savedWishlist) : [];
            filteredItems = [...wishlistItems];
            updateWishlistStats();
            renderWishlist();
        } catch (error) {
            console.error('Error loading wishlist:', error);
            wishlistItems = [];
            filteredItems = [];
        }
    }

    // Render wishlist items
    function renderWishlist() {
        const wishlistGrid = document.getElementById('wishlistGrid');
        const emptyWishlist = document.getElementById('emptyWishlist');
        const loadingState = document.getElementById('loadingState');
        const wishlistStats = document.getElementById('wishlistStats');

        if (!wishlistGrid) return;

        // Hide loading state
        if (loadingState) {
            loadingState.style.display = 'none';
        }

        if (filteredItems.length === 0) {
            // Show empty state
            wishlistGrid.style.display = 'none';
            if (emptyWishlist) {
                emptyWishlist.style.display = 'flex';
            }
            if (wishlistStats) {
                wishlistStats.style.display = 'none';
            }
            return;
        }

        // Show wishlist content
        wishlistGrid.style.display = 'grid';
        if (emptyWishlist) {
            emptyWishlist.style.display = 'none';
        }
        if (wishlistStats) {
            wishlistStats.style.display = 'block';
        }

        // Clear grid
        wishlistGrid.innerHTML = '';

        // Render items
        filteredItems.forEach(item => {
            const itemCard = createWishlistItemCard(item);
            wishlistGrid.appendChild(itemCard);
        });
    }

    // Create wishlist item card
    function createWishlistItemCard(item) {
        const card = document.createElement('div');
        card.className = 'wishlist-item-card';
        card.dataset.itemId = item.id;

        card.innerHTML = `
            <div class="item-image-wrapper">
                ${item.image ? 
                    `<img src="${item.image}" alt="${item.name}" class="item-image">` :
                    `<div class="item-placeholder">
                        <div class="placeholder-icon">👕</div>
                        <div class="placeholder-text">${item.name}</div>
                    </div>`
                }
                <button class="remove-wishlist-btn" onclick="removeFromWishlist('${item.id}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="item-info">
                <h3 class="item-title">${item.name}</h3>
                <p class="item-price">$${item.price.toFixed(2)}</p>
                <div class="item-actions">
                    <button class="add-to-cart-btn" onclick="addToCartFromWishlist('${item.id}')">
                        <i class="fas fa-shopping-cart"></i>
                        Add to Cart
                    </button>
                    <button class="view-product-btn" onclick="viewProduct('${item.id}')">
                        <i class="fas fa-eye"></i>
                        View Product
                    </button>
                </div>
            </div>
        `;

        return card;
    }

    // Update wishlist statistics
    function updateWishlistStats() {
        const totalItems = document.getElementById('totalItems');
        const totalValue = document.getElementById('totalValue');
        const averagePrice = document.getElementById('averagePrice');
        const wishlistCount = document.getElementById('wishlistCount');
        const wishlistValue = document.getElementById('wishlistValue');

        if (totalItems) totalItems.textContent = wishlistItems.length;
        if (wishlistCount) wishlistCount.textContent = wishlistItems.length;

        const totalPrice = wishlistItems.reduce((sum, item) => sum + item.price, 0);
        const avgPrice = wishlistItems.length > 0 ? totalPrice / wishlistItems.length : 0;

        if (totalValue) totalValue.textContent = `$${totalPrice.toFixed(2)}`;
        if (wishlistValue) wishlistValue.textContent = `$${totalPrice.toFixed(2)}`;
        if (averagePrice) averagePrice.textContent = `$${avgPrice.toFixed(2)}`;
    }

    // Remove item from wishlist
    window.removeFromWishlist = function(itemId) {
        try {
            wishlistItems = wishlistItems.filter(item => item.id !== itemId);
            filteredItems = filteredItems.filter(item => item.id !== itemId);
            
            localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
            
            updateWishlistStats();
            renderWishlist();
            
            showNotification('Item removed from wishlist', 'info');
        } catch (error) {
            console.error('Error removing item from wishlist:', error);
            showNotification('Error removing item from wishlist', 'error');
        }
    };

    // Add item to cart from wishlist
    window.addToCartFromWishlist = function(itemId) {
        try {
            const item = wishlistItems.find(item => item.id === itemId);
            if (!item) {
                showNotification('Item not found', 'error');
                return;
            }

            // Get current cart
            let cart = JSON.parse(localStorage.getItem('cart') || '[]');
            
            // Check if item is already in cart
            const existingItem = cart.find(cartItem => cartItem.id === itemId);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    id: itemId,
                    name: item.name,
                    price: item.price,
                    image: item.image,
                    quantity: 1
                });
            }
            
            localStorage.setItem('cart', JSON.stringify(cart));
            
            // Update cart count
            updateCartCount();
            
            showNotification('Item added to cart!', 'success');
        } catch (error) {
            console.error('Error adding item to cart:', error);
            showNotification('Error adding item to cart', 'error');
        }
    };

    // View product details
    window.viewProduct = function(itemId) {
        try {
            window.location.href = `/product-detail.html?id=${itemId}`;
        } catch (error) {
            console.error('Error navigating to product:', error);
        }
    };

    // Clear all wishlist items
    window.clearWishlist = function() {
        try {
            if (confirm('Are you sure you want to clear your entire wishlist?')) {
                wishlistItems = [];
                filteredItems = [];
                localStorage.setItem('wishlist', JSON.stringify([]));
                
                updateWishlistStats();
                renderWishlist();
                
                showNotification('Wishlist cleared', 'info');
            }
        } catch (error) {
            console.error('Error clearing wishlist:', error);
            showNotification('Error clearing wishlist', 'error');
        }
    };

    // Add all items to cart
    window.addAllToCart = function() {
        try {
            if (wishlistItems.length === 0) {
                showNotification('Your wishlist is empty', 'info');
                return;
            }

            let cart = JSON.parse(localStorage.getItem('cart') || '[]');
            let addedCount = 0;

            wishlistItems.forEach(item => {
                const existingItem = cart.find(cartItem => cartItem.id === item.id);
                
                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    cart.push({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        image: item.image,
                        quantity: 1
                    });
                }
                addedCount++;
            });

            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            
            showNotification(`${addedCount} items added to cart!`, 'success');
        } catch (error) {
            console.error('Error adding all items to cart:', error);
            showNotification('Error adding items to cart', 'error');
        }
    };

    // Sort wishlist
    window.sortWishlist = function() {
        try {
            const sortSelect = document.getElementById('sortSelect');
            if (!sortSelect) return;

            const sortBy = sortSelect.value;
            
            switch (sortBy) {
                case 'date-desc':
                    filteredItems.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
                    break;
                case 'date-asc':
                    filteredItems.sort((a, b) => new Date(a.addedAt) - new Date(b.addedAt));
                    break;
                case 'price-asc':
                    filteredItems.sort((a, b) => a.price - b.price);
                    break;
                case 'price-desc':
                    filteredItems.sort((a, b) => b.price - a.price);
                    break;
                case 'name-asc':
                    filteredItems.sort((a, b) => a.name.localeCompare(b.name));
                    break;
            }
            
            renderWishlist();
        } catch (error) {
            console.error('Error sorting wishlist:', error);
        }
    };

    // Toggle filters panel
    window.toggleFilters = function() {
        try {
            const filtersPanel = document.getElementById('filtersPanel');
            if (filtersPanel) {
                const isVisible = filtersPanel.style.display !== 'none';
                filtersPanel.style.display = isVisible ? 'none' : 'block';
            }
        } catch (error) {
            console.error('Error toggling filters:', error);
        }
    };

    // Apply filters
    window.applyFilters = function() {
        try {
            const categoryFilter = document.getElementById('categoryFilter');
            const brandFilter = document.getElementById('brandFilter');
            const priceMin = document.getElementById('priceMin');
            const priceMax = document.getElementById('priceMax');
            const inStockFilter = document.getElementById('inStockFilter');
            const onSaleFilter = document.getElementById('onSaleFilter');

            let filtered = [...wishlistItems];

            // Category filter
            if (categoryFilter && categoryFilter.value) {
                filtered = filtered.filter(item => item.category === categoryFilter.value);
            }

            // Brand filter
            if (brandFilter && brandFilter.value) {
                filtered = filtered.filter(item => item.brand === brandFilter.value);
            }

            // Price range filter
            if (priceMin && priceMax) {
                const minPrice = parseFloat(priceMin.value);
                const maxPrice = parseFloat(priceMax.value);
                filtered = filtered.filter(item => item.price >= minPrice && item.price <= maxPrice);
            }

            filteredItems = filtered;
            renderWishlist();
            
            showNotification('Filters applied', 'info');
        } catch (error) {
            console.error('Error applying filters:', error);
        }
    };

    // Reset filters
    window.resetFilters = function() {
        try {
            const categoryFilter = document.getElementById('categoryFilter');
            const brandFilter = document.getElementById('brandFilter');
            const priceMin = document.getElementById('priceMin');
            const priceMax = document.getElementById('priceMax');
            const inStockFilter = document.getElementById('inStockFilter');
            const onSaleFilter = document.getElementById('onSaleFilter');

            if (categoryFilter) categoryFilter.value = '';
            if (brandFilter) brandFilter.value = '';
            if (priceMin) priceMin.value = 0;
            if (priceMax) priceMax.value = 500;
            if (inStockFilter) inStockFilter.checked = true;
            if (onSaleFilter) onSaleFilter.checked = false;

            filteredItems = [...wishlistItems];
            renderWishlist();
            
            showNotification('Filters reset', 'info');
        } catch (error) {
            console.error('Error resetting filters:', error);
        }
    };

    // Update cart count
    function updateCartCount() {
        try {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
            
            const cartCountElement = document.getElementById('cartCount');
            if (cartCountElement) {
                cartCountElement.textContent = cartCount;
            }
        } catch (error) {
            console.error('Error updating cart count:', error);
        }
    }

    // Show notification
    function showNotification(message, type = 'info') {
        try {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                color: #fff;
                font-weight: 500;
                z-index: 10000;
                animation: slideIn 0.3s ease-out;
                max-width: 300px;
            `;
            
            switch (type) {
                case 'success':
                    notification.style.background = 'linear-gradient(135deg, #00ff88, #00cc6a)';
                    break;
                case 'error':
                    notification.style.background = 'linear-gradient(135deg, #ff4757, #ff6b7a)';
                    break;
                case 'info':
                default:
                    notification.style.background = 'linear-gradient(135deg, #00ffff, #0080ff)';
                    break;
            }
            
            notification.textContent = message;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, 3000);
            
        } catch (error) {
            console.error('Error showing notification:', error);
        }
    }

    // Initialize wishlist page
    function init() {
        loadWishlist();
        updateCartCount();
    }

    // Start initialization
    init();
}); 