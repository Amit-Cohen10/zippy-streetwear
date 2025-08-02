// Global functionality for all pages
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    initializeViewPreferences();
    initializeThemeToggle();
    initializeUserMenu();
    
    // Update auth UI if the function exists
    if (typeof updateAuthUI === 'function') {
        updateAuthUI();
    }
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
        const userMenu = document.getElementById('userMenu');
        
        if (authBtn) {
            authBtn.style.display = 'inline-block';
            authBtn.textContent = 'LOGIN';
        }
        
        if (userMenu) {
            userMenu.style.display = 'none';
        }
        
        // Set global login status
        window.isLoggedIn = false;
        window.currentUser = null;
        
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

// User menu functionality
function initializeUserMenu() {
    // אם הסקריפט החדש פועל, אל תטפל בכפתור המשתמש
    if (window.blockGlobalUserMenu) {
        console.log('🚫 Global user menu blocked by simple-user-menu.js');
        return;
    }
    
    console.log('Initializing user menu...');
    
    // Try multiple times since elements might not be ready
    setTimeout(() => {
        const userMenuToggle = document.getElementById('userMenuToggle');
        const userMenu = document.getElementById('userMenu');
        const userDropdown = document.getElementById('userDropdown');
        
        console.log('User menu elements:', { userMenuToggle, userMenu, userDropdown });
        
        if (userMenuToggle && userMenu) {
            console.log('Adding click listener to user menu toggle');
            
            // Remove any existing listeners
            userMenuToggle.onclick = null;
            
            userMenuToggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('User menu toggle clicked!');
                userMenu.classList.toggle('active');
                console.log('User menu active state:', userMenu.classList.contains('active'));
            });
            
            // Also add onclick for backup
            userMenuToggle.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('User menu toggle clicked via onclick!');
                userMenu.classList.toggle('active');
                console.log('User menu active state:', userMenu.classList.contains('active'));
            };
            
            // Close dropdown when clicking outside
            document.addEventListener('click', function(e) {
                if (userMenu && !userMenu.contains(e.target)) {
                    userMenu.classList.remove('active');
                }
            });
            
            // Close dropdown when pressing escape
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && userMenu) {
                    userMenu.classList.remove('active');
                }
            });
            
            console.log('User menu initialized successfully!');
        } else {
            console.log('User menu elements not found, retrying...');
            // Retry after another delay
            setTimeout(initializeUserMenu, 1000);
        }
    }, 500);
}

// Update user menu with username
function updateUserMenu(username) {
    const usernameDisplay = document.getElementById('usernameDisplay');
    if (usernameDisplay) {
        usernameDisplay.textContent = username || 'User';
    }
}

// Show/hide user menu based on login status
function toggleUserMenuVisibility(isLoggedIn, username = null) {
    const authBtn = document.getElementById('authBtn');
    const userMenu = document.getElementById('userMenu');
    
    if (authBtn && userMenu) {
        if (isLoggedIn) {
            authBtn.style.display = 'none';
            userMenu.style.display = 'block';
            if (username) {
                updateUserMenu(username);
            }
        } else {
            authBtn.style.display = 'inline-block';
            userMenu.style.display = 'none';
        }
    }
}

// Export for global access
window.toggleTheme = toggleTheme;
window.logout = logout;
window.initializeUserMenu = initializeUserMenu;
window.updateUserMenu = updateUserMenu;
window.toggleUserMenuVisibility = toggleUserMenuVisibility; 