// Global functionality for all pages
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
});

// Update cart count in navigation
function updateCartCount() {
    const cartItems = JSON.parse(localStorage.getItem('zippyCart') || '[]');
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

// Show notification
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

// Open cart modal
function openCartModal() {
    // Check if we're on a page with cart functionality
    if (typeof window.CartModule !== 'undefined' && window.CartModule.openCartModal) {
        window.CartModule.openCartModal();
    } else {
        window.location.href = '/cart';
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

// Export functions
window.GlobalModule = {
    updateCartCount,
    showNotification,
    openCartModal,
    openSearchModal,
    closeSearchModal,
    openAuthModal,
    closeAuthModal
};

// Global close cart modal function
function closeCartModal() {
    if (typeof window.CartModule !== 'undefined' && window.CartModule.closeCartModal) {
        window.CartModule.closeCartModal();
    }
} 