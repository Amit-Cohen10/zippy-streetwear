// My Items Page - Project requirement: My items screen should show all the items you have bought
console.log('🚀 My Items page loading...');

// Wait for page to load
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM loaded, initializing My Items...');
    initMyItems();
    
    // Setup admin access checks
    setTimeout(() => {
        if (typeof setupAdminAccessChecks === 'function') {
            setupAdminAccessChecks();
        }
    }, 1000);
});

// Check user login status with better timing
function checkUserLoginWithDelay() {
    return new Promise((resolve) => {
        let attempts = 0;
        const maxAttempts = 10;
        
        function tryCheck() {
            attempts++;
            console.log(`🔍 User check attempt ${attempts}/${maxAttempts}`);
            
            const savedUser = localStorage.getItem('currentUser');
            if (savedUser) {
                try {
                    const user = JSON.parse(savedUser);
                    console.log('✅ User found:', user.username || user.email);
                    resolve(user);
                    return;
                } catch (e) {
                    console.log('❌ Error parsing user data:', e);
                }
            }
            
            if (attempts < maxAttempts) {
                console.log(`⏳ No user found, trying again in ${attempts * 200}ms...`);
                setTimeout(tryCheck, attempts * 200);
            } else {
                console.log('❌ No user found after all attempts');
                resolve(null);
            }
        }
        
        // Start checking after a delay
        setTimeout(tryCheck, 500);
    });
}

// Main initialization
async function initMyItems() {
    console.log('⚡ Initializing My Items page...');
    
    // Wait a bit for the page to fully load before checking
    setTimeout(async () => {
        // Initialize session timeout system
        initSessionTimeout();
        
        // Check server session first
        const serverSessionValid = await checkServerSession();
        if (!serverSessionValid) {
            console.log('🔒 Server session expired, ensuring complete logout');
            ensureCompleteLogout();
            return;
        }
        
        // Check user login with better timing
        const currentUser = await checkUserLoginWithDelay();
        
        if (currentUser) {
            console.log('✅ User is logged in:', currentUser.username || currentUser.email);
            loadOrders();
        } else {
            console.log('❌ No user found, ensuring complete logout');
            ensureCompleteLogout();
        }
    }, 1000);
}

// Check if user is logged in (improved version)
function checkUserLogin() {
    try {
        console.log('🔍 Checking login status...');
        
        const userData = localStorage.getItem('currentUser');
        console.log('📦 Raw user data from localStorage:', userData);
        
        if (!userData) {
            console.log('❌ No user data found in localStorage');
            return null;
        }
        
        const user = JSON.parse(userData);
        console.log('👤 Parsed user object:', user);
        
        // More flexible check - accept any user object with some identifying field
        if (!user || (!user.username && !user.email && !user.id)) {
            console.log('❌ Invalid user data structure - no username, email, or id');
            console.log('User keys:', Object.keys(user || {}));
            return null;
        }
        
        console.log('✅ Found valid user!');
        console.log('  - Username:', user.username);
        console.log('  - Email:', user.email);
        console.log('  - ID:', user.id);
        console.log('  - Profile:', user.profile);
        
        // Set global login status for other scripts to use
        window.isLoggedIn = true;
        window.currentUser = user;
        
        return user;
    } catch (error) {
        console.error('❌ Error checking login:', error);
        // Don't remove user data if there's just a parsing error
        return null;
    }
}

// Session timeout management
let sessionTimeoutId = null;
let sessionStartTime = null;
let sessionCheckInterval = null;

// Initialize session timeout
function initSessionTimeout() {
    const userData = localStorage.getItem('currentUser');
    if (!userData) {
        // Clear any existing intervals if no user
        if (sessionCheckInterval) {
            clearInterval(sessionCheckInterval);
            sessionCheckInterval = null;
        }
        return;
    }
    
    try {
        const user = JSON.parse(userData);
        const rememberMe = user.rememberMe || false;
        
        // Set timeout based on remember me
        const timeoutMs = rememberMe ? 12 * 24 * 60 * 60 * 1000 : 30 * 60 * 1000; // 12 days or 30 minutes
        sessionStartTime = Date.now();
        
        console.log(`⏰ Session timeout set for ${rememberMe ? '12 days' : '30 minutes'}`);
        
        // Clear any existing timeout
        if (sessionTimeoutId) {
            clearTimeout(sessionTimeoutId);
        }
        
        // Set new timeout
        sessionTimeoutId = setTimeout(() => {
            console.log('⏰ Session timeout reached, logging out...');
            forceLogout();
        }, timeoutMs);
        
        // Start periodic session check (every 30 seconds)
        startPeriodicSessionCheck();
        
    } catch (error) {
        console.error('❌ Error setting session timeout:', error);
    }
}

// Start periodic session check
function startPeriodicSessionCheck() {
    // Clear any existing interval
    if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval);
    }
    
    // Check every 30 seconds
    sessionCheckInterval = setInterval(async () => {
        console.log('🔍 Periodic session check...');
        
        const userData = localStorage.getItem('currentUser');
        if (!userData) {
            console.log('❌ No user data found, clearing interval');
            clearInterval(sessionCheckInterval);
            sessionCheckInterval = null;
            return;
        }
        
        try {
            const user = JSON.parse(userData);
            const rememberMe = user.rememberMe || false;
            const timeoutMs = rememberMe ? 12 * 24 * 60 * 60 * 1000 : 30 * 60 * 1000;
            
            // Check if session has expired
            const currentTime = Date.now();
            const sessionAge = currentTime - sessionStartTime;
            
            if (sessionAge >= timeoutMs) {
                console.log('⏰ Session expired during periodic check, logging out...');
                forceLogout();
                return;
            }
            
            // Also check server session
            const serverValid = await checkServerSession();
            if (!serverValid) {
                console.log('🔒 Server session expired during periodic check');
                forceLogout();
                return;
            }
            
            console.log(`✅ Session still valid (${Math.floor((timeoutMs - sessionAge) / 1000)}s remaining)`);
            
        } catch (error) {
            console.error('❌ Error during periodic session check:', error);
        }
    }, 30000); // 30 seconds
    
    console.log('🔄 Periodic session check started (every 30 seconds)');
}

// Force logout function
function forceLogout() {
    console.log('🔒 Force logging out due to session timeout');
    
    // Clear ALL localStorage data
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userData');
    localStorage.removeItem('userToken');
    localStorage.removeItem('authToken');
    localStorage.removeItem('zippyCart');
    localStorage.removeItem('sessionStartTime');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('lastLoginTime');
    
    // Clear any other potential auth data
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('user') || key.includes('auth') || key.includes('token') || key.includes('session'))) {
            localStorage.removeItem(key);
        }
    }
    
    // Reset global state
    window.isLoggedIn = false;
    window.currentUser = null;
    
    // Clear session timeout and interval
    if (sessionTimeoutId) {
        clearTimeout(sessionTimeoutId);
        sessionTimeoutId = null;
    }
    
    if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval);
        sessionCheckInterval = null;
    }
    
    // Force server logout
    fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
    }).catch(error => {
        console.log('Server logout request failed:', error);
    });
    
    // Update UI to show login button
    updateAuthUI();
    
    // Show notification
    showNotification('Session expired. Please log in again.', 'warning');
    
    // Force page reload to ensure complete logout
    setTimeout(() => {
        console.log('🔄 Reloading page to ensure complete logout...');
        window.location.reload();
    }, 2000);
}

// Update auth UI function
function updateAuthUI() {
    const authBtn = document.getElementById('authBtn');
    const userMenu = document.getElementById('userMenu');
    const usernameDisplay = document.getElementById('usernameDisplay');
    
    if (window.isLoggedIn && window.currentUser) {
        // User is logged in
        if (authBtn) authBtn.style.display = 'none';
        if (userMenu) userMenu.style.display = 'inline-block';
        if (usernameDisplay) {
            const displayName = window.currentUser.profile?.displayName || window.currentUser.username || 'User';
            usernameDisplay.textContent = displayName;
        }
    } else {
        // User is not logged in
        if (authBtn) authBtn.style.display = 'inline-block';
        if (userMenu) userMenu.style.display = 'none';
        if (usernameDisplay) usernameDisplay.textContent = 'User';
    }
}

// Show notification function
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'warning' ? 'rgba(255,193,7,0.9)' : 'rgba(0,255,255,0.9)'};
        color: ${type === 'warning' ? '#000' : '#000'};
        padding: 15px 20px;
        border-radius: 8px;
        border: 2px solid ${type === 'warning' ? '#ffc107' : '#00ffff'};
        z-index: 999999;
        font-weight: 600;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
    
    // Add slideOut animation
    const slideOutStyle = document.createElement('style');
    slideOutStyle.textContent = `
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(slideOutStyle);
}

// Check server session and clear localStorage if expired
async function checkServerSession() {
    try {
        const response = await fetch('/api/auth/status', {
            method: 'GET',
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            if (!data.loggedIn) {
                console.log('🔒 Server says session expired, clearing localStorage');
                forceLogout();
                return false;
            }
        }
        return true;
    } catch (error) {
        console.error('❌ Error checking server session:', error);
        return true; // Don't clear on network errors
    }
}

// Additional function to ensure complete logout
function ensureCompleteLogout() {
    console.log('🔒 Ensuring complete logout...');
    
    // Clear ALL possible auth data
    const authKeys = [
        'currentUser', 'userData', 'userToken', 'authToken', 'zippyCart',
        'sessionStartTime', 'rememberMe', 'lastLoginTime', 'user', 'auth',
        'token', 'session', 'login', 'userInfo', 'profile'
    ];
    
    authKeys.forEach(key => {
        localStorage.removeItem(key);
    });
    
    // Clear any other potential auth data
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('user') || key.includes('auth') || key.includes('token') || key.includes('session') || key.includes('login'))) {
            localStorage.removeItem(key);
        }
    }
    
    // Reset all global variables
    window.isLoggedIn = false;
    window.currentUser = null;
    window.userToken = null;
    window.authToken = null;
    
    // Clear any existing intervals
    if (sessionTimeoutId) {
        clearTimeout(sessionTimeoutId);
        sessionTimeoutId = null;
    }
    
    if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval);
        sessionCheckInterval = null;
    }
    
    // Force server logout
    fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
    }).catch(error => {
        console.log('Server logout request failed:', error);
    });
    
    // Update UI
    updateAuthUI();
    
    // Show notification
    showNotification('Session expired. Please log in again.', 'warning');
    
    // Force page reload after a short delay
    setTimeout(() => {
        console.log('🔄 Reloading page to ensure complete logout...');
        window.location.reload();
    }, 2000);
}

// Show not logged in state
function showNotLoggedIn() {
    console.log('🔒 Showing not logged in state');
    hideAllStates();
    document.getElementById('notLoggedInState').style.display = 'block';
}

// Show session error state (user exists but server doesn't recognize session)
function showSessionError() {
    console.log('🔧 Showing session error state');
    hideAllStates();
    document.getElementById('sessionErrorState').style.display = 'block';
    
    // Auto-try to re-login after 3 seconds if user doesn't click anything
    setTimeout(() => {
        if (document.getElementById('sessionErrorState').style.display === 'block') {
            console.log('🔄 Auto-trying to re-login...');
            tryOpenAuth();
        }
    }, 3000);
}

// Show loading state
function showLoading() {
    console.log('⏳ Showing loading state');
    hideAllStates();
    document.getElementById('loadingState').style.display = 'block';
}

// Show error state
function showError() {
    console.log('❌ Showing error state');
    hideAllStates();
    document.getElementById('errorState').style.display = 'block';
}

// Show empty state
function showEmpty() {
    console.log('📦 Showing empty state');
    hideAllStates();
    document.getElementById('emptyState').style.display = 'block';
}

// Show orders
function showOrders() {
    console.log('📋 Showing orders');
    hideAllStates();
    document.getElementById('ordersGrid').style.display = 'grid';
}

// Hide all states
function hideAllStates() {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('errorState').style.display = 'none';
    document.getElementById('notLoggedInState').style.display = 'none';
    document.getElementById('sessionErrorState').style.display = 'none';
    document.getElementById('emptyState').style.display = 'none';
    document.getElementById('ordersGrid').style.display = 'none';
}

// Load orders from API
async function loadOrders() {
    console.log('📡 Loading orders from API...');
    showLoading();
    
    try {
        // Get current user for potential token
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const headers = {
            'Content-Type': 'application/json'
        };
        
        // Add any available tokens
        if (currentUser.token) {
            headers['Authorization'] = `Bearer ${currentUser.token}`;
        }
        if (currentUser.sessionId) {
            headers['X-Session-ID'] = currentUser.sessionId;
        }
        
        console.log('📡 Making API request with headers:', Object.keys(headers));
        
        const response = await fetch('/api/payment/orders', {
            method: 'GET',
            credentials: 'include',
            headers: headers
        });
        
        console.log('📡 API Response status:', response.status);
        
        if (response.status === 401) {
            console.log('🔒 Server says unauthorized, but user exists in localStorage');
            console.log('🔧 This might be a session/cookie issue');
            
            // Try to auto-clear session and retry once
            if (!window.sessionRetryAttempted) {
                console.log('🔄 Auto-clearing session and retrying...');
                window.sessionRetryAttempted = true;
                clearSessionAndRetry();
                return;
            } else {
                console.log('❌ Session retry already attempted, showing error');
                showSessionError();
                return;
            }
        }
        
        if (!response.ok) {
            console.error('❌ API Error:', response.status, response.statusText);
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📦 Received data:', data);
        
        // Handle different response formats
        let orders = [];
        if (data.orders && Array.isArray(data.orders)) {
            orders = data.orders;
        } else if (Array.isArray(data)) {
            orders = data;
        }
        
        console.log('📋 Processing orders:', orders.length);
        
        // Load exchange items from localStorage and enhance with product data
        const exchangeItems = await loadExchangeItemsWithProductData();
        console.log('🔄 Processing exchange items:', exchangeItems.length);
        
        // Combine orders and exchange items
        const allItems = [...orders, ...exchangeItems];
        
        if (allItems.length === 0) {
            showEmpty();
        } else {
            displayOrders(allItems);
            showOrders();
        }
        
    } catch (error) {
        console.error('❌ Failed to load orders:', error);
        
        // If API fails, try to load only exchange items
        const exchangeItems = await loadExchangeItemsWithProductData();
        if (exchangeItems.length > 0) {
            displayOrders(exchangeItems);
            showOrders();
        } else {
            showError();
        }
    }
}

// Load exchange items from localStorage and enhance with product data
async function loadExchangeItemsWithProductData() {
    try {
        const purchasedItems = JSON.parse(localStorage.getItem('purchasedItems') || '[]');
        const exchangeItems = purchasedItems.filter(item => item.type === 'exchange');
        
        // Add sample exchange data for testing if none exists
        if (exchangeItems.length === 0) {
            console.log('📝 No exchange items found, adding sample data for testing...');
            const sampleExchangeItems = [
                {
                    id: 'exchange-test-1-offered',
                    name: 'Circuit Board Hoodie',
                    title: 'Circuit Board Hoodie',
                    brand: 'Zippy Originals',
                    price: 0,
                    quantity: 1,
                    size: 'M',
                    category: 'hoodies',
                    image: '/images/products/Circuit Board Hoodie/Circuit Board Hoodie.png',
                    type: 'exchange',
                    exchangeId: 'test-1',
                    isOffered: true,
                    purchaseDate: new Date().toISOString(),
                    status: 'completed'
                },
                {
                    id: 'exchange-test-1-wanted',
                    name: '404 Not Found Tee',
                    title: '404 Not Found Tee',
                    brand: 'Street Tech',
                    price: 0,
                    quantity: 1,
                    size: 'L',
                    category: 't-shirts',
                    image: '/images/products/404 Not Found Tee/404 Not Found Tee.png',
                    type: 'exchange',
                    exchangeId: 'test-1',
                    isWanted: true,
                    purchaseDate: new Date().toISOString(),
                    status: 'completed'
                }
            ];
            
            // Add to localStorage for testing
            purchasedItems.push(...sampleExchangeItems);
            localStorage.setItem('purchasedItems', JSON.stringify(purchasedItems));
            
            console.log('✅ Added sample exchange data for testing');
            exchangeItems.push(...sampleExchangeItems);
        }
        
        console.log('🔄 Found exchange items:', exchangeItems);
        
        // Load products from server to get full product details (like in products.js)
        let products = [];
        try {
            // Try to load from API first (like in products.js)
            const apiResponse = await fetch('/api/products?limit=50&page=1');
            if (apiResponse.ok) {
                const data = await apiResponse.json();
                products = (data.products || []).map(product => ({
                    id: product.id,
                    title: product.title,
                    name: product.title, // Add name for compatibility
                    price: product.price,
                    category: product.category,
                    image: product.images && product.images.length > 0 ? product.images[0] : '/images/placeholder.jpg',
                    brand: product.brand,
                    sizes: product.sizes
                }));
                console.log('📦 Products loaded from API:', products.length);
            } else {
                // Fallback to local JSON (like in products.js)
                const response = await fetch('/data/products/products.json');
                if (response.ok) {
                    const jsonProducts = await response.json();
                    products = jsonProducts.map(product => ({
                        id: product.id,
                        title: product.title,
                        name: product.title,
                        price: product.price,
                        category: product.category,
                        image: product.images && product.images.length > 0 ? product.images[0] : '/images/placeholder.jpg',
                        brand: product.brand,
                        sizes: product.sizes
                    }));
                    console.log('📦 Products loaded from local JSON:', products.length);
                } else {
                    throw new Error('Failed to load products from server');
                }
            }
        } catch (error) {
            console.error('❌ Error loading products:', error);
            // Fallback to sample products if fetch fails (like in products.js)
            products = [
                {
                    id: "Circuit Board Hoodie",
                    title: "Circuit Board Hoodie",
                    name: "Circuit Board Hoodie",
                    image: "/images/products/Circuit Board Hoodie/Circuit Board Hoodie.png",
                    category: "hoodies",
                    sizes: ["S", "M", "L", "XL"],
                    brand: "Zippy Originals",
                    price: 129.99
                },
                {
                    id: "404 Not Found Tee", 
                    title: "404 Not Found Tee",
                    name: "404 Not Found Tee",
                    image: "/images/products/404 Not Found Tee/404 Not Found Tee.png",
                    category: "t-shirts",
                    sizes: ["S", "M", "L", "XL", "XXL"],
                    brand: "Street Tech",
                    price: 49.99
                },
                {
                    id: "SYSTEM OVERRIDE Tee",
                    title: "SYSTEM OVERRIDE Tee",
                    name: "SYSTEM OVERRIDE Tee",
                    image: "/images/products/SYSTEM OVERRIDE Tee/SYSTEM OVERRIDE Tee.png",
                    category: "t-shirts",
                    sizes: ["S", "M", "L", "XL", "XXL"],
                    brand: "Street Tech",
                    price: 49.99
                },
                {
                    id: "Neon Cargo Pants",
                    title: "Neon Cargo Pants", 
                    name: "Neon Cargo Pants",
                    image: "/images/products/Neon Cargo Pants/Neon Cargo Pants.png",
                    category: "pants",
                    sizes: ["28", "30", "32", "34", "36"],
                    brand: "Future Wear",
                    price: 89.99
                },
                {
                    id: "Circuit Pattern Hoodie",
                    title: "Circuit Pattern Hoodie",
                    name: "Circuit Pattern Hoodie",
                    image: "/images/products/Circuit Pattern Hoodie/Circuit Pattern Hoodie.png",
                    category: "hoodies",
                    sizes: ["S", "M", "L", "XL"],
                    brand: "Zippy Originals",
                    price: 199.99
                },
                {
                    id: "Circuit Breaker Pants",
                    title: "Circuit Breaker Pants",
                    name: "Circuit Breaker Pants",
                    image: "/images/products/Circuit Breaker Pants/Circuit Breaker Pants.png",
                    category: "pants",
                    sizes: ["S", "M", "L", "XL"],
                    brand: "Street Tech",
                    price: 69.99
                },
                {
                    id: "Neural Network Hoodie",
                    title: "Neural Network Hoodie",
                    name: "Neural Network Hoodie",
                    image: "/images/products/Neural Network Hoodie/Neural Network Hoodie.png",
                    category: "hoodies",
                    sizes: ["S", "M", "L", "XL"],
                    brand: "Zippy Originals",
                    price: 149.99
                },
                {
                    id: "Cyber Samurai Hoodie",
                    title: "Cyber Samurai Hoodie",
                    name: "Cyber Samurai Hoodie",
                    image: "/images/products/Cyber Samurai Hoodie/Cyber Samurai Hoodie.png",
                    category: "hoodies",
                    sizes: ["S", "M", "L", "XL"],
                    brand: "Zippy Originals",
                    price: 159.99
                },
                {
                    id: "Quantum Circuit Hoodie",
                    title: "Quantum Circuit Hoodie",
                    name: "Quantum Circuit Hoodie",
                    image: "/images/products/Quantum Circuit Hoodie/Quantum Circuit Hoodie.png",
                    category: "hoodies",
                    sizes: ["S", "M", "L", "XL"],
                    brand: "Zippy Originals",
                    price: 179.99
                }
            ];
            console.log('📦 Using fallback products:', products.length);
        }
        
        // Group exchange items by exchangeId
        const exchangeGroups = {};
        exchangeItems.forEach(item => {
            if (!exchangeGroups[item.exchangeId]) {
                exchangeGroups[item.exchangeId] = [];
            }
            exchangeGroups[item.exchangeId].push(item);
        });
        
        // Convert to order format with enhanced product data
        const exchangeOrders = Object.entries(exchangeGroups).map(([exchangeId, items]) => {
            const firstItem = items[0];
            
            // Enhance items with product data (like in products.js)
            const enhancedItems = items.map(item => {
                console.log('🔍 Looking for product match for item:', item);
                
                // Find matching product (like in products.js)
                const product = products.find(p => {
                    const itemName = (item.name || item.title || '').toLowerCase().trim();
                    const productName = (p.title || p.name || '').toLowerCase().trim();
                    
                    return p.id === item.productId || 
                           p.title === item.name || 
                           p.name === item.name ||
                           p.title === item.title ||
                           p.id === item.id ||
                           productName === itemName ||
                           productName.includes(itemName) ||
                           itemName.includes(productName);
                });
                
                if (product) {
                    console.log('✅ Found matching product for item:', item.name || item.title, '->', product.title);
                    return {
                        ...item,
                        title: product.title || product.name,
                        brand: product.brand,
                        image: product.image || (product.images && product.images[0]),
                        price: product.price,
                        description: product.description,
                        sizes: product.sizes
                    };
                } else {
                    console.log('❌ No matching product found for item:', item.name || item.title);
                    // Return item with fallback image
                    return {
                        ...item,
                        image: '/images/placeholder.jpg'
                    };
                }
            });
            
            return {
                id: `exchange-${exchangeId}`,
                type: 'exchange',
                status: 'completed',
                createdAt: firstItem.purchaseDate,
                items: enhancedItems,
                total: 0,
                exchangeId: exchangeId
            };
        });
        
        console.log('🔄 Converted exchange items to orders with product data:', exchangeOrders.length);
        return exchangeOrders;
    } catch (error) {
        console.error('❌ Error loading exchange items:', error);
        return [];
    }
}

// Load exchange items from localStorage (fallback)
function loadExchangeItems() {
    try {
        const purchasedItems = JSON.parse(localStorage.getItem('purchasedItems') || '[]');
        const exchangeItems = purchasedItems.filter(item => item.type === 'exchange');
        
        // Group exchange items by exchangeId
        const exchangeGroups = {};
        exchangeItems.forEach(item => {
            if (!exchangeGroups[item.exchangeId]) {
                exchangeGroups[item.exchangeId] = [];
            }
            exchangeGroups[item.exchangeId].push(item);
        });
        
        // Convert to order format
        const exchangeOrders = Object.entries(exchangeGroups).map(([exchangeId, items]) => {
            const firstItem = items[0];
            return {
                id: `exchange-${exchangeId}`,
                type: 'exchange',
                status: 'completed',
                createdAt: firstItem.purchaseDate,
                items: items,
                total: 0,
                exchangeId: exchangeId
            };
        });
        
        console.log('🔄 Converted exchange items to orders:', exchangeOrders.length);
        return exchangeOrders;
    } catch (error) {
        console.error('❌ Error loading exchange items:', error);
        return [];
    }
}

// Display orders in the grid
function displayOrders(orders) {
    console.log('🖥️ Displaying orders:', orders.length);
    
    const ordersGrid = document.getElementById('ordersGrid');
    
    ordersGrid.innerHTML = orders.map(order => {
        console.log('📦 Processing order:', order.id, order);
        
        const isExchange = order.type === 'exchange';
        const orderTypeLabel = isExchange ? 'Exchange' : 'Order';
        const orderTypeClass = isExchange ? 'exchange-order' : 'regular-order';
        
        return `
            <div class="order-card ${orderTypeClass}" onclick="showOrderDetails('${order.id}')" style="cursor: pointer;">
                <div class="order-header">
                    <div>
                        <div class="order-number">
                            ${orderTypeLabel} #${order.id}
                            ${isExchange ? '<span class="exchange-badge">🔄</span>' : ''}
                        </div>
                        <div class="order-date">${formatDate(order.createdAt || order.timestamp || new Date())}</div>
                    </div>
                    <div class="status-badge status-${(order.status || 'completed').toLowerCase()}">
                        ${order.status || 'Completed'}
                    </div>
                </div>
                
                <div class="order-items">
                    ${(order.items || []).map(item => `
                        <div class="order-item ${isExchange ? 'exchange-item' : ''}">
                            <div class="item-image">
                                ${getItemImage(item)}
                            </div>
                            <div class="item-details">
                                <div class="item-name">${getItemTitle(item)}</div>
                                <div class="item-description">${getItemBrand(item)}</div>
                                <div class="item-price">${getItemPrice(item)}</div>
                                <div class="item-quantity">Qty: ${item.quantity || 1}</div>
                                ${item.size ? `<div class="item-size">Size: ${item.size}</div>` : ''}
                                ${isExchange ? `<div class="exchange-type ${item.isOffered ? 'offered' : 'wanted'}">${item.isOffered ? 'Offered' : 'Wanted'}</div>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="order-total">
                    <span>Total:</span>
                    <span>${isExchange ? 'Exchange' : `$${(order.total || 0).toFixed(2)}`}</span>
                </div>
            </div>
        `;
    }).join('');
}

// Show order details modal
function showOrderDetails(orderId) {
    console.log('📋 Showing order details for:', orderId);
    
    const order = window.currentOrders.find(o => o.id === orderId);
    if (!order) {
        console.error('Order not found:', orderId);
        return;
    }
    
    const modal = document.getElementById('orderDetailsModal');
    const modalTitle = document.getElementById('modalOrderTitle');
    const modalContent = document.getElementById('orderDetailsContent');
    
    // Set modal title
    modalTitle.textContent = `Order #${order.id}`;
    
    // Generate modal content
    modalContent.innerHTML = generateOrderDetailsHTML(order);
    
    // Show modal
    modal.style.display = 'flex';
    
    // Ensure modal is centered in viewport and scroll to top
    setTimeout(() => {
        // Scroll page to top first
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        // Then scroll modal to top
        modal.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
        });
        
        // Also scroll modal content to top
        const modalContainer = document.querySelector('.order-details-container');
        if (modalContainer) {
            modalContainer.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    }, 100);
    
    // Add event listeners
    const closeBtn = document.getElementById('closeOrderModal');
    closeBtn.onclick = closeOrderModal;
    
    // Close on background click
    modal.onclick = function(e) {
        if (e.target === modal) {
            closeOrderModal();
        }
    };
    
    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeOrderModal();
        }
    });
}

// Close order modal
function closeOrderModal() {
    const modal = document.getElementById('orderDetailsModal');
    modal.style.display = 'none';
}

// Generate order details HTML
function generateOrderDetailsHTML(order) {
    const formatAddress = (address) => {
        if (!address) return 'N/A';
        return `${address.firstName} ${address.lastName}<br>
                ${address.address}<br>
                ${address.city}, ${address.zipCode || ''}<br>
                ${address.phone ? `Phone: ${address.phone}` : ''}`;
    };
    
    const formatBillingInfo = (billing) => {
        if (!billing) return 'N/A';
        
        // Check if it's credit card info or address
        if (billing.cardHolderName) {
            return `${billing.cardHolderName}<br>
                    <span style="color: #00ffff; font-weight: 600;">${billing.cardType} •••• ${billing.lastFourDigits}</span><br>
                    Expires: ${billing.expiryDate}`;
        } else {
            // Fallback to address format
            return formatAddress(billing);
        }
    };
    
    const isExchange = order.type === 'exchange';
    const sectionTitle = isExchange ? 'Exchange Information' : 'Order Information';
    const itemsTitle = isExchange ? 'Exchange Items' : 'Order Items';
    const totalLabel = isExchange ? 'Exchange Type' : 'Total Amount';
    const totalValue = isExchange ? 'Product Exchange' : `$${(order.total || 0).toFixed(2)}`;
    
    return `
        <div class="order-info-section">
            <div class="section-title">
                <i class="fas fa-info-circle"></i>
                ${sectionTitle}
            </div>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">${isExchange ? 'Exchange' : 'Order'} ID</div>
                    <div class="info-value">${order.id}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Date</div>
                    <div class="info-value">${formatDate(order.createdAt || order.timestamp)}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Status</div>
                    <div class="info-value" style="color: ${getStatusColor(order.status)};">${order.status || 'Completed'}</div>
                </div>
                ${!isExchange ? `<div class="info-item">
                    <div class="info-label">Payment Method</div>
                    <div class="info-value">${order.paymentMethod || 'Credit Card'}</div>
                </div>` : ''}
            </div>
        </div>
        
        ${!isExchange ? `<div class="order-info-section">
            <div class="section-title">
                <i class="fas fa-shipping-fast"></i>
                Shipping Address
            </div>
            <div class="info-item">
                <div class="info-value">${formatAddress(order.shippingAddress)}</div>
            </div>
        </div>
        
        <div class="order-info-section">
            <div class="section-title">
                <i class="fas fa-credit-card"></i>
                Payment Information
            </div>
            <div class="info-item">
                <div class="info-value">${formatBillingInfo(order.billingAddress)}</div>
            </div>
        </div>` : ''}
        
        <div class="order-info-section">
            <div class="section-title">
                <i class="fas fa-box"></i>
                ${itemsTitle}
            </div>
            <div class="order-items-details">
                ${(order.items || []).map(item => `
                    <div class="order-item-detail ${isExchange ? 'exchange-item-detail' : ''}">
                        <div class="item-image-large">
                            ${getItemImageForModal(item)}
                        </div>
                        <div class="item-details-large">
                            <div>
                                <div class="item-name-large">${getItemTitle(item)}</div>
                                <div class="item-brand-large">${getItemBrand(item)}</div>
                                ${isExchange ? `<div class="exchange-type ${item.isOffered ? 'offered' : 'wanted'}">${item.isOffered ? 'Offered' : 'Wanted'}</div>` : ''}
                            </div>
                            <div class="item-meta-large">
                                <div class="item-specs">
                                    ${item.size ? `Size: ${item.size}` : ''}${item.size && item.quantity ? ' • ' : ''}${item.quantity ? `Quantity: ${item.quantity}` : ''}
                                </div>
                                <div class="item-price-large">${getItemPrice(item)}</div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="order-total-large">
                <div class="total-label">${totalLabel}</div>
                <div class="total-amount">${totalValue}</div>
            </div>
        </div>
        
        ${!isExchange && order.trackingNumber ? `
        <div class="tracking-info">
            <div class="section-title">
                <i class="fas fa-truck"></i>
                Tracking Information
            </div>
            <div class="info-item">
                <div class="info-label">Tracking Number</div>
                <div class="tracking-number">${order.trackingNumber}</div>
            </div>
        </div>
        ` : ''}
    `;
}

// Get status color
function getStatusColor(status) {
    switch(status?.toLowerCase()) {
        case 'completed': return '#2ecc71';
        case 'shipped': return '#3498db';
        case 'processing': return '#ffc107';
        case 'cancelled': return '#e74c3c';
        default: return '#00ffff';
    }
}

// Helper functions to get item data safely
function getItemImage(item) {
    console.log('🖼️ Getting image for item:', item);
    
    if (item.type === 'exchange') {
        // For exchange items, try to show actual product image (like in products.js)
        if (item.image && item.image !== '/images/placeholder.jpg' && item.image !== '/images/placeholder.svg') {
            console.log('✅ Using exchange item image:', item.image);
            return `<img src="${item.image}" alt="${getItemTitle(item)}" style="object-fit: cover; width: 100%; height: 100%;" onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\'display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; font-size: 24px; color: #00ffff; background: rgba(0, 255, 255, 0.1); border-radius: 8px;\'>🔄</div>'">`;
        }
        console.log('🔄 Using exchange placeholder for item:', getItemTitle(item));
        return '<div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; font-size: 24px; color: #00ffff; background: rgba(0, 255, 255, 0.1); border-radius: 8px;">🔄</div>';
    }
    
    if (item.image && item.image !== '/images/placeholder.jpg' && item.image !== '/images/placeholder.svg') {
        console.log('✅ Using regular item image:', item.image);
        return `<img src="${item.image}" alt="${getItemTitle(item)}" style="object-fit: cover; width: 100%; height: 100%;" onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\'display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; font-size: 24px; color: #888;\'>🛍️</div>'">`;
    }
    
    console.log('🛍️ Using regular placeholder for item:', getItemTitle(item));
    return '<div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; font-size: 24px; color: #888;">🛍️</div>';
}

function getItemImageForModal(item) {
    console.log('🖼️ Getting modal image for item:', item);
    
    if (item.type === 'exchange') {
        // For exchange items in modal, show larger image (like in products.js)
        if (item.image && item.image !== '/images/placeholder.jpg' && item.image !== '/images/placeholder.svg') {
            console.log('✅ Using exchange item modal image:', item.image);
            return `<img src="${item.image}" alt="${getItemTitle(item)}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\'display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; font-size: 48px; color: #00ffff; background: rgba(0, 255, 255, 0.1); border-radius: 12px;\'>🔄</div>'">`;
        }
        console.log('🔄 Using exchange modal placeholder for item:', getItemTitle(item));
        return '<div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; font-size: 48px; color: #00ffff; background: rgba(0, 255, 255, 0.1); border-radius: 12px;">🔄</div>';
    }
    
    if (item.image && item.image !== '/images/placeholder.jpg' && item.image !== '/images/placeholder.svg') {
        console.log('✅ Using regular item modal image:', item.image);
        return `<img src="${item.image}" alt="${getItemTitle(item)}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\'display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; font-size: 48px; color: #888;\'>🛍️</div>'">`;
    }
    
    console.log('🛍️ Using regular modal placeholder for item:', getItemTitle(item));
    return '<div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; font-size: 48px; color: #888;">🛍️</div>';
}

function getItemTitle(item) {
    return item.title || item.name || (item.product && item.product.title) || 'Unknown Product';
}

function getItemBrand(item) {
    return item.brand || (item.product && item.product.brand) || 'Exchange Item';
}

function getItemPrice(item) {
    if (item.type === 'exchange') {
        return 'Exchange Item';
    }
    
    const price = item.price || item.product?.price || 0;
    return `$${price.toFixed(2)}`;
}

// Format date nicely
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        return 'Unknown Date';
    }
}

// Function to open auth modal (with fallback)
function tryOpenAuth() {
    console.log('🔑 Attempting to open auth modal...');
    
    // Try multiple ways to open auth modal
    if (window.openAuthModal && typeof window.openAuthModal === 'function') {
        console.log('✅ Using global openAuthModal function');
        window.openAuthModal();
    } else if (window.GlobalModule && window.GlobalModule.openAuthModal) {
        console.log('✅ Using GlobalModule openAuthModal');
        window.GlobalModule.openAuthModal();
    } else {
        console.log('❌ No auth modal function found, redirecting to login page');
        // Fallback - redirect to a login page or show alert
        window.location.href = '/login.html';
    }
}

// Function to manually trigger auth check (for debugging)
function forceAuthCheck() {
    console.log('🔧 Force checking authentication...');
    const currentUser = checkUserLogin();
    if (currentUser) {
        loadOrders();
    } else {
        showNotLoggedIn();
    }
}

// Function to clear session and retry
function clearSessionAndRetry() {
    console.log('🧹 Clearing session data and retrying...');
    
    // Clear all auth-related localStorage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userData');
    localStorage.removeItem('userToken');
    localStorage.removeItem('authToken');
    localStorage.removeItem('zippyCart'); // Also clear cart data
    
    // Clear any auth cookies by making a logout request
    fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
    }).catch(e => console.log('Logout request failed:', e));
    
    // Reset global state
    window.isLoggedIn = false;
    window.currentUser = null;
    window.sessionRetryAttempted = false; // Reset retry flag
    
    // Show not logged in state immediately
    showNotLoggedIn();
    
    // Optional: Restart the initialization process after a delay
    setTimeout(() => {
        console.log('🔄 Restarting initialization after session clear...');
        initMyItems();
    }, 1000);
}

// Export functions for global access
window.MyItemsPage = {
    loadOrders,
    initMyItems,
    tryOpenAuth,
    forceAuthCheck
};

// Safe cart opening function with multiple fallbacks
function safeOpenCart() {
    console.log('🛒 Attempting to open cart...');
    
    try {
        // Method 1: Try global openCartModal function
        if (window.openCartModal && typeof window.openCartModal === 'function') {
            console.log('✅ Using global openCartModal');
            window.openCartModal();
            return;
        }
        
        // Method 2: Try GlobalModule
        if (window.GlobalModule && window.GlobalModule.openCartModal) {
            console.log('✅ Using GlobalModule openCartModal');
            window.GlobalModule.openCartModal();
            return;
        }
        
        // Method 3: Try CartModule directly
        if (window.CartModule && window.CartModule.openCartModal) {
            console.log('✅ Using CartModule openCartModal');
            window.CartModule.openCartModal();
            return;
        }
        
        // Method 4: Direct redirect with smooth scrolling
        console.log('🔄 Redirecting to cart page');
        window.location.href = '/cart';
        
    } catch (error) {
        console.error('❌ Error opening cart:', error);
        // Final fallback - simple redirect
        window.location.href = '/cart';
    }
}

// Make functions globally available for onclick handlers
window.tryOpenAuth = tryOpenAuth;
window.loadOrders = loadOrders;
window.forceAuthCheck = forceAuthCheck;
window.clearSessionAndRetry = clearSessionAndRetry;
window.safeOpenCart = safeOpenCart;
window.showOrderDetails = showOrderDetails;
window.closeOrderModal = closeOrderModal;
window.initSessionTimeout = initSessionTimeout;
window.forceLogout = forceLogout;
window.updateAuthUI = updateAuthUI;
window.showNotification = showNotification;
window.startPeriodicSessionCheck = startPeriodicSessionCheck;
window.ensureCompleteLogout = ensureCompleteLogout;
window.checkUserLoginWithDelay = checkUserLoginWithDelay;

console.log('✅ My Items script loaded successfully');