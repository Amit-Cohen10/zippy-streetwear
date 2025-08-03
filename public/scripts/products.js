// Products Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Only run on products page
    if (!window.location.pathname.includes('products')) {
        return;
    }

    // Load products from server
    let products = [];
    
    async function loadProducts() {
        try {
            const response = await fetch('/api/products');
            if (response.ok) {
                const data = await response.json();
                products = data.products.map(product => ({
                    id: product.id,
                    name: product.title,
                    price: product.price,
                    category: product.category,
                    image: product.images && product.images.length > 0 ? product.images[0] : '/images/placeholder.jpg',
                    status: "available",
                    brand: product.brand,
                    sizes: product.sizes
                }));
                console.log('✅ Products loaded from server:', products.length);
            } else {
                console.error('❌ Failed to load products from server');
                // Fallback to sample data
                products = [
                    { id: "prod-006", name: "Neural Network Hoodie", price: 149.99, category: "hoodies", image: "/images/neural-hoodie-1.jpg", status: "available", brand: "Zippy Originals", sizes: ["S", "M", "L", "XL", "XXL"] }
                ];
            }
        } catch (error) {
            console.error('❌ Error loading products:', error);
            // Fallback to sample data
            products = [
                { id: "prod-006", name: "Neural Network Hoodie", price: 149.99, category: "hoodies", image: "/images/neural-hoodie-1.jpg", status: "available", brand: "Zippy Originals", sizes: ["S", "M", "L", "XL", "XXL"] }
            ];
        }
    }

    let filteredProducts = [...products];
    let isInitialized = false;
    let currentView = 'grid';
    let lastRenderTime = 0;
    const RENDER_THROTTLE = 100; // Prevent excessive re-renders

    // Initialize the page
    async function init() {
        if (isInitialized) return;
        
        try {
            // Load products from server first
            await loadProducts();
            
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
                console.warn('Missing critical elements:', missingElements);
                // Wait a bit and try again
                setTimeout(init, 100);
                return;
            }
            
            // Initialize with requestAnimationFrame for better performance
            requestAnimationFrame(() => {
                try {
                    renderProducts();
                    setupEventListeners();
                    updateResultsCount();
                    isInitialized = true;
                    
                    // Hide loading overlay if exists
                    const loadingOverlay = document.getElementById('loadingOverlay');
                    if (loadingOverlay) {
                        loadingOverlay.style.display = 'none';
                    }
                    
                    console.log('Products page initialized successfully');
                } catch (error) {
                    console.error('Error in initialization animation frame:', error);
                    // Fallback initialization
                    setTimeout(() => {
                        try {
                            renderProducts();
                            setupEventListeners();
                            updateResultsCount();
                            isInitialized = true;
                        } catch (fallbackError) {
                            console.error('Fallback initialization failed:', fallbackError);
                        }
                    }, 500);
                }
            });
        } catch (error) {
            console.error('Error initializing products page:', error);
            // Final fallback
            setTimeout(init, 1000);
        }
    }

    // Optimized render function with throttling
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

        // Use DocumentFragment for better performance
        const fragment = document.createDocumentFragment();
        
        filteredProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.dataset.productId = product.id;
            
            productCard.innerHTML = `
                <div class="product-image-wrapper">
                    <div class="product-placeholder">
                        <div class="placeholder-icon">👕</div>
                        <div class="placeholder-text">${product.name}</div>
                    </div>
                    ${product.status === 'sold-out' ? '<span class="sold-out-badge">SOLD OUT</span>' : ''}
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-price">${product.price} NIS</p>
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
            
            // Add click handler
            productCard.addEventListener('click', function() {
                const productId = this.dataset.productId;
                if (productId) {
                    window.location.href = `/product-detail.html?id=${productId}`;
                }
            });
            
            fragment.appendChild(productCard);
        });
        
        // Clear and append in one operation
        grid.innerHTML = '';
        grid.appendChild(fragment);
    }

    // Setup event listeners with error handling
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

        // Add event listeners only if elements exist
        Object.entries(elements).forEach(([key, element]) => {
            if (element) {
                if (key === 'applyFilters' || key === 'clearFilters') {
                    element.addEventListener('click', key === 'applyFilters' ? applyFilters : clearFilters, { passive: true });
                } else {
                    element.addEventListener('change', applyFilters, { passive: true });
                }
            }
        });

        // Add input listeners for price filters with debouncing
        if (elements.minPrice) {
            elements.minPrice.addEventListener('input', debounce(applyFilters, 300), { passive: true });
        }
        if (elements.maxPrice) {
            elements.maxPrice.addEventListener('input', debounce(applyFilters, 300), { passive: true });
        }
        
        // View buttons with passive listeners
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const view = this.dataset.view;
                if (view) {
                    setView(view);
                }
            }, { passive: false });
        });
        
        // Add scroll optimization
        let scrollTimeout;
        window.addEventListener('scroll', function() {
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
            scrollTimeout = setTimeout(() => {
                // Optimize scroll performance
                document.body.style.pointerEvents = 'auto';
            }, 100);
        }, { passive: true });
        
        // Add resize optimization
        let resizeTimeout;
        window.addEventListener('resize', function() {
            if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }
            resizeTimeout = setTimeout(() => {
                // Re-render on resize if needed
                if (isInitialized) {
                    renderProducts();
                }
            }, 250);
        }, { passive: true });
    }

    // Enhanced debounce function with better performance
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

    // Memory cleanup function
    function cleanup() {
        // Remove event listeners to prevent memory leaks
        const elements = document.querySelectorAll('.product-card, .view-btn, .filter-group select, .filter-group input');
        elements.forEach(element => {
            element.replaceWith(element.cloneNode(true));
        });
    }

    // Enhanced error handling
    window.addEventListener('error', function(e) {
        console.error('Global error caught:', e.error);
        // Try to recover gracefully
        if (isInitialized) {
            setTimeout(() => {
                try {
                    renderProducts();
                } catch (error) {
                    console.error('Recovery failed:', error);
                }
            }, 1000);
        }
    });

    // Performance monitoring
    let performanceObserver;
    if ('PerformanceObserver' in window) {
        try {
            performanceObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'longtask') {
                        console.warn('Long task detected:', entry.duration);
                    }
                }
            });
            performanceObserver.observe({ entryTypes: ['longtask'] });
        } catch (error) {
            console.warn('PerformanceObserver not supported');
        }
    }

    // Optimized apply filters with memoization
    let lastFilterState = '';
    function applyFilters() {
        try {
            const category = document.getElementById('categoryFilter')?.value || '';
            const brand = document.getElementById('brandFilter')?.value || '';
            const size = document.getElementById('sizeFilter')?.value || '';
            const sortBy = document.getElementById('sortFilter')?.value || 'createdAt';
            const minPrice = document.getElementById('minPrice')?.value || '';
            const maxPrice = document.getElementById('maxPrice')?.value || '';

            // Create filter state string for memoization
            const filterState = `${category}-${brand}-${size}-${sortBy}-${minPrice}-${maxPrice}`;
            
            // Skip if filter state hasn't changed
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

    // Optimized sort products
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
                    // Keep original order
                    break;
            }
        } catch (error) {
            console.error('Error sorting products:', error);
        }
    }

    // Optimized clear filters
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

            // Clear values only if elements exist
            Object.values(elements).forEach(element => {
                if (element) {
                    element.value = '';
                }
            });

            // Reset sort to default
            if (elements.sortFilter) {
                elements.sortFilter.value = 'createdAt';
            }
            
            // Reset filter state
            lastFilterState = '';
            filteredProducts = [...products];
            renderProducts();
            updateResultsCount();
        } catch (error) {
            console.error('Error clearing filters:', error);
        }
    }

    // Optimized set view mode
    function setView(view) {
        try {
            if (currentView === view) return; // Skip if view hasn't changed
            
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

    // Optimized update results count
    let lastCount = -1;
    function updateResultsCount() {
        try {
            const count = filteredProducts.length;
            if (count === lastCount) return; // Skip if count hasn't changed
            
            lastCount = count;
            const countElement = document.getElementById('resultsCount');
            if (countElement) {
                countElement.textContent = count;
            }
        } catch (error) {
            console.error('Error updating results count:', error);
        }
    }

    // Initialize the page with a small delay to ensure DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => init().catch(error => {
            console.error('Failed to initialize products page:', error);
        }));
    } else {
        // DOM is already ready
        setTimeout(() => init().catch(error => {
            console.error('Failed to initialize products page:', error);
        }), 0);
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', function() {
        if (performanceObserver) {
            performanceObserver.disconnect();
        }
        cleanup();
    });
}); 