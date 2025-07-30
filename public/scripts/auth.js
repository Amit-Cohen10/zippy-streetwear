// Authentication functionality
document.addEventListener('DOMContentLoaded', function() {
    initAuth();
});

function initAuth() {
    const authTabs = document.querySelectorAll('.auth-tab');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authTitle = document.getElementById('authTitle');

    // Tab switching
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            // Update active tab
            authTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show/hide forms
            if (targetTab === 'login') {
                loginForm.classList.remove('hidden');
                registerForm.classList.add('hidden');
                authTitle.textContent = 'Login';
            } else {
                loginForm.classList.add('hidden');
                registerForm.classList.remove('hidden');
                authTitle.textContent = 'Register';
            }
        });
    });

    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Register form submission
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const username = formData.get('username') || e.target.querySelector('input[type="text"]').value;
    const password = formData.get('password') || e.target.querySelector('input[type="password"]').value;
    const rememberMe = e.target.querySelector('input[type="checkbox"]').checked;

    try {
        showLoading();
        
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password,
                rememberMe
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }

        // Update global user state
        if (window.ZippyApp) {
            window.ZippyApp.currentUser = data.user;
            window.ZippyApp.updateAuthUI();
        }

        // Close modal
        document.getElementById('authModal').style.display = 'none';
        
        // Show success message
        showNotification('Login successful!', 'success');
        
        // Reload page to update UI
        setTimeout(() => {
            window.location.reload();
        }, 1000);

    } catch (error) {
        console.error('Login error:', error);
        showNotification(error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const inputs = e.target.querySelectorAll('input');
    
    const username = inputs[0].value;
    const email = inputs[1].value;
    const password = inputs[2].value;
    const confirmPassword = inputs[3].value;

    // Validation
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }

    if (password.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }

    try {
        showLoading();
        
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                email,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Registration failed');
        }

        // Update global user state
        if (window.ZippyApp) {
            window.ZippyApp.currentUser = data.user;
            window.ZippyApp.updateAuthUI();
        }

        // Close modal
        document.getElementById('authModal').style.display = 'none';
        
        // Show success message
        showNotification('Registration successful! Welcome to Zippy!', 'success');
        
        // Reload page to update UI
        setTimeout(() => {
            window.location.reload();
        }, 1000);

    } catch (error) {
        console.error('Registration error:', error);
        showNotification(error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function handleLogout() {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST'
        });

        if (response.ok) {
            // Update global user state
            if (window.ZippyApp) {
                window.ZippyApp.currentUser = null;
                window.ZippyApp.updateAuthUI();
            }
            
            showNotification('Logged out successfully', 'success');
            
            // Reload page
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    } catch (error) {
        console.error('Logout error:', error);
        showNotification('Logout failed', 'error');
    }
}

// Utility functions (if not already defined)
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
window.AuthModule = {
    handleLogin,
    handleRegister,
    handleLogout
}; 