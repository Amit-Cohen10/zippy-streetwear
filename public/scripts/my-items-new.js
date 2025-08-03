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
    
    // Check if user is logged in
    const currentUser = checkUserLogin();
    
    if (!currentUser) {
        showNotLoggedIn();
        return;
    }
    
    console.log('✅ User is logged in:', currentUser.username);
    
    // Load orders
    loadOrders();
}

// Check if user is logged in
function checkUserLogin() {
    try {
        const userData = localStorage.getItem('currentUser');
        if (!userData) {
            console.log('❌ No user data found');
            return null;
        }
        
        const user = JSON.parse(userData);
        console.log('👤 Found user:', user.username || user.email);
        return user;
    } catch (error) {
        console.error('❌ Error checking login:', error);
        return null;
    }
}

// Show not logged in state
function showNotLoggedIn() {
    console.log('🔒 Showing not logged in state');
    hideAllStates();
    document.getElementById('notLoggedInState').style.display = 'block';
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
    document.getElementById('emptyState').style.display = 'none';
    document.getElementById('ordersGrid').style.display = 'none';
}

// Load orders from API
async function loadOrders() {
    console.log('📡 Loading orders from API...');
    showLoading();
    
    try {
        const response = await fetch('/api/payment/orders', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📡 API Response status:', response.status);
        
        if (response.status === 401) {
            console.log('🔒 User not authorized, showing login');
            showNotLoggedIn();
            return;
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
            <div class="order-card">
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
                                <img src="${getItemImage(item)}" alt="${getItemTitle(item)}" onerror="this.src='/images/placeholder.jpg'">
                            </div>
                            <div class="item-details">
                                <div class="item-name">${getItemTitle(item)}</div>
                                <div class="item-brand">${getItemBrand(item)}</div>
                                <div class="item-price">$${getItemPrice(item)}</div>
                                ${item.size ? `<div style="color: #888; font-size: 0.9rem;">Size: ${item.size}</div>` : ''}
                                ${item.quantity ? `<div style="color: #888; font-size: 0.9rem;">Qty: ${item.quantity}</div>` : ''}
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

// Export functions for global access
window.MyItemsPage = {
    loadOrders,
    initMyItems
};

console.log('✅ My Items script loaded successfully');