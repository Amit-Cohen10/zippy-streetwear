// Simple My Items Page - Clean Implementation
console.log('🚀 My Items page loading...');

// Wait for page to load
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM loaded, initializing My Items...');
    initMyItems();
});

// Main initialization
function initMyItems() {
    console.log('⚡ Initializing My Items page...');
    
    // Multiple attempts to check user login with different delays
    let attempts = 0;
    const maxAttempts = 5;
    
    function tryCheckUser() {
        attempts++;
        console.log(`🔄 Login check attempt ${attempts}/${maxAttempts}`);
        
        const currentUser = checkUserLogin();
        
        if (currentUser) {
            console.log('✅ User is logged in:', currentUser.username || currentUser.email);
            loadOrders();
            return;
        }
        
        if (attempts < maxAttempts) {
            console.log(`⏳ No user found, trying again in ${attempts * 200}ms...`);
            setTimeout(tryCheckUser, attempts * 200);
        } else {
            console.log('❌ Max attempts reached, showing login state');
            showNotLoggedIn();
        }
    }
    
    // Start checking immediately
    tryCheckUser();
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
        
        if (orders.length === 0) {
            showEmpty();
        } else {
            displayOrders(orders);
            showOrders();
        }
        
    } catch (error) {
        console.error('❌ Failed to load orders:', error);
        showError();
    }
}

// Display orders in the grid
function displayOrders(orders) {
    console.log('🖥️ Displaying orders:', orders.length);
    
    const ordersGrid = document.getElementById('ordersGrid');
    
    ordersGrid.innerHTML = orders.map(order => {
        console.log('📦 Processing order:', order.id, order);
        
        return `
            <div class="order-card" onclick="showOrderDetails('${order.id}')" style="cursor: pointer;">
                <div class="order-header">
                    <div>
                        <div class="order-number">Order #${order.id}</div>
                        <div class="order-date">${formatDate(order.createdAt || order.timestamp || new Date())}</div>
                    </div>
                    <div class="status-badge status-${(order.status || 'completed').toLowerCase()}">${order.status || 'Completed'}</div>
                </div>
                
                <div class="order-items">
                    ${(order.items || []).map(item => `
                        <div class="order-item">
                            <div class="item-image">
                                <img src="${getItemImage(item)}" alt="${getItemTitle(item)}" onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\'display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; font-size: 24px; color: #888;\'>🛍️</div>'">
                            </div>
                            <div class="item-details">
                                <div>
                                    <div class="item-name">${getItemTitle(item)}</div>
                                    <div class="item-brand">${getItemBrand(item)}</div>
                                </div>
                                <div class="item-meta">
                                    <div class="item-size-qty">
                                        ${item.size ? `Size: ${item.size}` : ''}${item.size && item.quantity ? ' • ' : ''}${item.quantity ? `Qty: ${item.quantity}` : ''}
                                    </div>
                                    <div class="item-price">$${getItemPrice(item)}</div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="order-total">
                    Total: $${(order.total || 0).toFixed(2)}
                </div>
            </div>
        `;
    }).join('');
    
    // Store orders globally for modal access
    window.currentOrders = orders;
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
    
    return `
        <div class="order-info-section">
            <div class="section-title">
                <i class="fas fa-info-circle"></i>
                Order Information
            </div>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Order ID</div>
                    <div class="info-value">${order.id}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Order Date</div>
                    <div class="info-value">${formatDate(order.createdAt || order.timestamp)}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Status</div>
                    <div class="info-value" style="color: ${getStatusColor(order.status)};">${order.status || 'Completed'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Payment Method</div>
                    <div class="info-value">${order.paymentMethod || 'Credit Card'}</div>
                </div>
            </div>
        </div>
        
        <div class="order-info-section">
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
                Billing Address
            </div>
            <div class="info-item">
                <div class="info-value">${formatAddress(order.billingAddress)}</div>
            </div>
        </div>
        
        <div class="order-info-section">
            <div class="section-title">
                <i class="fas fa-box"></i>
                Order Items
            </div>
            <div class="order-items-details">
                ${(order.items || []).map(item => `
                    <div class="order-item-detail">
                        <div class="item-image-large">
                            <img src="${getItemImage(item)}" alt="${getItemTitle(item)}" onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\'display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; font-size: 24px; color: #888;\'>🛍️</div>'">
                        </div>
                        <div class="item-details-large">
                            <div>
                                <div class="item-name-large">${getItemTitle(item)}</div>
                                <div class="item-brand-large">${getItemBrand(item)}</div>
                            </div>
                            <div class="item-meta-large">
                                <div class="item-specs">
                                    ${item.size ? `Size: ${item.size}` : ''}${item.size && item.quantity ? ' • ' : ''}${item.quantity ? `Quantity: ${item.quantity}` : ''}
                                </div>
                                <div class="item-price-large">$${getItemPrice(item)}</div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="order-total-large">
                <div class="total-label">Total Amount</div>
                <div class="total-amount">$${(order.total || 0).toFixed(2)}</div>
            </div>
        </div>
        
        ${order.trackingNumber ? `
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
    return item.image || (item.product && item.product.images && item.product.images[0]) || '/images/placeholder.jpg';
}

function getItemTitle(item) {
    return item.title || (item.product && item.product.title) || 'Unknown Product';
}

function getItemBrand(item) {
    return item.brand || (item.product && item.product.brand) || 'Unknown Brand';
}

function getItemPrice(item) {
    const price = item.price || (item.product && item.product.price) || 0;
    const quantity = item.quantity || 1;
    return (price * quantity).toFixed(2);
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

console.log('✅ My Items script loaded successfully');