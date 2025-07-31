// My Items functionality
document.addEventListener('DOMContentLoaded', function() {
    initMyItems();
});

function initMyItems() {
    loadMyItems();
    updateCartCount();
}

// Load my items
function loadMyItems() {
    const purchasedItems = JSON.parse(localStorage.getItem('purchasedItems') || '[]');
    const itemsGrid = document.getElementById('myItemsGrid');
    const emptyItems = document.getElementById('emptyItems');
    
    if (!itemsGrid || !emptyItems) return;
    
    if (purchasedItems.length === 0) {
        itemsGrid.style.display = 'none';
        emptyItems.style.display = 'block';
    } else {
        itemsGrid.style.display = 'grid';
        emptyItems.style.display = 'none';
        
        // Group items by order
        const orders = groupItemsByOrder(purchasedItems);
        
        itemsGrid.innerHTML = orders.map(order => `
            <div class="order-card">
                <div class="order-header">
                    <h3>Order ${order.orderId}</h3>
                    <span class="order-date">${formatDate(order.purchaseDate)}</span>
                </div>
                <div class="order-items">
                    ${order.items.map(item => `
                        <div class="order-item">
                            <div class="item-image">
                                <img src="${item.image || '/images/placeholder.jpg'}" alt="${item.name}" onerror="this.src='/images/placeholder.jpg'">
                            </div>
                            <div class="item-details">
                                <h4 class="item-name">${item.name}</h4>
                                <p class="item-description">${item.description}</p>
                                <div class="item-price">$${item.price.toFixed(2)}</div>
                                <div class="item-quantity">Qty: ${item.quantity}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="order-total">
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
        
        // Center modal on screen
        setTimeout(() => {
            modal.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
        
        // Center modal on screen
        setTimeout(() => {
            modal.scrollIntoView({ behavior: 'smooth', block: 'center' });
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