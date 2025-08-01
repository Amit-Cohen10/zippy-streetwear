// Global functionality for all pages
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    initializeViewPreferences();
    initializeThemeToggle();
});

// Initialize theme toggle button
function initializeThemeToggle() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const themeIcon = document.getElementById('themeIcon');
    
    if (themeIcon) {
        themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    // Apply saved theme
    document.body.className = '';
    document.body.classList.add(`theme-${savedTheme}`);
}

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
    
    // Auto-scroll to top when opening cart
    setTimeout(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }, 100);
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

// View customization functionality
function initializeViewPreferences() {
    // Load saved preferences
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const savedLayout = localStorage.getItem('layout') || 'grid';
    
    // Apply theme
    document.body.classList.add(`theme-${savedTheme}`);
    
    // Theme toggle button is now in HTML, no need to create dynamically
}

function toggleTheme() {
    const body = document.body;
    const currentTheme = body.classList.contains('theme-light') ? 'light' : 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Remove old theme class and add new one
    body.classList.remove(`theme-${currentTheme}`);
    body.classList.add(`theme-${newTheme}`);
    
    // Save preference
    localStorage.setItem('theme', newTheme);
    
    // Update toggle button
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
        themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    // Update user preferences if logged in
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        try {
            const user = JSON.parse(currentUser);
            if (user.preferences) {
                user.preferences.darkMode = newTheme === 'dark';
                localStorage.setItem('currentUser', JSON.stringify(user));
            }
        } catch (error) {
            console.error('Error updating user preferences:', error);
        }
    }
    
    // Show notification
    showNotification(`Theme changed to ${newTheme} mode`, 'success');
}

// Global logout function
async function logout() {
    try {
        console.log('Logging out...');
        
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        
        // Clear local storage
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userData');
        localStorage.removeItem('userToken');
        localStorage.removeItem('zippyCart');
        
        // Update UI
        const authBtn = document.getElementById('authBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        
        if (authBtn) {
            authBtn.style.display = 'inline-block';
            authBtn.textContent = 'LOGIN';
        }
        
        if (logoutBtn) {
            logoutBtn.style.display = 'none';
        }
        
        // Update cart count
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            cartCount.textContent = '0';
        }
        
        showNotification('Logged out successfully', 'success');
        
        // Redirect to home page
        setTimeout(() => {
            window.location.href = '/';
        }, 1000);
        
    } catch (error) {
        console.error('Logout error:', error);
        showNotification('Error during logout', 'error');
    }
}

// Export for global access
window.toggleTheme = toggleTheme;
window.logout = logout; 