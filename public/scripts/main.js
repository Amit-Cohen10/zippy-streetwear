// Global state
let currentUser = null;
let cartItems = [];
let featuredProducts = [];

// API base URL
const API_BASE = '';

// Utility functions
function showLoading() {
    document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#ff4444' : type === 'success' ? '#00ff00' : '#00ffff'};
        color: #000;
        padding: 1rem 2rem;
        border-radius: 4px;
        z-index: 10000;
        font-weight: bold;
        box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// API functions
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'API request failed');
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Authentication functions
async function checkAuth() {
    try {
        const response = await apiCall('/api/auth/verify-token');
        window.currentUser = response.user;
        if (typeof window.updateAuthUI === 'function') {
            window.updateAuthUI();
        }
        return true;
    } catch (error) {
        window.currentUser = null;
        if (typeof window.updateAuthUI === 'function') {
            window.updateAuthUI();
        }
        return false;
    }
}

// This function is now handled by auth.js
// function updateAuthUI() {
//     const authBtn = document.getElementById('authBtn');
//     if (currentUser) {
//         authBtn.textContent = currentUser.username;
//         authBtn.onclick = () => window.location.href = '/dashboard';
//     } else {
//         authBtn.textContent = 'Login';
//         authBtn.onclick = () => document.getElementById('authModal').style.display = 'flex';
//     }
// }

// Product functions
async function loadFeaturedProducts() {
    try {
        const response = await apiCall('/api/products?limit=4');
        featuredProducts = response.products;
        renderFeaturedProducts();
    } catch (error) {
        console.error('Failed to load featured products:', error);
        // Fallback to sample data
        featuredProducts = [
            {
                id: 1,
                title: "Neural Network Hoodie",
                price: 459,
                images: ["/images/products/neural-network-hoodie.jpg"],
                description: "Experience the future of streetwear with this cutting-edge neural network design."
            },
            {
                id: 2,
                title: "Glitch Reality Hoodie",
                price: 429,
                images: ["/images/products/glitch-reality-hoodie.jpg"],
                description: "Embrace the digital distortion with this glitch reality hoodie."
            },
            {
                id: 3,
                title: "Cyber Samurai Hoodie",
                price: 489,
                images: ["/images/products/cyber-samurai-hoodie.jpg"],
                description: "Channel your inner warrior with this cyber samurai design."
            },
            {
                id: 4,
                title: "Data Stream Hoodie",
                price: 449,
                images: ["/images/products/data-stream-hoodie.jpg"],
                description: "Flow with the digital current in this data stream hoodie."
            }
        ];
        renderFeaturedProducts();
    }
}

function renderFeaturedProducts() {
    const container = document.getElementById('featuredProducts');
    if (!container) return;
    
    container.innerHTML = featuredProducts.map((product, idx) => `
        <div class="product-card" onclick="window.location.href='/product/${product.id}'">
            <div class="product-image">
                ${product.images && product.images.length > 0 ? 
                    `<img src="${product.images[0]}" alt="${product.title}" style="width: 100%; height: 100%; object-fit: cover;">` :
                    '👕'
                }
            </div>
            <h3 class="product-title">${product.title}</h3>
            <div class="product-price">$${product.price.toFixed(2)}</div>
            <button class="add-to-cart-btn" data-product-idx="${idx}">
                Add to Cart
            </button>
        </div>
    `).join('');

    // Add real event listeners for Add to Cart
    container.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        const idx = btn.getAttribute('data-product-idx');
        btn.addEventListener('click', function(event) {
            event.stopPropagation();
            window.showAddToCartModal(featuredProducts[idx]);
        });
    });
}

async function addToCart(productId, size = 'M', quantity = 1) {
    if (!window.currentUser) {
        showNotification('Please login to add items to cart', 'error');
        if (typeof openAuthModal === 'function') {
            openAuthModal();
        } else {
            document.getElementById('authModal').style.display = 'flex';
        }
        return;
    }
    
    try {
        await apiCall('/api/cart/add', {
            method: 'POST',
            body: JSON.stringify({
                productId,
                size,
                quantity
            })
        });
        
        showNotification('Item added to cart!', 'success');
        updateCartCount();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Cart functions
async function loadCart() {
    if (!window.currentUser) return;
    
    try {
        const response = await apiCall('/api/cart/');
        cartItems = response.items;
        updateCartCount();
        renderCart();
    } catch (error) {
        console.error('Failed to load cart:', error);
    }
}

function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        cartCount.textContent = cartItems.length;
    }
}

function renderCart() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (!cartItemsContainer) return;
    
    if (cartItems.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align: center; color: var(--text-gray);">Your cart is empty</p>';
        cartTotal.textContent = '$0.00';
        return;
    }
    
    const total = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    
    cartItemsContainer.innerHTML = cartItems.map(item => `
        <div class="cart-item" style="display: flex; align-items: center; gap: 1rem; padding: 1rem; border-bottom: 1px solid var(--text-gray);">
            <div class="cart-item-image" style="width: 60px; height: 60px; background: var(--secondary-dark); border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
                ${item.product.images && item.product.images.length > 0 ? 
                    `<img src="${item.product.images[0]}" alt="${item.product.title}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;">` :
                    '👕'
                }
            </div>
            <div class="cart-item-details" style="flex: 1;">
                <h4 style="margin: 0; color: var(--accent-neon-cyan);">${item.product.title}</h4>
                <p style="margin: 0.25rem 0; color: var(--text-gray);">Size: ${item.size} | Qty: ${item.quantity}</p>
                <p style="margin: 0; color: var(--accent-neon-pink); font-weight: bold;">$${(item.product.price * item.quantity).toFixed(2)}</p>
            </div>
            <button onclick="removeFromCart('${item.id}')" style="background: none; border: none; color: var(--accent-neon-pink); cursor: pointer; font-size: 1.5rem;">×</button>
        </div>
    `).join('');
    
    cartTotal.textContent = `$${total.toFixed(2)}`;
}

async function removeFromCart(itemId) {
    try {
        await apiCall(`/api/cart/remove/${itemId}`, {
            method: 'DELETE'
        });
        
        await loadCart();
        showNotification('Item removed from cart', 'success');
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Search functions
let searchTimeout;

function initSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        
        if (query.length < 2) {
            document.getElementById('searchSuggestions').innerHTML = '';
            return;
        }
        
        searchTimeout = setTimeout(() => {
            searchProducts(query);
        }, 300);
    });
}

async function searchProducts(query) {
    try {
        const response = await apiCall(`/api/products/search/suggestions?q=${encodeURIComponent(query)}`);
        renderSearchSuggestions(response.suggestions);
    } catch (error) {
        console.error('Search error:', error);
    }
}

function renderSearchSuggestions(suggestions) {
    const container = document.getElementById('searchSuggestions');
    if (!container) return;
    
    if (suggestions.length === 0) {
        container.innerHTML = '<p style="padding: 1rem; color: var(--text-gray);">No products found</p>';
        return;
    }
    
    container.innerHTML = suggestions.map(product => `
        <div class="search-suggestion" onclick="window.location.href='/product/${product.id}'" style="padding: 1rem; border-bottom: 1px solid var(--text-gray); cursor: pointer; transition: background 0.3s ease;">
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="width: 40px; height: 40px; background: var(--secondary-dark); border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                    ${product.image ? 
                        `<img src="${product.image}" alt="${product.title}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;">` :
                        '👕'
                    }
                </div>
                <div>
                    <h4 style="margin: 0; color: var(--accent-neon-cyan);">${product.title}</h4>
                    <p style="margin: 0; color: var(--text-gray);">${product.brand} - $${product.price.toFixed(2)}</p>
                </div>
            </div>
        </div>
    `).join('');
}

// Exchange statistics
async function loadExchangeStats() {
    try {
        const [exchangesResponse, usersResponse] = await Promise.all([
            apiCall('/api/exchanges'),
            apiCall('/api/auth/users')
        ]);
        
        document.getElementById('exchangeCount').textContent = exchangesResponse.exchanges.filter(e => e.status === 'pending').length;
        document.getElementById('userCount').textContent = usersResponse.users.length;
        
        // Calculate average rating
        const ratings = usersResponse.users.map(u => u.profile?.exchangeRating || 0).filter(r => r > 0);
        const avgRating = ratings.length > 0 ? (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1) : '0.0';
        document.getElementById('ratingAvg').textContent = avgRating;
    } catch (error) {
        console.error('Failed to load exchange stats:', error);
    }
}

// Modal functions
function initModals() {
    // Search modal
    const searchBtn = document.getElementById('searchBtn');
    const searchModal = document.getElementById('searchModal');
    
    if (searchBtn && searchModal) {
        searchBtn.onclick = () => {
            searchModal.style.display = 'flex';
            document.getElementById('searchInput').focus();
        };
        
        searchModal.onclick = (e) => {
            if (e.target === searchModal) {
                searchModal.style.display = 'none';
            }
        };
    }
    
    // Cart modal
    const cartBtn = document.getElementById('cartBtn');
    const cartModal = document.getElementById('cartModal');
    const closeCart = document.getElementById('closeCart');
    
    if (cartBtn && cartModal) {
        cartBtn.onclick = () => {
            cartModal.style.display = 'flex';
            loadCart();
        };
        
        closeCart.onclick = () => {
            cartModal.style.display = 'none';
        };
        
        cartModal.onclick = (e) => {
            if (e.target === cartModal) {
                cartModal.style.display = 'none';
            }
        };
    }
    
    // Auth modal - handled by auth.js
    // const authModal = document.getElementById('authModal');
    // const closeAuth = document.getElementById('closeAuth');
    
    // if (closeAuth && authModal) {
    //     closeAuth.onclick = () => {
    //         authModal.style.display = 'none';
    //     };
        
    //     authModal.onclick = (e) => {
    //         if (e.target === authModal) {
    //             authModal.style.display = 'none';
    //         }
    //     };
    // }
}

// Add to Cart Modal Functions
// These functions are now defined in the IIFE above

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', function() {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('zippyCart');
    if (savedCart) {
        window.cartItems = JSON.parse(savedCart);
    } else {
        window.cartItems = [];
    }
    updateCartCountLocal();
});

// Initialize everything
async function init() {
    showLoading();
    
    try {
        await checkAuth();
        await loadFeaturedProducts();
        await loadExchangeStats();
        
        initModals();
        initSearch();
        
        // Add parallax effect to floating elements
        const floatingItems = document.querySelectorAll('.floating-item');
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            floatingItems.forEach(item => {
                const speed = parseFloat(item.dataset.speed) || 0.5;
                item.style.transform = `translateY(${scrolled * speed}px)`;
            });
        });
        
    } catch (error) {
        console.error('Initialization error:', error);
        showNotification('Failed to initialize application', 'error');
    } finally {
        hideLoading();
    }
}

// Start the application
document.addEventListener('DOMContentLoaded', init);

// Add fallback for updateAuthUI
window.updateAuthUI = window.updateAuthUI || function() {};

// Export functions for other scripts
window.ZippyApp = {
    apiCall,
    showNotification,
    addToCart,
    loadCart,
    checkAuth,
    currentUser: () => window.currentUser
};

// Make modal functions globally available immediately
(function() {
    // Define functions first
    function showAddToCartModal(product) {
        console.log('showAddToCartModal called with:', product);
        const modal = document.getElementById('addToCartModal');
        const productContainer = document.getElementById('addToCartProduct');
        
        if (!modal || !productContainer) return;
        
        // Populate product details
        productContainer.innerHTML = `
            <div class="add-to-cart-product-image">
                <img src="${product.images && product.images.length > 0 ? product.images[0] : '/images/placeholder.jpg'}" alt="${product.title || product.name}" onerror="this.src='/images/placeholder.jpg'">
            </div>
            <div class="add-to-cart-product-info">
                <div class="add-to-cart-product-name">${product.title || product.name}</div>
                <div class="add-to-cart-product-price">$${product.price.toFixed(2)}</div>
            </div>
        `;
        
        // Show modal with animation
        modal.classList.add('active');
        
        // Store product for later use
        window.currentProduct = product;
        
        // Auto-scroll to top to ensure modal is visible
        setTimeout(() => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }, 100);
    }

    function closeAddToCartModal() {
        const modal = document.getElementById('addToCartModal');
        if (modal) {
            modal.classList.remove('active');
        }
        window.currentProduct = null;
    }

    function addToCartAndClose() {
        console.log('addToCartAndClose called. window.currentProduct:', window.currentProduct);
        if (window.currentProduct) {
            addToCartLocal(window.currentProduct);
            closeAddToCartModal();
            
            // Show success notification
            showNotification('Product added to cart successfully!', 'success');
        }
    }

    function addToCartLocal(product) {
        if (!window.cartItems) {
            window.cartItems = [];
        }
        
        // Check if product already exists in cart
        const existingItem = window.cartItems.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            window.cartItems.push({
                ...product,
                quantity: 1
            });
        }
        
        // Save to localStorage
        localStorage.setItem('zippyCart', JSON.stringify(window.cartItems));
        
        // Update cart count
        updateCartCountLocal();
        
        // Update cart display if on cart page
        if (typeof updateCartDisplay === 'function') {
            updateCartDisplay();
        }
    }

    function updateCartCountLocal() {
        const cartCountElement = document.getElementById('cartCount');
        if (!cartCountElement) return;
        
        const totalItems = window.cartItems ? window.cartItems.reduce((total, item) => total + item.quantity, 0) : 0;
        
        cartCountElement.textContent = totalItems;
        
        // Add animation class if items were added
        if (totalItems > 0) {
            cartCountElement.style.animation = 'none';
            setTimeout(() => {
                cartCountElement.style.animation = 'cart-count-pulse 0.6s ease-in-out';
            }, 10);
        }
    }

    function directOrder(product) {
        // Add to cart first
        addToCartLocal(product);
        
        // Show success notification
        showNotification('Product added to cart! Redirecting to checkout...', 'success');
        
        // Redirect to cart page after a short delay
        setTimeout(() => {
            window.location.href = '/cart';
        }, 1500);
    }

    // Make all functions globally available
    window.showAddToCartModal = showAddToCartModal;
    window.closeAddToCartModal = closeAddToCartModal;
    window.addToCartAndClose = addToCartAndClose;
    window.addToCartLocal = addToCartLocal;
    window.updateCartCountLocal = updateCartCountLocal;
    window.directOrder = directOrder;

    // Also make the old functions available for backward compatibility
    window.addToCart = addToCartLocal;
    window.updateCartCount = updateCartCountLocal;
    
    // Debug: Log that functions are available
    console.log('Modal functions loaded:', {
        showAddToCartModal: typeof window.showAddToCartModal,
        closeAddToCartModal: typeof window.closeAddToCartModal,
        addToCartAndClose: typeof window.addToCartAndClose,
        addToCartLocal: typeof window.addToCartLocal,
        updateCartCountLocal: typeof window.updateCartCountLocal,
        directOrder: typeof window.directOrder
    });
    
    // Also ensure functions are available on window load
    window.addEventListener('load', function() {
        console.log('Window loaded - checking modal functions:', {
            addToCartAndClose: typeof window.addToCartAndClose,
            showAddToCartModal: typeof window.showAddToCartModal
        });
    });
    
    // Ensure functions are available immediately after DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log('DOM loaded - checking modal functions:', {
                addToCartAndClose: typeof window.addToCartAndClose,
                showAddToCartModal: typeof window.showAddToCartModal
            });
        });
    } else {
        console.log('DOM already loaded - checking modal functions:', {
            addToCartAndClose: typeof window.addToCartAndClose,
            showAddToCartModal: typeof window.showAddToCartModal
        });
    }
})(); 