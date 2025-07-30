// Cart functionality
document.addEventListener('DOMContentLoaded', function() {
    initCart();
});

function initCart() {
    // Initialize cart functionality
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', handleCheckout);
    }
}

async function handleCheckout() {
    if (!window.ZippyApp || !window.ZippyApp.currentUser()) {
        showNotification('Please login to checkout', 'error');
        document.getElementById('authModal').style.display = 'flex';
        return;
    }

    try {
        showLoading();
        
        // Validate cart before checkout
        const response = await fetch('/api/cart/validate');
        const validation = await response.json();
        
        if (!validation.isValid) {
            showNotification('Some items in your cart are no longer available', 'error');
            // Reload cart to show updated items
            if (window.ZippyApp && window.ZippyApp.loadCart) {
                await window.ZippyApp.loadCart();
            }
            return;
        }
        
        // Redirect to checkout page
        window.location.href = '/checkout';
        
    } catch (error) {
        console.error('Checkout error:', error);
        showNotification('Failed to process checkout', 'error');
    } finally {
        hideLoading();
    }
}

async function updateCartItemQuantity(itemId, quantity) {
    try {
        const response = await fetch(`/api/cart/update/${itemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ quantity })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update cart');
        }

        // Reload cart
        if (window.ZippyApp && window.ZippyApp.loadCart) {
            await window.ZippyApp.loadCart();
        }
        
        showNotification('Cart updated', 'success');
        
    } catch (error) {
        console.error('Update cart error:', error);
        showNotification(error.message, 'error');
    }
}

async function clearCart() {
    if (!confirm('Are you sure you want to clear your cart?')) {
        return;
    }

    try {
        const response = await fetch('/api/cart/clear', {
            method: 'DELETE'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to clear cart');
        }

        // Reload cart
        if (window.ZippyApp && window.ZippyApp.loadCart) {
            await window.ZippyApp.loadCart();
        }
        
        showNotification('Cart cleared', 'success');
        
    } catch (error) {
        console.error('Clear cart error:', error);
        showNotification(error.message, 'error');
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

// Export functions
window.CartModule = {
    handleCheckout,
    updateCartItemQuantity,
    clearCart
}; 