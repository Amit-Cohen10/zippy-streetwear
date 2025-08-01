// My Items functionality
document.addEventListener('DOMContentLoaded', function() {
    initMyItems();
});

function initMyItems() {
    try {
        // Check if user is logged in
        checkLoginStatus();
        
        // Load user's orders
        loadMyItems();
        updateCartCount();
        
        console.log('My Items page initialized successfully');
    } catch (error) {
        console.error('Failed to initialize my items:', error);
        showErrorState();
    }
}

// Load my items from server
async function loadMyItems() {
    try {
        showLoadingState();
        
        const response = await fetch('/api/payment/orders', {
            credentials: 'include'
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                showNotLoggedInState();
                return;
            }
            throw new Error('Failed to load orders');
        }
        
        const orders = await response.json();
        displayMyItems(orders);
        
    } catch (error) {
        console.error('Failed to load my items:', error);
        showErrorState();
    }
}

function displayMyItems(orders) {
    const itemsGrid = document.getElementById('myItemsGrid');
    const emptyItems = document.getElementById('emptyItems');
    
    if (!itemsGrid || !emptyItems) return;
    
    hideLoadingState();
    
    if (!orders || orders.length === 0) {
        itemsGrid.style.display = 'none';
        emptyItems.style.display = 'block';
    } else {
        itemsGrid.style.display = 'grid';
        emptyItems.style.display = 'none';
        
        itemsGrid.innerHTML = orders.map(order => `
            <div class="order-card">
                <div class="order-header">
                    <div class="order-info">
                        <h3>Order #${order.id}</h3>
                        <span class="order-date">${formatDate(order.timestamp)}</span>
                    </div>
                    <div class="order-status">
                        <span class="status-badge ${getStatusClass(order.status)}">${order.status || 'Completed'}</span>
                    </div>
                </div>
                <div class="order-items">
                    ${order.items.map(item => `
                        <div class="order-item">
                            <div class="item-image">
                                <img src="${item.product?.images?.[0] || '/images/placeholder.jpg'}" alt="${item.product?.title || 'Product'}" onerror="this.src='/images/placeholder.jpg'">
                            </div>
                            <div class="item-details">
                                <h4 class="item-name">${item.product?.title || 'Unknown Product'}</h4>
                                <p class="item-brand">${item.product?.brand || 'Unknown Brand'}</p>
                                <div class="item-specs">
                                    ${item.size ? `<span class="spec">Size: ${item.size}</span>` : ''}
                                    ${item.color ? `<span class="spec">Color: ${item.color}</span>` : ''}
                                </div>
                                <div class="item-price">$${((item.product?.price || 0) * item.quantity).toFixed(2)}</div>
                                <div class="item-quantity">Qty: ${item.quantity}</div>
                            </div>
                            <div class="item-actions">
                                <button class="btn-secondary btn-sm" onclick="reviewProduct('${item.productId}')">
                                    <i class="fas fa-star"></i> Review
                                </button>
                                <button class="btn-outline btn-sm" onclick="reorderItem('${item.productId}')">
                                    <i class="fas fa-redo"></i> Buy Again
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="order-summary">
                    <div class="summary-row">
                        <span>Total Amount:</span>
                        <span class="total-amount">$${order.total?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div class="order-actions">
                        <button class="btn-outline btn-sm" onclick="viewOrderDetails('${order.id}')">
                            <i class="fas fa-eye"></i> View Details
                        </button>
                        <button class="btn-outline btn-sm" onclick="trackOrder('${order.id}')">
                            <i class="fas fa-truck"></i> Track Order
                        </button>
                        <button class="btn-outline btn-sm" onclick="downloadInvoice('${order.id}')">
                            <i class="fas fa-download"></i> Invoice
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function showLoadingState() {
    const itemsGrid = document.getElementById('myItemsGrid');
    if (itemsGrid) {
        itemsGrid.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>Loading your orders...</p>
            </div>
        `;
    }
}

function hideLoadingState() {
    // Loading state will be replaced by actual content
}

function showNotLoggedInState() {
    const itemsGrid = document.getElementById('myItemsGrid');
    const emptyItems = document.getElementById('emptyItems');
    
    if (itemsGrid) itemsGrid.style.display = 'none';
    if (emptyItems) {
        emptyItems.style.display = 'block';
        emptyItems.innerHTML = `
            <div class="not-logged-in">
                <div class="empty-icon">
                    <i class="fas fa-user-lock"></i>
                </div>
                <h3>Please Log In</h3>
                <p>You need to be logged in to view your purchased items.</p>
                <button class="btn-primary" onclick="openAuthModal()">Login</button>
            </div>
        `;
    }
}

function showErrorState() {
    const itemsGrid = document.getElementById('myItemsGrid');
    const emptyItems = document.getElementById('emptyItems');
    
    if (itemsGrid) itemsGrid.style.display = 'none';
    if (emptyItems) {
        emptyItems.style.display = 'block';
        emptyItems.innerHTML = `
            <div class="error-state">
                <div class="empty-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>Something went wrong</h3>
                <p>We couldn't load your orders. Please try again.</p>
                <button class="btn-primary" onclick="loadMyItems()">Try Again</button>
            </div>
        `;
    }
}

function getStatusClass(status) {
    switch(status?.toLowerCase()) {
        case 'pending': return 'status-pending';
        case 'processing': return 'status-processing';
        case 'shipped': return 'status-shipped';
        case 'delivered': return 'status-delivered';
        case 'completed': return 'status-completed';
        default: return 'status-completed';
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
}

// Action functions
function reviewProduct(productId) {
    // Navigate to review page or open review modal
    window.location.href = `/reviews/create?productId=${productId}`;
}

async function reorderItem(productId) {
    try {
        showNotification('Adding item to cart...', 'info');
        
        const response = await fetch('/api/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                productId: productId,
                quantity: 1
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to add item to cart');
        }
        
        showNotification('Item added to cart successfully!', 'success');
        updateCartCount();
        
    } catch (error) {
        console.error('Failed to reorder item:', error);
        showNotification('Failed to add item to cart', 'error');
    }
}

function viewOrderDetails(orderId) {
    window.location.href = `/order-details?orderId=${orderId}`;
}

function trackOrder(orderId) {
    window.location.href = `/track-order?orderId=${orderId}`;
}

function downloadInvoice(orderId) {
    window.open(`/api/payment/invoice/${orderId}`, '_blank');
}

// Utility functions
function showNotification(message, type = 'info') {
    if (window.showNotification) {
        window.showNotification(message, type);
        return;
    }
    
    console.log(`${type.toUpperCase()}: ${message}`);
    alert(message);
}

function checkLoginStatus() {
    if (window.checkLoginStatus) {
        window.checkLoginStatus();
    }
}

function updateCartCount() {
    if (window.updateCartCount) {
        window.updateCartCount();
    }
}
                    <strong>Total: $${order.total.toFixed(2)}</strong>
                </div>
            </div>
        `).join('');
    }
}

// Group items by order
function groupItemsByOrder(items) {
    const orders = {};
    
    items.forEach(item => {
        if (!orders[item.orderId]) {
            orders[item.orderId] = {
                orderId: item.orderId,
                purchaseDate: item.purchaseDate,
                items: [],
                total: 0
            };
        }
        
        orders[item.orderId].items.push(item);
        orders[item.orderId].total += item.price * item.quantity;
    });
    
    return Object.values(orders).sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate));
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Update cart count
function updateCartCount() {
    const cartItems = JSON.parse(localStorage.getItem('zippyCart') || '[]');
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

// Open search modal
function openSearchModal() {
    const modal = document.getElementById('searchModal');
    if (modal) {
        modal.classList.add('active');
        
        // Center modal on screen and scroll to top
        setTimeout(() => {
            // Scroll page to top first
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            
            // Then scroll modal to top
            modal.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
}

// Close search modal
function closeSearchModal() {
    const modal = document.getElementById('searchModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Open auth modal
function openAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.classList.add('active');
        
        // Center modal on screen and scroll to top
        setTimeout(() => {
            // Scroll page to top first
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            
            // Then scroll modal to top
            modal.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
}

// Close auth modal
function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Open cart modal
function openCartModal() {
    window.location.href = '/cart';
}

// Export functions
window.MyItemsModule = {
    openSearchModal,
    closeSearchModal,
    openAuthModal,
    closeAuthModal,
    openCartModal
}; 