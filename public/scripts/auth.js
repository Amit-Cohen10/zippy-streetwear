// Enhanced Authentication functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== AUTH MODULE LOADED ===');
    console.log('Current page:', window.location.pathname);
    
    try {
        initAuth();
        initUserData();
        
        // Update UI immediately
        console.log('About to call updateAuthUI from DOMContentLoaded');
        updateAuthUI();
        
        // Make updateAuthUI globally available
        window.updateAuthUI = updateAuthUI;
        
        console.log('Auth initialization completed successfully');
    } catch (error) {
        console.error('Error during auth initialization:', error);
    }
});

// Also call updateAuthUI when window loads
window.addEventListener('load', function() {
    console.log('=== WINDOW LOADED ===');
    console.log('About to call updateAuthUI from window load');
    updateAuthUI();
});

// Global user data management
let currentUser = null;
let userData = {
    profile: null,
    orders: [],
    exchanges: [],
    favorites: [],
    cart: []
};

// Export functions for global access
window.ZippyAuth = {
    updateAuthUI: function() {
        console.log('ZippyAuth.updateAuthUI called');
        if (typeof updateAuthUI === 'function') {
            updateAuthUI();
        } else {
            console.error('updateAuthUI function not available');
        }
    }
};

// Also make updateAuthUI available as a global function
window.updateAuthUI = function() {
    console.log('Global updateAuthUI called');
    if (typeof updateAuthUI === 'function') {
        updateAuthUI();
    } else {
        console.error('updateAuthUI function not available');
    }
};

function initAuth() {
    console.log('Initializing auth...');
    const authTabs = document.querySelectorAll('.auth-tab');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authTitle = document.getElementById('authTitle');
    const authModal = document.getElementById('authModal');
    const closeAuth = document.getElementById('closeAuth');
    const authBtn = document.getElementById('authBtn');

    console.log('Auth elements found:', {
        authTabs: authTabs.length,
        loginForm: !!loginForm,
        registerForm: !!registerForm,
        authModal: !!authModal,
        authBtn: !!authBtn,
        closeAuth: !!closeAuth
    });

    // Remove existing listeners and add new one
    if (authBtn) {
        // Clone and replace to remove all existing event listeners
        const newAuthBtn = authBtn.cloneNode(true);
        authBtn.parentNode.replaceChild(newAuthBtn, authBtn);
        
        // Add direct event listener for login button
        newAuthBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Auth button clicked');
            const savedUser = localStorage.getItem('currentUser');
            
            if (!savedUser) {
                // User is not logged in, open modal
                const authModal = document.getElementById('authModal');
                if (authModal) {
                    console.log('Opening auth modal');
                    authModal.style.display = 'flex';
                    authModal.classList.add('active');
                } else {
                    console.error('Auth modal not found');
                }
            } else {
                // User is logged in, handle logout
                console.log('User is logged in, handling logout');
                handleLogout();
            }
        });
        
        console.log('Auth button event listener added');
    }

    // Tab switching with enhanced animations
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            // Add click animation
            tab.style.transform = 'scale(0.95)';
            setTimeout(() => {
                tab.style.transform = '';
            }, 150);
            
            // Update active tab
            authTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show/hide forms with smooth transitions
            if (targetTab === 'login') {
                loginForm.classList.remove('hidden');
                registerForm.classList.add('hidden');
                authTitle.textContent = 'Login';
                animateFormTransition(loginForm);
            } else {
                loginForm.classList.add('hidden');
                registerForm.classList.remove('hidden');
                authTitle.textContent = 'Register';
                animateFormTransition(registerForm);
            }
        });
    });

    // Enhanced form submissions
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Close modal functionality
    if (closeAuth) {
        closeAuth.addEventListener('click', (e) => {
            e.preventDefault();
            closeAuthModal();
        });
    }
    
    // Close on background click
    if (authModal) {
        authModal.addEventListener('click', (e) => {
            if (e.target === authModal) {
                closeAuthModal();
            }
        });
    }

    // Social login handlers
    const socialButtons = document.querySelectorAll('.social-btn');
    socialButtons.forEach(btn => {
        btn.addEventListener('click', handleSocialLogin);
    });

    // Add event listener for logout button
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('logout-btn')) {
            handleLogout();
        }
    });

    console.log('Auth initialization complete');
}

function animateFormTransition(form) {
    form.style.opacity = '0';
    form.style.transform = 'translateY(20px) scale(0.95)';
    
    setTimeout(() => {
        form.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        form.style.opacity = '1';
        form.style.transform = 'translateY(0) scale(1)';
        
        // Add staggered animation to form elements
        const inputs = form.querySelectorAll('input, button');
        inputs.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateX(-20px)';
            
            setTimeout(() => {
                element.style.transition = 'all 0.3s ease';
                element.style.opacity = '1';
                element.style.transform = 'translateX(0)';
            }, 100 + (index * 50));
        });
    }, 50);
}

function closeAuthModal() {
    const authModal = document.getElementById('authModal');
    if (authModal) {
        authModal.style.opacity = '0';
        authModal.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            authModal.style.display = 'none';
            authModal.style.opacity = '';
            authModal.style.transform = '';
        }, 300);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    console.log('Login attempt...');
    console.log('Form element:', e.target);
    
    const submitBtn = e.target.querySelector('.auth-submit-btn');
    console.log('Submit button found:', !!submitBtn);
    
    const formData = new FormData(e.target);
    const username = formData.get('username');
    const password = formData.get('password');
    const rememberMe = formData.get('rememberMe') === 'on';

    console.log('Login credentials:', { username, password: '***', rememberMe });

    if (!username || !password) {
        console.error('Missing username or password');
        showErrorNotification('Please fill in all fields');
        return;
    }

    // Show loading state
    setButtonLoading(submitBtn, true);
    console.log('Button loading state set');

    try {
        // Call real API endpoint
        console.log('Calling login API...');
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
        console.log('API response:', data);
        
        if (response.ok && data.user) {
            console.log('Login successful:', data.user.username);
            // Store user data
            currentUser = data.user;
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            
            // Update UI
            updateAuthUI();
            showSuccessNotification('Login successful! Welcome back, ' + data.user.username);
            
            // Close modal with animation
            setTimeout(() => {
                closeAuthModal();
            }, 1000);
            
        } else {
            throw new Error(data.error || 'Login failed');
        }

    } catch (error) {
        console.error('Login error:', error);
        showErrorNotification(error.message);
    } finally {
        setButtonLoading(submitBtn, false);
        console.log('Button loading state reset');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    console.log('Register attempt...');
    console.log('Form element:', e.target);
    
    const submitBtn = e.target.querySelector('.auth-submit-btn');
    console.log('Submit button found:', !!submitBtn);
    
    const formData = new FormData(e.target);
    
    const username = formData.get('username');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    console.log('Register credentials:', { username, email, password: '***', confirmPassword: '***' });

    // Validation
    if (password !== confirmPassword) {
        showErrorNotification('Passwords do not match');
        return;
    }

    if (password.length < 6) {
        showErrorNotification('Password must be at least 6 characters');
        return;
    }

    // Show loading state
    setButtonLoading(submitBtn, true);
    console.log('Button loading state set');

    try {
        // Call real API endpoint
        console.log('Calling register API...');
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
        console.log('API response:', data);
        
        if (response.ok && data.user) {
            // Store user data
            currentUser = data.user;
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            
            // Update UI
            updateAuthUI();
            showSuccessNotification('Registration successful! Welcome to Zippy, ' + data.user.username);
            
            // Close modal with animation
            setTimeout(() => {
                closeAuthModal();
            }, 1000);
            
        } else {
            throw new Error(data.error || 'Registration failed');
        }

    } catch (error) {
        console.error('Registration error:', error);
        showErrorNotification(error.message);
    } finally {
        setButtonLoading(submitBtn, false);
        console.log('Button loading state reset');
    }
}

function setButtonLoading(button, loading) {
    console.log('setButtonLoading called:', { button: !!button, loading });
    
    if (!button) {
        console.error('Button element not found');
        return;
    }
    
    if (loading) {
        button.classList.add('loading');
        button.disabled = true;
        console.log('Button set to loading state');
    } else {
        button.classList.remove('loading');
        button.disabled = false;
        console.log('Button loading state removed');
    }
}

async function handleSocialLogin(e) {
    const provider = e.currentTarget.classList.contains('google') ? 'google' : 'facebook';
    
    try {
        showInfoNotification(`Connecting to ${provider}...`);
        
        // Simulate social login
        const userData = await simulateSocialLoginAPI(provider);
        
        if (userData.success) {
            currentUser = userData.user;
            localStorage.setItem('currentUser', JSON.stringify(userData.user));
            localStorage.setItem('userToken', userData.token);
            
            updateAuthUI();
            showSuccessNotification(`Logged in with ${provider}!`);
            
            setTimeout(() => {
                closeAuthModal();
            }, 1000);
        }
        
    } catch (error) {
        console.error('Social login error:', error);
        showErrorNotification(`Failed to login with ${provider}`);
    }
}

async function handleLogout() {
    console.log('Logging out...');
    
    try {
        // Call logout endpoint
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        
        // Clear user data
        currentUser = null;
        userData = {
            profile: null,
            orders: [],
            exchanges: [],
            favorites: [],
            cart: []
        };
        
        // Clear localStorage
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userData');
        localStorage.removeItem('userToken');
        
        // Update UI
        updateAuthUI();
        
        // Show success notification
        showSuccessNotification('Logged out successfully');
        
        // Reload page to refresh all components
        setTimeout(() => {
            window.location.reload();
        }, 500);
        
        console.log('Logout completed');
    } catch (error) {
        console.error('Error during logout:', error);
        showErrorNotification('Error during logout');
    }
}



function updateAuthUI() {
    console.log('updateAuthUI called');
    const authBtn = document.getElementById('authBtn');
    const userDashboard = document.getElementById('userDashboard');
    
    console.log('Auth button found:', !!authBtn);
    console.log('User dashboard found:', !!userDashboard);
    
    if (!authBtn) {
        console.log('Auth button not found');
        return;
    }
    
    // Load user from localStorage
    const savedUser = localStorage.getItem('currentUser');
    console.log('Saved user:', savedUser);
    
    if (savedUser) {
        try {
            const user = JSON.parse(savedUser);
            console.log('Parsed user:', user);
            
            // Update auth button to show logged-in state with hover effect
            authBtn.innerHTML = `
                <span class="user-name">${user.username || user.name || 'User'}</span>
                <span class="logout-text">Logout</span>
            `;
            authBtn.classList.add('logged-in');
            
            console.log('Updated auth button for logged-in user');
            
            // Show user dashboard if it exists
            if (userDashboard) {
                console.log('Showing user dashboard');
                userDashboard.style.display = 'block';
                userDashboard.classList.add('active');
                
                // Load user data for dashboard
                loadUserData();
            }
            
        } catch (error) {
            console.error('Error parsing saved user:', error);
            // Clear invalid data
            localStorage.removeItem('currentUser');
            localStorage.removeItem('userData');
            // Reset to login state
            authBtn.innerHTML = 'Login';
            authBtn.classList.remove('logged-in');
        }
    } else {
        console.log('No saved user, showing login state');
        // Update auth button to show login state
        authBtn.innerHTML = 'Login';
        authBtn.classList.remove('logged-in');
        
        console.log('Updated auth button for login state');
        
        // Hide user dashboard if it exists
        if (userDashboard) {
            console.log('Hiding user dashboard');
            userDashboard.style.display = 'none';
            userDashboard.classList.remove('active');
        }
    }
    
    // Remove any existing onclick to avoid duplicates
    authBtn.onclick = null;
    
    console.log('Auth UI updated successfully');
}

// Simulated API functions
async function simulateLoginAPI(username, password, rememberMe) {
    console.log('simulateLoginAPI called with:', { username, password: '***', rememberMe });
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock user data
    const mockUsers = [
        { id: 1, username: "CyberVibes", name: "CyberVibes", avatar: "👨‍💻", email: "cyber@zippy.com", color: "#00ffff" },
        { id: 2, username: "NeonQueen", name: "NeonQueen", avatar: "👩‍🎨", email: "neon@zippy.com", color: "#ff00ff" },
        { id: 3, username: "StreetTech", name: "StreetTech", avatar: "🧑‍🔧", email: "tech@zippy.com", color: "#00ff00" },
        { id: 4, username: "AmitCohen", name: "AmitCohen", avatar: "👤", email: "amitcohen@gmail.com", color: "#ff6b35" }
    ];
    
    const user = mockUsers.find(u => 
        u.username.toLowerCase() === username.toLowerCase() || 
        u.email === username
    );
    
    console.log('Found user:', user);
    
    if (user && password === '123456') {
        const result = {
            success: true,
            user: {
                ...user,
                token: 'mock-jwt-token-' + Date.now(),
                lastLogin: new Date().toISOString()
            },
            token: 'mock-jwt-token-' + Date.now()
        };
        console.log('Login successful, returning:', result);
        return result;
    } else {
        const result = {
            success: false,
            error: 'Invalid username or password'
        };
        console.log('Login failed, returning:', result);
        return result;
    }
}

async function simulateRegisterAPI(username, email, password) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user already exists
    const existingUsers = [
        { username: "CyberVibes", name: "CyberVibes", email: "cyber@zippy.com" },
        { username: "NeonQueen", name: "NeonQueen", email: "neon@zippy.com" },
        { username: "StreetTech", name: "StreetTech", email: "tech@zippy.com" }
    ];
    
    const userExists = existingUsers.find(u => 
        u.username.toLowerCase() === username.toLowerCase() || 
        u.email === email
    );
    
    if (userExists) {
        return {
            success: false,
            error: 'Username or email already exists'
        };
    }
    
    // Create new user
    const newUser = {
        id: Date.now(),
        username: username,
        name: username,
        email: email,
        avatar: "👤",
        color: "#" + Math.floor(Math.random()*16777215).toString(16),
        createdAt: new Date().toISOString()
    };
    
    return {
        success: true,
        user: {
            ...newUser,
            token: 'mock-jwt-token-' + Date.now()
        },
        token: 'mock-jwt-token-' + Date.now()
    };
}

async function simulateSocialLoginAPI(provider) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const socialUsers = {
        google: { id: 4, username: "GoogleUser", name: "GoogleUser", avatar: "🔍", email: "google@zippy.com", color: "#4285f4" },
        facebook: { id: 5, username: "FacebookUser", name: "FacebookUser", avatar: "📘", email: "facebook@zippy.com", color: "#1877f2" }
    };
    
    return {
        success: true,
        user: {
            ...socialUsers[provider],
            token: 'mock-jwt-token-' + Date.now()
        },
        token: 'mock-jwt-token-' + Date.now()
    };
}

// Enhanced notification system
function showSuccessNotification(message) {
    showNotification(message, 'success');
}

function showErrorNotification(message) {
    showNotification(message, 'error');
}

function showInfoNotification(message) {
    showNotification(message, 'info');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${getNotificationIcon(type)}</span>
            <span class="notification-text">${message}</span>
        </div>
        <button class="notification-close">×</button>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: #000;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        z-index: 10000;
        font-weight: 600;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
        transform: translateX(100%);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        max-width: 400px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Close button
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto remove
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 4000);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return '✅';
        case 'error': return '❌';
        case 'info': return 'ℹ️';
        default: return '💡';
    }
}

function getNotificationColor(type) {
    switch (type) {
        case 'success': return 'linear-gradient(45deg, #00ff00, #00cc00)';
        case 'error': return 'linear-gradient(45deg, #ff4444, #cc0000)';
        case 'info': return 'linear-gradient(45deg, #00ffff, #00cccc)';
        default: return 'linear-gradient(45deg, #ffff00, #cccc00)';
    }
}

// User data management
function initUserData() {
    console.log('Initializing user data...');
    
    // Load current user from localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            console.log('Loaded user from localStorage:', currentUser);
        } catch (error) {
            console.error('Error loading user from localStorage:', error);
            localStorage.removeItem('currentUser');
            currentUser = null;
        }
    }
    
    // Update UI immediately
    updateAuthUI();
    
    console.log('User data initialization completed');
}

function loadUserData() {
    if (!currentUser) return;
    
    console.log('Loading user data for:', currentUser.name);
    
    // Load user's orders, exchanges, favorites, etc.
    // This would typically come from an API
    userData = {
        profile: currentUser,
        orders: generateMockOrders(),
        exchanges: generateMockExchanges(),
        favorites: generateMockFavorites(),
        cart: []
    };
    
    // Update UI with user data
    updateUserDashboard();
    console.log('User data loaded');
}

function generateMockOrders() {
    return [
        {
            id: 1,
            orderNumber: 'ZIP-2024-001',
            date: '2024-01-15',
            items: [
                { 
                    id: 1, 
                    name: 'Cyber Samurai Hoodie', 
                    price: 89.99, 
                    quantity: 1,
                    image: 'cyber-samurai-hoodie.jpg',
                    size: 'M',
                    color: 'Black'
                },
                { 
                    id: 2, 
                    name: 'Neon Grid Pants', 
                    price: 69.99, 
                    quantity: 1,
                    image: 'neon-grid-pants.jpg',
                    size: 'L',
                    color: 'Gray'
                }
            ],
            total: 159.98,
            status: 'delivered',
            trackingNumber: 'TRK123456789',
            estimatedDelivery: '2024-01-20'
        },
        {
            id: 2,
            orderNumber: 'ZIP-2024-002',
            date: '2024-01-10',
            items: [
                { 
                    id: 3, 
                    name: 'Digital Camo Tee', 
                    price: 39.99, 
                    quantity: 2,
                    image: 'digital-camo-tee.jpg',
                    size: 'L',
                    color: 'Green'
                }
            ],
            total: 79.98,
            status: 'shipped',
            trackingNumber: 'TRK987654321',
            estimatedDelivery: '2024-01-18'
        }
    ];
}

function generateMockExchanges() {
    return [
        {
            id: 1,
            title: 'Vintage Neural Network Hoodie for Retro Future',
            description: 'Looking to trade my rare vintage Neural Network hoodie (M) for any Retro Future hoodie in size M.',
            status: 'active',
            createdAt: '2024-01-10',
            likes: 12,
            comments: 3,
            views: 45,
            category: 'hoodies',
            offeredSize: 'M',
            wantedSize: 'M'
        },
        {
            id: 2,
            title: 'Cyber Samurai Pants for Data Stream',
            description: 'Trading my Cyber Samurai pants (L) for Data Stream pants in size L.',
            status: 'pending',
            createdAt: '2024-01-12',
            likes: 8,
            comments: 1,
            views: 23,
            category: 'pants',
            offeredSize: 'L',
            wantedSize: 'L'
        }
    ];
}

function generateMockFavorites() {
    return [
        { 
            id: 1, 
            name: 'Quantum Hoodie', 
            price: 99.99, 
            image: 'quantum-hoodie.jpg',
            category: 'hoodies',
            rating: 4.8,
            reviews: 127,
            inStock: true
        },
        { 
            id: 2, 
            name: 'Matrix Rain Pants', 
            price: 79.99, 
            image: 'matrix-rain-pants.jpg',
            category: 'pants',
            rating: 4.6,
            reviews: 89,
            inStock: true
        },
        { 
            id: 3, 
            name: 'Hologram Tee', 
            price: 49.99, 
            image: 'hologram-tee.jpg',
            category: 't-shirts',
            rating: 4.9,
            reviews: 203,
            inStock: false
        }
    ];
}

function updateUserDashboard() {
    console.log('Updating user dashboard...');
    // Update dashboard with user data
    // This would update various UI elements with user-specific data
    console.log('User dashboard updated with:', userData);
}

// Export functions
window.AuthModule = {
    handleLogin,
    handleRegister,
    handleLogout,
    handleSocialLogin,
    updateAuthUI,
    loadUserData
}; 