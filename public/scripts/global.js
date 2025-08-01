// Global functionality for all pages
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    initializeViewPreferences();
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
    
    // Create theme toggle button if not exists
    if (!document.getElementById('themeToggle')) {
        // Find the auth button
        const authBtn = document.getElementById('authBtn');
        if (authBtn && authBtn.parentElement) {
            const themeToggle = document.createElement('button');
            themeToggle.id = 'themeToggle';
            themeToggle.className = 'theme-toggle';
            themeToggle.innerHTML = savedTheme === 'dark' ? '☀️' : '🌙';
            themeToggle.title = 'Toggle theme';
            if (themeToggle) {
                themeToggle.onclick = toggleTheme;
            }
            
            // Insert the theme toggle before the auth button
            authBtn.parentElement.insertBefore(themeToggle, authBtn);
        }
    }
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
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.innerHTML = newTheme === 'dark' ? '☀️' : '🌙';
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

// Export for global access
window.toggleTheme = toggleTheme; 