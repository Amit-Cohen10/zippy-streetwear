// Cart functionality
document.addEventListener('DOMContentLoaded', function() {
    initCart();
    loadCart();
    
    // Ensure modal functions are available
    if (typeof window.addToCartAndClose === 'undefined') {
        console.warn('addToCartAndClose not found, creating fallback');
        window.addToCartAndClose = function() {
            console.error('addToCartAndClose not properly loaded');
        };
    }
});

// Cart data structure
if (!window.cartItems) {
    window.cartItems = [];
}
if (!window.isLoggedIn) {
    window.isLoggedIn = false;
}

function initCart() {
    // Initialize cart functionality
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', proceedToCheckout);
    }
    
    // Load cart from localStorage
    loadCartFromStorage();
    
    // Check login status
    checkLoginStatus();
}

// Load cart from localStorage
function loadCartFromStorage() {
    const savedCart = localStorage.getItem('zippyCart');
    if (savedCart) {
        let loaded = JSON.parse(savedCart);
        if (!Array.isArray(loaded)) loaded = [];
        cartItems = loaded;
        updateCartDisplay();
    }
}

// Save cart to localStorage
function saveCartToStorage() {
    localStorage.setItem('zippyCart', JSON.stringify(cartItems));
}

// Load cart display
function loadCart() {
    if (cartItems.length === 0) {
        showEmptyCart();
    } else {
        renderCartItems();
        updateCartSummary();
    }
}

// Show empty cart message
function showEmptyCart() {
    const cartItems = document.getElementById('cartItems');
    const emptyCart = document.getElementById('emptyCart');
    const cartSummary = document.getElementById('cartSummary');
    
    if (cartItems) cartItems.style.display = 'none';
    if (emptyCart) emptyCart.style.display = 'block';
    if (cartSummary) cartSummary.style.display = 'none';
}

// Update cart display
function updateCartDisplay() {
    renderCartItems();
    updateCartSummary();
    updateCartCount();
    
    // Also update modal if it's open
    const cartModal = document.getElementById('cartModal');
    if (cartModal && cartModal.classList.contains('active')) {
        loadCartModal();
    }
}

// Render cart items
function renderCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    const emptyCart = document.getElementById('emptyCart');
    const cartSummary = document.getElementById('cartSummary');
    
    if (!cartItemsContainer) return;
    
    if (cartItems.length === 0) {
        showEmptyCart();
        return;
    }
    
    // Show cart content
    if (emptyCart) emptyCart.style.display = 'none';
    if (cartSummary) cartSummary.style.display = 'block';
    
    cartItemsContainer.innerHTML = cartItems.map(item => `
        <div class="cart-item" data-item-id="${item.id}">
            <div class="cart-item-image">
                <img src="${item.image || '/images/placeholder.jpg'}" alt="${item.name}" onerror="this.src='/images/placeholder.jpg'">
            </div>
            <div class="cart-item-details">
                <h3 class="cart-item-name">${item.name}</h3>
                <p class="cart-item-description">${item.description}</p>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
            </div>
            <div class="cart-item-quantity">
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
            </div>
            <div class="cart-item-total">
                $${(item.price * item.quantity).toFixed(2)}
            </div>
            <button class="remove-btn" onclick="removeFromCart(${item.id})">×</button>
        </div>
    `).join('');
}

// Update cart summary
function updateCartSummary() {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 0 ? 5.99 : 0;
    const total = subtotal + shipping;
    
    const subtotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping');
    const totalEl = document.getElementById('total');
    
    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (shippingEl) shippingEl.textContent = `$${shipping.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
}

// Update cart display
function updateCartDisplay() {
    renderCartItems();
    updateCartSummary();
    updateCartCount();
    
    // Also update modal if it's open
    const cartModal = document.getElementById('cartModal');
    if (cartModal && cartModal.classList.contains('active')) {
        loadCartModal();
    }
}

// Update cart count in navigation
function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

// Use the enhanced version from main.js if available
if (typeof window.updateCartCountLocal === 'function') {
    window.updateCartCount = window.updateCartCountLocal;
}

// Update item quantity
window.updateQuantity = function(itemId, change) {
    const item = cartItems.find(item => item.id === itemId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(itemId);
        } else {
            saveCartToStorage();
            updateCartDisplay();
        }
    }
}

// Remove item from cart
window.removeFromCart = function(itemId) {
    cartItems = cartItems.filter(item => item.id !== itemId);
    saveCartToStorage();
    updateCartDisplay();
}

// Clear cart
window.clearCart = function() {
    if (confirm('Are you sure you want to clear your cart?')) {
        cartItems = [];
        saveCartToStorage();
        updateCartDisplay();
        showNotification('Cart cleared', 'success');
    }
}

// Proceed to checkout
window.proceedToCheckout = function() {
    if (!isLoggedIn) {
        showNotification('Please login to checkout', 'error');
        openAuthModal();
        return;
    }
    
    if (cartItems.length === 0) {
        showNotification('Your cart is empty', 'error');
        return;
    }
    
    // Show payment modal
    openPaymentModal();
}

// Open payment modal
function openPaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) {
        modal.classList.add('active');
        
        // Center modal on screen
        setTimeout(() => {
            modal.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
        
        // Update payment summary
        updatePaymentSummary();
    }
}

// Close payment modal
function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Update payment summary
function updatePaymentSummary() {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 0 ? 5.99 : 0;
    const total = subtotal + shipping;
    
    const paymentSubtotal = document.getElementById('paymentSubtotal');
    const paymentShipping = document.getElementById('paymentShipping');
    const paymentTotal = document.getElementById('paymentTotal');
    
    if (paymentSubtotal) paymentSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    if (paymentShipping) paymentShipping.textContent = `$${shipping.toFixed(2)}`;
    if (paymentTotal) paymentTotal.textContent = `$${total.toFixed(2)}`;
}

// Handle payment form submission
function handlePayment(event) {
    event.preventDefault();
    
    // Simulate payment processing
    showLoading();
    
    setTimeout(() => {
        hideLoading();
        
        // Generate order ID
        const orderId = '#' + Math.random().toString(36).substr(2, 9).toUpperCase();
        const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 5.99;
        
        // Save purchased items
        savePurchasedItems();
        
        // Clear cart
        cartItems = [];
        saveCartToStorage();
        updateCartDisplay();
        
        // Show thank you modal
        showThankYouModal(orderId, total);
        
    }, 2000);
}

// Save purchased items
function savePurchasedItems() {
    const purchasedItems = JSON.parse(localStorage.getItem('purchasedItems') || '[]');
    const newItems = cartItems.map(item => ({
        ...item,
        purchaseDate: new Date().toISOString(),
        orderId: '#' + Math.random().toString(36).substr(2, 9).toUpperCase()
    }));
    
    purchasedItems.push(...newItems);
    localStorage.setItem('purchasedItems', JSON.stringify(purchasedItems));
}

// Show thank you modal
function showThankYouModal(orderId, total) {
    const modal = document.getElementById('thankYouModal');
    const orderIdEl = document.getElementById('orderId');
    const orderTotalEl = document.getElementById('orderTotal');
    
    if (modal && orderIdEl && orderTotalEl) {
        orderIdEl.textContent = orderId;
        orderTotalEl.textContent = `$${total.toFixed(2)}`;
        
        modal.classList.add('active');
        
        // Center modal on screen
        setTimeout(() => {
            modal.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }
}

// Close thank you modal
function closeThankYouModal() {
    const modal = document.getElementById('thankYouModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// View my items
function viewMyItems() {
    window.location.href = '/my-items';
}

// Check login status
function checkLoginStatus() {
    const user = localStorage.getItem('zippyUser');
    isLoggedIn = !!user;
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

// Open cart modal
window.openCartModal = function() {
    const cartModal = document.getElementById('cartModal');
    
    if (cartModal) {
        // Load cart data into modal
        loadCartModal();
        
        // Show modal
        cartModal.classList.add('active');
        
        // Center modal on screen
        setTimeout(() => {
            cartModal.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }
}

// Close cart modal
window.closeCartModal = function() {
    const modal = document.getElementById('cartModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Add event listener for close button
document.addEventListener('DOMContentLoaded', function() {
    const closeCartBtn = document.getElementById('closeCartModal');
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', closeCartModal);
    }
});

// Load cart data into modal
function loadCartModal() {
    const cartItems = JSON.parse(localStorage.getItem('zippyCart') || '[]');
    const cartItemsContainer = document.getElementById('cartItems');
    const emptyCart = document.getElementById('emptyCart');
    const cartSummary = document.getElementById('cartSummary');
    
    if (cartItems.length === 0) {
        if (cartItemsContainer) cartItemsContainer.style.display = 'none';
        if (emptyCart) emptyCart.style.display = 'block';
        if (cartSummary) cartSummary.style.display = 'none';
    } else {
        if (emptyCart) emptyCart.style.display = 'none';
        if (cartSummary) cartSummary.style.display = 'block';
        
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = cartItems.map(item => `
                <div class="cart-item" data-item-id="${item.id}">
                    <div class="cart-item-image">
                        <img src="${item.image || '/images/placeholder.jpg'}" alt="${item.name}" onerror="this.src='/images/placeholder.jpg'">
                    </div>
                    <div class="cart-item-details">
                        <h3 class="cart-item-name">${item.name}</h3>
                        <p class="cart-item-description">${item.description}</p>
                        <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    </div>
                    <div class="cart-item-total">
                        $${(item.price * item.quantity).toFixed(2)}
                    </div>
                    <button class="remove-btn" onclick="removeFromCart(${item.id})">×</button>
                </div>
            `).join('');
        }
        
        // Update modal summary
        const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = subtotal > 0 ? 5.99 : 0;
        const total = subtotal + shipping;
        
        const subtotalEl = document.getElementById('subtotal');
        const shippingEl = document.getElementById('shipping');
        const totalEl = document.getElementById('total');
        
        if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
        if (shippingEl) shippingEl.textContent = `$${shipping.toFixed(2)}`;
        if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
    }
}

// Utility functions
function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'flex';
    }
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
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

// Add event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Payment form
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', handlePayment);
    }
    
    // Auth form
    const authForm = document.getElementById('authForm');
    if (authForm) {
        authForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Simulate login
            localStorage.setItem('zippyUser', JSON.stringify({ email: 'user@example.com' }));
            isLoggedIn = true;
            closeAuthModal();
            showNotification('Login successful', 'success');
        });
    }
    
    // Close modals when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });
    
    // Initialize cart modal functionality
    const closeCartBtn = document.getElementById('closeCartModal');
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', closeCartModal);
    }
    
    // Add event listener for cart count click
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        cartCount.addEventListener('click', openCartModal);
    }
});

// Export functions
window.CartModule = {
    proceedToCheckout,
    clearCart,
    updateQuantity,
    removeFromCart,
    openPaymentModal,
    closePaymentModal,
    showThankYouModal,
    closeThankYouModal,
    viewMyItems,
    openAuthModal,
    closeAuthModal,
    openSearchModal,
    closeSearchModal,
    openCartModal,
    closeCartModal
};

// Test cart functionality
function testCartFunctionality() {
    console.log('Testing cart functionality...');
    
    // Test if cart modal exists
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
        console.log('✅ Cart modal found');
    } else {
        console.error('❌ Cart modal not found');
    }
    
    // Test if cart items container exists
    const cartItems = document.getElementById('cartItems');
    if (cartItems) {
        console.log('✅ Cart items container found');
    } else {
        console.error('❌ Cart items container not found');
    }
    
    // Test if empty cart message exists
    const emptyCart = document.getElementById('emptyCart');
    if (emptyCart) {
        console.log('✅ Empty cart message found');
    } else {
        console.error('❌ Empty cart message not found');
    }
    
    // Test if cart summary exists
    const cartSummary = document.getElementById('cartSummary');
    if (cartSummary) {
        console.log('✅ Cart summary found');
    } else {
        console.error('❌ Cart summary not found');
    }
    
    // Test if close button exists
    const closeBtn = document.getElementById('closeCartModal');
    if (closeBtn) {
        console.log('✅ Close button found');
    } else {
        console.error('❌ Close button not found');
    }
    
    // Test if checkout button exists
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        console.log('✅ Checkout button found');
    } else {
        console.error('❌ Checkout button not found');
    }
    
    console.log('Cart functionality test completed');
}

// Run test on page load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(testCartFunctionality, 1000);
});