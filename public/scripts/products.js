// Products Page JavaScript

let products = [];
let filteredProducts = [];
let isInitialized = false;
let currentView = 'grid';
let lastRenderTime = 0;
const RENDER_THROTTLE = 100; // Prevent excessive re-renders
let lastCount = -1;
let lastFilterState = '';

document.addEventListener('DOMContentLoaded', function() {
    // Only run on products page
    if (!window.location.pathname.includes('products')) {
        return;
    }

    // Load products from server
    async function loadProducts() {
        try {
            const response = await fetch('/api/products?limit=50&page=1');
            if (response.ok) {
                const data = await response.json();
                products = (data.products || []).map(product => ({
                    id: product.id,
                    name: product.title,
                    price: product.price,
                    category: product.category,
                    image: product.images && product.images.length > 0 ? product.images[0] : '/images/placeholder.jpg',
                    status: "available",
                    brand: product.brand,
                    sizes: product.sizes
                }));
            } else {
                // fallback to empty
                products = [];
            }
        } catch (error) {
            products = [];
        }
        filteredProducts = [...products];
    }

    function renderProducts() {
        const now = Date.now();
        if (now - lastRenderTime < RENDER_THROTTLE) {
            setTimeout(() => renderProducts(), RENDER_THROTTLE - (now - lastRenderTime));
            return;
        }
        lastRenderTime = now;

        const grid = document.getElementById('productsGrid');
        if (!grid) {
            console.error('Products grid not found');
            return;
        }
        if (filteredProducts.length === 0) {
            grid.innerHTML = `
                <div class="no-products" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                    <h3 style="font-family: 'Space Grotesk', sans-serif; color: var(--text-gray); margin-bottom: 16px;">No products found</h3>
                    <p style="font-family: 'Space Grotesk', sans-serif; color: var(--text-gray);">Try adjusting your filters or browse all products.</p>
                </div>
            `;
            return;
        }
        const fragment = document.createDocumentFragment();
        filteredProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.dataset.productId = product.id;
            productCard.innerHTML = `
                <div class="product-image-wrapper">
                    ${product.image ? 
                        `<img src="${product.image}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">` :
                        `<div class="product-placeholder">
                            <div class="placeholder-icon">👕</div>
                            <div class="placeholder-text">${product.name}</div>
                        </div>`
                    }
                    ${product.status === 'sold-out' ? '<span class="sold-out-badge">SOLD OUT</span>' : ''}
                    ${product.status === 'available' ? 
                        `<button class="wishlist-btn" onclick="event.stopPropagation(); toggleWishlist('${product.id}')" data-product-id="${product.id}">
                            <i class="fas fa-heart"></i>
                        </button>` : ''
                    }
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-price">$${product.price.toFixed(2)}</p>
                    ${product.status === 'available' ? 
                        `<div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                            <button class="add-to-cart-btn" onclick="event.stopPropagation(); window.location.href='/product-detail.html?id=${product.id}'">
                                Add to Cart
                            </button>
                        </div>` : 
                        `<button class="add-to-cart-btn disabled" disabled>Sold Out</button>`
                    }
                </div>
            `;
            productCard.addEventListener('click', function() {
                const productId = this.dataset.productId;
                if (productId) {
                    window.location.href = `/product-detail.html?id=${productId}`;
                }
            });
            fragment.appendChild(productCard);
        });
        grid.innerHTML = '';
        grid.appendChild(fragment);
    }

    function setupEventListeners() {
        const elements = {
            categoryFilter: document.getElementById('categoryFilter'),
            brandFilter: document.getElementById('brandFilter'),
            sizeFilter: document.getElementById('sizeFilter'),
            sortFilter: document.getElementById('sortFilter'),
            minPrice: document.getElementById('minPrice'),
            maxPrice: document.getElementById('maxPrice'),
            applyFilters: document.getElementById('applyFilters'),
            clearFilters: document.getElementById('clearFilters')
        };
        Object.entries(elements).forEach(([key, element]) => {
            if (element) {
                if (key === 'applyFilters' || key === 'clearFilters') {
                    element.addEventListener('click', key === 'applyFilters' ? applyFilters : clearFilters, { passive: true });
                } else {
                    element.addEventListener('change', applyFilters, { passive: true });
                }
            }
        });
        if (elements.minPrice) {
            elements.minPrice.addEventListener('input', debounce(applyFilters, 300), { passive: true });
        }
        if (elements.maxPrice) {
            elements.maxPrice.addEventListener('input', debounce(applyFilters, 300), { passive: true });
        }
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const view = this.dataset.view;
                if (view) {
                    setView(view);
                }
            }, { passive: false });
        });
        let scrollTimeout;
        window.addEventListener('scroll', function() {
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
            scrollTimeout = setTimeout(() => {
                document.body.style.pointerEvents = 'auto';
            }, 100);
        }, { passive: true });
        let resizeTimeout;
        window.addEventListener('resize', function() {
            if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }
            resizeTimeout = setTimeout(() => {
                if (isInitialized) {
                    renderProducts();
                }
            }, 250);
        }, { passive: true });
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function cleanup() {
        const elements = document.querySelectorAll('.product-card, .view-btn, .filter-group select, .filter-group input');
        elements.forEach(element => {
            element.replaceWith(element.cloneNode(true));
        });
    }

    function applyFilters() {
        try {
            const category = document.getElementById('categoryFilter')?.value || '';
            const brand = document.getElementById('brandFilter')?.value || '';
            const size = document.getElementById('sizeFilter')?.value || '';
            const sortBy = document.getElementById('sortFilter')?.value || 'createdAt';
            const minPrice = document.getElementById('minPrice')?.value || '';
            const maxPrice = document.getElementById('maxPrice')?.value || '';
            const filterState = `${category}-${brand}-${size}-${sortBy}-${minPrice}-${maxPrice}`;
            if (filterState === lastFilterState) {
                return;
            }
            lastFilterState = filterState;
            filteredProducts = products.filter(product => {
                if (category && product.category !== category) return false;
                if (brand && brand !== 'Zippy Originals') return false;
                if (minPrice && product.price < parseInt(minPrice)) return false;
                if (maxPrice && product.price > parseInt(maxPrice)) return false;
                return true;
            });
            sortProducts(sortBy);
            renderProducts();
            updateResultsCount();
        } catch (error) {
            console.error('Error applying filters:', error);
        }
    }

    function sortProducts(sortBy) {
        try {
            switch(sortBy) {
                case 'price':
                    filteredProducts.sort((a, b) => a.price - b.price);
                    break;
                case 'price-desc':
                    filteredProducts.sort((a, b) => b.price - a.price);
                    break;
                case 'title':
                    filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                default:
                    break;
            }
        } catch (error) {
            console.error('Error sorting products:', error);
        }
    }

    function clearFilters() {
        try {
            const elements = {
                categoryFilter: document.getElementById('categoryFilter'),
                brandFilter: document.getElementById('brandFilter'),
                sizeFilter: document.getElementById('sizeFilter'),
                sortFilter: document.getElementById('sortFilter'),
                minPrice: document.getElementById('minPrice'),
                maxPrice: document.getElementById('maxPrice')
            };
            Object.values(elements).forEach(element => {
                if (element) {
                    element.value = '';
                }
            });
            if (elements.sortFilter) {
                elements.sortFilter.value = 'createdAt';
            }
            lastFilterState = '';
            filteredProducts = [...products];
            renderProducts();
            updateResultsCount();
        } catch (error) {
            console.error('Error clearing filters:', error);
        }
    }

    function setView(view) {
        try {
            if (currentView === view) return;
            currentView = view;
            document.querySelectorAll('.view-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.view === view);
            });
            const grid = document.getElementById('productsGrid');
            if (grid) {
                grid.className = `products-grid stussy-style ${view === 'list' ? 'list-view' : ''}`;
                renderProducts();
            }
        } catch (error) {
            console.error('Error setting view:', error);
        }
    }

    function updateResultsCount() {
        try {
            const count = filteredProducts.length;
            if (count === lastCount) return;
            lastCount = count;
            const countElement = document.getElementById('resultsCount');
            if (countElement) {
                countElement.textContent = count;
            }
        } catch (error) {
            console.error('Error updating results count:', error);
        }
    }

    async function init() {
        if (isInitialized) return;
        try {
            // Pre-load critical elements
            const criticalElements = [
                'productsGrid',
                'categoryFilter',
                'brandFilter',
                'sizeFilter',
                'sortFilter',
                'minPrice',
                'maxPrice',
                'applyFilters',
                'clearFilters',
                'resultsCount'
            ];
            const missingElements = criticalElements.filter(id => !document.getElementById(id));
            if (missingElements.length > 0) {
                setTimeout(init, 100);
                return;
            }
            await loadProducts();
            filteredProducts = [...products];
            requestAnimationFrame(() => {
                try {
                    renderProducts();
                    setupEventListeners();
                    updateResultsCount();
                    initializeWishlistButtons(); // Initialize wishlist buttons
                    isInitialized = true;
                    const loadingOverlay = document.getElementById('loadingOverlay');
                    if (loadingOverlay) {
                        loadingOverlay.style.display = 'none';
                    }
                } catch (error) {
                    setTimeout(() => {
                        try {
                            renderProducts();
                            setupEventListeners();
                            updateResultsCount();
                            initializeWishlistButtons(); // Initialize wishlist buttons
                            isInitialized = true;
                        } catch (fallbackError) {}
                    }, 500);
                }
            });
        } catch (error) {
            setTimeout(init, 1000);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 0);
    }

    window.addEventListener('beforeunload', function() {
        cleanup();
    });
});

// Wishlist functionality
function toggleWishlist(productId) {
    try {
        // Check if user is logged in
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) {
            // Show login modal if user is not logged in
            if (typeof openAuthModal === 'function') {
                openAuthModal();
            } else {
                alert('Please log in to add items to your wishlist');
            }
            return;
        }

        // Get current wishlist
        let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        
        // Check if product is already in wishlist
        const isInWishlist = wishlist.some(item => item.id === productId);
        
        if (isInWishlist) {
            // Remove from wishlist
            wishlist = wishlist.filter(item => item.id !== productId);
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
            
            // Update button appearance
            const wishlistBtn = document.querySelector(`[data-product-id="${productId}"]`);
            if (wishlistBtn) {
                wishlistBtn.classList.remove('active');
            }
            
            // Show notification
            showNotification('Product removed from wishlist', 'info');
        } else {
            // Add to wishlist - find product from the global products array
            const product = products.find(p => p.id === productId);
            if (product) {
                wishlist.push({
                    id: productId,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    category: product.category,
                    brand: product.brand,
                    addedAt: new Date().toISOString()
                });
                localStorage.setItem('wishlist', JSON.stringify(wishlist));
                
                // Update button appearance
                const wishlistBtn = document.querySelector(`[data-product-id="${productId}"]`);
                if (wishlistBtn) {
                    wishlistBtn.classList.add('active');
                }
                
                // Show notification and redirect to wishlist page
                showNotification('Product added to wishlist! Redirecting to wishlist page...', 'success');
                
                // Redirect to wishlist page after a short delay
                setTimeout(() => {
                    window.location.href = '/wishlist.html';
                }, 1500);
            } else {
                console.error('Product not found:', productId);
                showNotification('Product not found', 'error');
            }
        }
        
        // Update wishlist count in navbar if it exists
        updateWishlistCount();
        
    } catch (error) {
        console.error('Error toggling wishlist:', error);
        showNotification('Error updating wishlist', 'error');
    }
}

function updateWishlistCount() {
    try {
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        const wishlistCount = wishlist.length;
        
        // Update wishlist count in navbar if it exists
        const wishlistCountElement = document.getElementById('wishlistCount');
        if (wishlistCountElement) {
            wishlistCountElement.textContent = wishlistCount;
        }
    } catch (error) {
        console.error('Error updating wishlist count:', error);
    }
}

function showNotification(message, type = 'info') {
    try {
        // Create notification element
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
        
        // Set background color based on type
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
        
        // Add to page
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
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



function updateWishlistButtonStates() {
    try {
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        const wishlistIds = wishlist.map(item => item.id);
        
        // Update all wishlist buttons
        document.querySelectorAll('.wishlist-btn').forEach(btn => {
            const productId = btn.getAttribute('data-product-id');
            if (wishlistIds.includes(productId)) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    } catch (error) {
        console.error('Error updating wishlist button states:', error);
    }
}

// Initialize wishlist buttons when products are loaded
function initializeWishlistButtons() {
    // Wait a bit for products to be loaded
    setTimeout(() => {
        updateWishlistButtonStates();
        updateWishlistCount();
    }, 500);
} 