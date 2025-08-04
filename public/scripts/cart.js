// Cart functionality
document.addEventListener('DOMContentLoaded', function() {
    try {
        initCart();
        loadCart();
        
        // Ensure modal functions are available
        try {
            if (typeof window.addToCartAndClose === 'undefined') {
                console.warn('addToCartAndClose not found, creating fallback');
                window.addToCartAndClose = function() {
                    console.error('addToCartAndClose not properly loaded');
                };
            }
        } catch (error) {
            console.error('Failed to ensure modal functions are available:', error);
        }
    } catch (error) {
        console.error('Failed to initialize cart functionality:', error);
    }
});

// Initialize cart data structure
function initializeCartData() {
    try {
        if (!window.cartItems) {
            window.cartItems = [];
        }
        if (!Array.isArray(window.cartItems)) {
            window.cartItems = [];
        }
        if (!window.isLoggedIn) {
            window.isLoggedIn = false;
        }
        
        // Load from localStorage if available
        const savedCart = localStorage.getItem('zippyCart');
        if (savedCart) {
            try {
                const loaded = JSON.parse(savedCart);
                if (Array.isArray(loaded)) {
                    window.cartItems = loaded;
                }
            } catch (e) {
                console.error('Failed to parse saved cart:', e);
                window.cartItems = [];
            }
        }
        
        console.log('Cart data initialized:', {
            cartItems: window.cartItems.length,
            isLoggedIn: window.isLoggedIn
        });
    } catch (error) {
        console.error('Failed to initialize cart data structure:', error);
        window.cartItems = [];
        window.isLoggedIn = false;
    }
}

// Cart data structure - use the one from main.js if available
initializeCartData();

function initCart() {
    try {
        // Initialize cart data first
        initializeCartData();
        
        // Initialize cart functionality
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', proceedToCheckout);
        }
        
        // Load cart from localStorage
        loadCartFromStorage();
        
        // Check login status
        checkLoginStatus();
        
        // Initialize cart count
        updateCartCount();
        
        // Initialize cart modal if available
        const cartModal = document.getElementById('cartModal');
        if (cartModal) {
            console.log('Cart modal found and initialized');
        }
        
        console.log('Cart initialization completed successfully');
    } catch (error) {
        console.error('Failed to initialize cart:', error);
    }
}

// Load cart from localStorage
function loadCartFromStorage() {
    try {
        const savedCart = localStorage.getItem('zippyCart');
        console.log('🛒 Saved cart from localStorage:', savedCart);
        
        if (savedCart) {
            let loaded = JSON.parse(savedCart);
            if (!Array.isArray(loaded)) loaded = [];
            window.cartItems = loaded;
            console.log('🛒 Loaded cart items:', window.cartItems);
        } else {
            console.log('🛒 No saved cart found in localStorage');
            window.cartItems = [];
        }
    } catch (error) {
        console.error('Failed to load cart from localStorage:', error);
        window.cartItems = [];
    }
}

// Save cart to localStorage
function saveCartToStorage() {
    try {
        localStorage.setItem('zippyCart', JSON.stringify(window.cartItems));
    } catch (error) {
        console.error('Failed to save cart to localStorage:', error);
    }
}

// Load cart display
function loadCart() {
    console.log('🛒 Loading cart...');
    
    // Load cart data from localStorage
    loadCartFromStorage();
    
    console.log('🛒 Cart items after loading:', window.cartItems);
    
    // Ensure cartItems is an array
    if (!Array.isArray(window.cartItems)) {
        window.cartItems = [];
    }
    
    if (window.cartItems.length === 0) {
        console.log('🛒 Cart is empty, showing empty cart');
        showEmptyCart();
    } else {
        console.log('🛒 Cart has items, rendering cart items');
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
    try {
        renderCartItems();
        updateCartSummary();
        updateCartCount();
        
        // Also update modal if it's open
        const cartModal = document.getElementById('cartModal');
        if (cartModal && cartModal.classList.contains('active')) {
            loadCartModal();
        }
    } catch (error) {
        console.error('Failed to update cart display:', error);
    }
}

// Render cart items
function renderCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    const emptyCart = document.getElementById('emptyCart');
    const cartSummary = document.getElementById('cartSummary');
    
    if (!cartItemsContainer) return;
    
    // Ensure cartItems is an array
    if (!Array.isArray(window.cartItems)) {
        window.cartItems = [];
    }
    
    if (window.cartItems.length === 0) {
        showEmptyCart();
        return;
    }
    
    // Show cart content
    if (emptyCart) emptyCart.style.display = 'none';
    if (cartSummary) cartSummary.style.display = 'block';
    
    cartItemsContainer.innerHTML = window.cartItems.map(item => `
        <div class="cart-item" data-item-id="${item.id}">
            <div class="cart-item-image">
                <img src="${item.image || '/images/placeholder.jpg'}" alt="${item.name || 'Product'}" onerror="this.src='/images/placeholder.jpg'">
            </div>
            <div class="cart-item-details">
                <h3 class="cart-item-name">${item.name || 'Product'}</h3>
                <p class="cart-item-description">${item.description || ''}</p>
                <div class="cart-item-price">$${(item.price || 0).toFixed(2)}</div>
            </div>
            <div class="cart-item-quantity">
                <button class="quantity-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                <span class="quantity">${item.quantity || 1}</span>
                <button class="quantity-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
            </div>
            <div class="cart-item-total">
                $${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
            </div>
            <button class="remove-btn" onclick="removeFromCart('${item.id}')">×</button>
        </div>
    `).join('');
}

// Update cart summary
function updateCartSummary() {
    // Ensure cartItems is an array
    if (!Array.isArray(window.cartItems)) {
        window.cartItems = [];
    }
    
    const subtotal = window.cartItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
    const shipping = subtotal > 100 ? 0 : 9.99; // Free shipping over $100 (same as checkout)
    const tax = subtotal * 0.08; // 8% tax (same as checkout)
    const total = subtotal + shipping + tax;
    
    const subtotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping');
    const taxEl = document.getElementById('tax');
    const totalEl = document.getElementById('total');
    
    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (shippingEl) shippingEl.textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
    if (taxEl) taxEl.textContent = `$${tax.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
}

// Update cart count in navigation
function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        // Ensure cartItems is an array
        if (!Array.isArray(window.cartItems)) {
            window.cartItems = [];
        }
        const totalItems = window.cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
        cartCount.textContent = totalItems;
    }
}

// Update item quantity
window.updateQuantity = function(itemId, change) {
    // Ensure cartItems is an array
    if (!Array.isArray(window.cartItems)) {
        window.cartItems = [];
    }
    
    const item = window.cartItems.find(item => item.id === itemId);
    if (item) {
        item.quantity = (item.quantity || 1) + change;
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
    // Ensure cartItems is an array
    if (!Array.isArray(window.cartItems)) {
        window.cartItems = [];
    }
    
    window.cartItems = window.cartItems.filter(item => item.id !== itemId);
    saveCartToStorage();
    updateCartDisplay();
    
    // Show success notification if available
    if (typeof showNotification === 'function') {
        showNotification('Item removed from cart', 'success');
    }
}

// Clear cart
window.clearCart = function() {
    if (confirm('Are you sure you want to clear your cart?')) {
        window.cartItems = [];
        saveCartToStorage();
        updateCartDisplay();
        showNotification('Cart cleared', 'success');
    }
}

// Proceed to checkout
window.proceedToCheckout = function() {
    console.log('Checkout button clicked!');
    
    // Check login status from localStorage
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        console.log('No user found in localStorage');
        showNotification('Please login to checkout', 'error');
        openAuthModal();
        return;
    }
    
    console.log('User is logged in:', currentUser);
    
    // Ensure cartItems is an array
    if (!Array.isArray(window.cartItems)) {
        window.cartItems = [];
    }
    
    if (window.cartItems.length === 0) {
        console.log('Cart is empty');
        showNotification('Your cart is empty', 'error');
        return;
    }
    
    console.log('Cart items to checkout:', window.cartItems);
    
    // Ensure cart is saved to localStorage (it should already be, but just in case)
    saveCartToStorage();
    
    // Navigate to checkout page
    window.location.href = '/checkout';
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
    // Ensure cartItems is an array
    if (!Array.isArray(window.cartItems)) {
        window.cartItems = [];
    }
    
    const subtotal = window.cartItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
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
        const total = window.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 5.99;
        
        // Save purchased items
        savePurchasedItems();
        
        // Clear cart
        window.cartItems = [];
        saveCartToStorage();
        updateCartDisplay();
        
        // Show thank you modal
        showThankYouModal(orderId, total);
        
    }, 2000);
}

// Save purchased items
function savePurchasedItems() {
    const purchasedItems = JSON.parse(localStorage.getItem('purchasedItems') || '[]');
    const newItems = window.cartItems.map(item => ({
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
    window.isLoggedIn = !!user;
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
    console.log('🛒 openCartModal called');
    const cartModal = document.getElementById('cartModal');
    
    if (cartModal) {
        console.log('🛒 Cart modal found, loading cart data');
        // Load cart data into modal
        loadCartModal();
        
        // Show modal
        cartModal.classList.add('active');
        console.log('🛒 Modal activated with classList.add("active")');
        
        // Update auth UI to ensure login status is correct
        if (typeof window.updateAuthUI === 'function') {
            setTimeout(() => {
                window.updateAuthUI();
            }, 100);
        }
        
        // Scroll modal to top and ensure it's visible
        setTimeout(() => {
            // Scroll the modal content to top
            const modalContainer = cartModal.querySelector('.modal-container');
            if (modalContainer) {
                modalContainer.scrollTop = 0;
            }
            
            // Scroll page to top if needed
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            
            // Ensure modal is visible at top
            cartModal.scrollTop = 0;
        }, 100);
    } else {
        console.log('❌ Cart modal not found');
    }
}

// Close cart modal
window.closeCartModal = function() {
    const modal = document.getElementById('cartModal');
    if (modal) {
        modal.classList.remove('active');
        
        // Update auth UI to ensure login status is correct
        if (typeof window.updateAuthUI === 'function') {
            setTimeout(() => {
                window.updateAuthUI();
            }, 100);
        }
    }
}

// Add event listener for close button
document.addEventListener('DOMContentLoaded', function() {
    const closeCartBtn = document.getElementById('closeCartModal');
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', closeCartModal);
    }
    
    // Add event listener for cart button
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
        cartBtn.addEventListener('click', openCartModal);
    }
    
    // Add event listener for cart count
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        cartCount.addEventListener('click', openCartModal);
    }
});

// Load cart data into modal
function loadCartModal() {
    console.log('🛒 loadCartModal called');
    const cartItems = JSON.parse(localStorage.getItem('zippyCart') || '[]');
    console.log('🛒 Cart items from localStorage:', cartItems);
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
                        <button class="quantity-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
                    </div>
                    <div class="cart-item-total">
                        $${(item.price * item.quantity).toFixed(2)}
                    </div>
                    <button class="remove-btn" onclick="removeFromCart('${item.id}')">×</button>
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
    if (!document.body) return;
    
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
        if (notification && notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Add event listeners
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Payment form
        try {
            const paymentForm = document.getElementById('paymentForm');
            if (paymentForm) {
                paymentForm.addEventListener('submit', handlePayment);
            }
        } catch (error) {
            console.error('Failed to initialize payment form:', error);
        }
        
        // Auth form
        try {
            const authForm = document.getElementById('authForm');
            if (authForm) {
                authForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    try {
                        // Simulate login
                        localStorage.setItem('zippyUser', JSON.stringify({ email: 'user@example.com' }));
                        window.isLoggedIn = true;
                        closeAuthModal();
                        showNotification('Login successful', 'success');
                    } catch (error) {
                        console.error('Failed to process login:', error);
                        showNotification('Login failed', 'error');
                    }
                });
            }
        } catch (error) {
            console.error('Failed to initialize auth form:', error);
        }
        
        // Close modals when clicking outside
        try {
            document.addEventListener('click', function(e) {
                try {
                    if (e.target.classList.contains('modal')) {
                        e.target.classList.remove('active');
                    }
                } catch (error) {
                    console.error('Failed to close modal:', error);
                }
            });
        } catch (error) {
            console.error('Failed to initialize modal click handler:', error);
        }
        
        // Initialize cart modal functionality
        try {
            const closeCartBtn = document.getElementById('closeCartModal');
            if (closeCartBtn) {
                closeCartBtn.addEventListener('click', closeCartModal);
            }
            
            // Add event listener for cart count click
            const cartCount = document.getElementById('cartCount');
            if (cartCount) {
                cartCount.addEventListener('click', openCartModal);
            }
        } catch (error) {
            console.error('Failed to initialize cart modal functionality:', error);
        }
    } catch (error) {
        console.error('Failed to initialize cart event listeners:', error);
    }
});

// Export functions
try {
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
        closeCartModal,
        testCartFunctionality,
        getCartStatus,
        initializeCartData
    };
    
    console.log('Cart module exported successfully');
    
    // Setup admin access checks
    setTimeout(() => {
        if (typeof setupAdminAccessChecks === 'function') {
            setupAdminAccessChecks();
        }
    }, 1000);
    
} catch (error) {
    console.error('Failed to export cart module functions:', error);
}

// Test cart functionality
function testCartFunctionality() {
    try {
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
        
        // Test cart data
        console.log('Cart data status:', {
            cartItems: window.cartItems ? window.cartItems.length : 0,
            isLoggedIn: window.isLoggedIn,
            localStorage: localStorage.getItem('zippyCart') ? 'Available' : 'Not available'
        });
        
        console.log('Cart functionality test completed');
    } catch (error) {
        console.error('Failed to test cart functionality:', error);
    }
}

// Enhanced cart status function
function getCartStatus() {
    try {
        const status = {
            cartItems: window.cartItems ? window.cartItems.length : 0,
            isLoggedIn: window.isLoggedIn,
            localStorage: localStorage.getItem('zippyCart') ? 'Available' : 'Not available',
            totalItems: 0,
            totalValue: 0
        };
        
        if (Array.isArray(window.cartItems)) {
            status.totalItems = window.cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
            status.totalValue = window.cartItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
        }
        
        console.log('Cart Status:', status);
        return status;
    } catch (error) {
        console.error('Failed to get cart status:', error);
        return null;
    }
}

// Make loadCart available globally
window.loadCart = loadCart;

// Run test on page load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        testCartFunctionality();
        getCartStatus();
    }, 1000);
});