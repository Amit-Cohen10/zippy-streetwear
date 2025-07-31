// Products Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Only run on products page
    if (!window.location.pathname.includes('products')) {
        return;
    }

    // Sample product data
    const products = [
        { id: 1, name: "Neural Network Hoodie", price: 459, category: "hoodies", image: "/images/products/neural-network-hoodie.jpg", status: "available" },
        { id: 2, name: "Glitch Reality Hoodie", price: 429, category: "hoodies", image: "/images/products/glitch-reality-hoodie.jpg", status: "sold-out" },
        { id: 3, name: "Cyber Samurai Hoodie", price: 489, category: "hoodies", image: "/images/products/cyber-samurai-hoodie.jpg", status: "available" },
        { id: 4, name: "Data Stream Hoodie", price: 449, category: "hoodies", image: "/images/products/data-stream-hoodie.jpg", status: "available" },
        { id: 5, name: "Neon Skyline Hoodie", price: 469, category: "hoodies", image: "/images/products/neon-skyline-hoodie.jpg", status: "available" },
        { id: 6, name: "Hologram Hoodie", price: 499, category: "hoodies", image: "/images/products/hologram-hoodie.jpg", status: "available" },
        { id: 7, name: "Matrix Rain Hoodie", price: 439, category: "hoodies", image: "/images/products/matrix-rain-hoodie.jpg", status: "available" },
        { id: 8, name: "Quantum Hoodie", price: 479, category: "hoodies", image: "/images/products/quantum-hoodie.jpg", status: "available" },
        { id: 9, name: "Retro Future Hoodie", price: 459, category: "hoodies", image: "/images/products/retro-future-hoodie.jpg", status: "available" },
        { id: 10, name: "Digital Camo Hoodie", price: 449, category: "hoodies", image: "/images/products/digital-camo-hoodie.jpg", status: "available" },
        
        // T-Shirts
        { id: 11, name: "404 Not Found Tee", price: 189, category: "t-shirts", image: "/images/products/404-not-found-tee.jpg", status: "available" },
        { id: 12, name: "System Override Tee", price: 179, category: "t-shirts", image: "/images/products/system-override-tee.jpg", status: "available" },
        { id: 13, name: "Neon Pulse Tee", price: 199, category: "t-shirts", image: "/images/products/neon-pulse-tee.jpg", status: "available" },
        { id: 14, name: "Crypto Punk Tee", price: 209, category: "t-shirts", image: "/images/products/crypto-punk-tee.jpg", status: "available" },
        { id: 15, name: "Augmented Tee", price: 189, category: "t-shirts", image: "/images/products/augmented-tee.jpg", status: "available" },
        { id: 16, name: "Vapor Dream Tee", price: 179, category: "t-shirts", image: "/images/products/vapor-dream-tee.jpg", status: "available" },
        { id: 17, name: "Code Warrior Tee", price: 199, category: "t-shirts", image: "/images/products/code-warrior-tee.jpg", status: "available" },
        { id: 18, name: "Electric Night Tee", price: 189, category: "t-shirts", image: "/images/products/electric-night-tee.jpg", status: "available" },
        { id: 19, name: "Pixel Art Tee", price: 169, category: "t-shirts", image: "/images/products/pixel-art-tee.jpg", status: "available" },
        { id: 20, name: "Cyber Rose Tee", price: 199, category: "t-shirts", image: "/images/products/cyber-rose-tee.jpg", status: "available" },
        
        // Pants
        { id: 21, name: "Tactical Tech Cargo", price: 589, category: "pants", image: "/images/products/tactical-tech-cargo.jpg", status: "available" },
        { id: 22, name: "Data Runner Pants", price: 549, category: "pants", image: "/images/products/data-runner-pants.jpg", status: "available" },
        { id: 23, name: "Urban Operator Pants", price: 599, category: "pants", image: "/images/products/urban-operator-pants.jpg", status: "available" },
        { id: 24, name: "Neon Racer Pants", price: 569, category: "pants", image: "/images/products/neon-racer-pants.jpg", status: "available" },
        { id: 25, name: "Grid Walker Pants", price: 579, category: "pants", image: "/images/products/grid-walker-pants.jpg", status: "available" },
        { id: 26, name: "Shadow Tech Pants", price: 559, category: "pants", image: "/images/products/shadow-tech-pants.jpg", status: "available" },
        { id: 27, name: "Circuit Breaker Pants", price: 589, category: "pants", image: "/images/products/circuit-breaker-pants.jpg", status: "available" },
        { id: 28, name: "Holo Flex Pants", price: 629, category: "pants", image: "/images/products/holo-flex-pants.jpg", status: "available" },
        { id: 29, name: "Code Cargo Pants", price: 579, category: "pants", image: "/images/products/code-cargo-pants.jpg", status: "available" },
        { id: 30, name: "Cyber Ninja Pants", price: 599, category: "pants", image: "/images/products/cyber-ninja-pants.jpg", status: "available" }
    ];

    let filteredProducts = [...products];
    let isInitialized = false;
    let currentView = 'grid';
    let lastRenderTime = 0;
    const RENDER_THROTTLE = 100; // Prevent excessive re-renders

    // Initialize the page
    function init() {
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
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // DOM is already ready
        setTimeout(init, 0);
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', function() {
        if (performanceObserver) {
            performanceObserver.disconnect();
        }
        cleanup();
    });
}); 