// Simple Authentication System
if (!window.currentUser) {
    window.currentUser = null;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Auth system initializing...');
    initAuth();
    updateAuthUI();
    
    // Wait a bit before initializing session timeout to avoid conflicts
    setTimeout(() => {
        // Initialize global session timeout system
        initGlobalSessionTimeout();
        
        // Initialize session timeout if function exists
        if (window.initSessionTimeout) {
            window.initSessionTimeout();
        }
    }, 1000);

    // --- LocalStorage watcher for login state ---
    let lastUser = localStorage.getItem('currentUser');
    setInterval(() => {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser !== lastUser) {
            lastUser = currentUser;
            if (typeof window.updateAuthUI === 'function') {
                window.updateAuthUI();
            }
            // Re-initialize session timeout when user changes
            if (window.initSessionTimeout) {
                window.initSessionTimeout();
            }
            // Update session start time when user logs in
            if (currentUser) {
                updateSessionStartTime();
            }
        }
    }, 1000); // Check every second instead of 500ms
    // --- End watcher ---
});

function initAuth() {
    console.log('Setting up auth components...');
    
    const authBtn = document.getElementById('authBtn');
    const authModal = document.getElementById('authModal');
    const closeAuth = document.getElementById('closeAuth');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authTabs = document.querySelectorAll('.auth-tab');
    
    if (!authBtn) {
        console.error('Auth button not found!');
        return;
    }
    
    // Auth button click handler
    if (authBtn) {
        authBtn.onclick = function() {
            console.log('Auth button clicked');
            const savedUser = localStorage.getItem('currentUser');
            if (!savedUser) {
                console.log('No saved user, opening login modal');
                openAuthModal();
            } else {
                console.log('User is logged in, handling logout');
                handleLogout();
            }
        };
    }
    
    // Close button
    if (closeAuth) {
        closeAuth.onclick = closeAuthModal;
    }
    
    // Close on background click
    if (authModal) {
        authModal.onclick = function(e) {
            if (e.target === authModal) {
                closeAuthModal();
            }
        };
    }
    
    // Tab switching
    authTabs.forEach(tab => {
        if (tab) {
            tab.onclick = function() {
                const targetTab = tab.dataset.tab;
                console.log('Switching to tab:', targetTab);
                
                authTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                if (targetTab === 'login') {
                    loginForm.classList.remove('hidden');
                    registerForm.classList.add('hidden');
                    document.getElementById('authTitle').textContent = 'Login';
                } else {
                    loginForm.classList.add('hidden');
                    registerForm.classList.remove('hidden');
                    document.getElementById('authTitle').textContent = 'Register';
                }
            };
        }
    });
    
    // Form submissions
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        console.log('Login form event listener added');
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
        console.log('Register form event listener added');
    }
    
    console.log('Auth initialization complete');
    
    // Update UI based on current login status
    updateAuthUI();
}

function openAuthModal() {
    console.log('Opening auth modal');
    const authModal = document.getElementById('authModal');
    if (authModal) {
        authModal.style.display = 'flex';
        authModal.classList.add('active');
        
        // Scroll to top
        window.scrollTo(0, 0);
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }
}

function closeAuthModal() {
    console.log('Closing auth modal');
    const authModal = document.getElementById('authModal');
    if (authModal) {
        authModal.style.display = 'none';
        authModal.classList.remove('active');
        
        // Restore body scroll
        document.body.style.overflow = '';
    }
}

async function handleLogin(e) {
    e.preventDefault();
    console.log('Handling login...');
    
    console.log('Form submitted:', e.target);
    console.log('Form elements:', e.target.elements);
    
    // Try different ways to get form data
    console.log('Form target:', e.target);
    console.log('Form ID:', e.target.id);
    
    // Method 1: FormData
    const formData = new FormData(e.target);
    let username = formData.get('username');
    let password = formData.get('password');
    const rememberMe = formData.get('rememberMe') === 'on';
    
    console.log('FormData results:', { username, password, rememberMe });
    
    // Method 2: Direct access if FormData failed
    if (!username || !password) {
        console.log('FormData failed, trying direct access...');
        const usernameInput = e.target.querySelector('input[name="username"]');
        const passwordInput = e.target.querySelector('input[name="password"]');
        
        console.log('Username input:', usernameInput);
        console.log('Password input:', passwordInput);
        
        if (usernameInput) {
            console.log('Username input found, value:', usernameInput.value);
            username = usernameInput.value;
        }
        if (passwordInput) {
            console.log('Password input found, value:', passwordInput.value);
            password = passwordInput.value;
        }
    }
    
    // Method 3: Try getting from form elements
    if (!username || !password) {
        console.log('Direct access failed, trying form elements...');
        console.log('Form elements:', e.target.elements);
        console.log('Username element:', e.target.elements.username);
        console.log('Password element:', e.target.elements.password);
        
        username = e.target.elements.username?.value || '';
        password = e.target.elements.password?.value || '';
    }
    
    // Method 4: Try getting all inputs
    if (!username || !password) {
        console.log('All methods failed, trying all inputs...');
        const allInputs = e.target.querySelectorAll('input');
        console.log('All inputs:', allInputs);
        
        allInputs.forEach((input, index) => {
            console.log(`Input ${index}:`, input.name, input.type, input.value);
        });
        
        // Get values directly from inputs
        const usernameInput = allInputs[0]; // First input should be username
        const passwordInput = allInputs[1]; // Second input should be password
        
        console.log('Username input element:', usernameInput);
        console.log('Password input element:', passwordInput);
        
        if (usernameInput && usernameInput.type === 'text') {
            username = usernameInput.value;
            console.log('Got username from input:', username);
        }
        
        if (passwordInput && passwordInput.type === 'password') {
            password = passwordInput.value;
            console.log('Got password from input:', password);
        }
        
        // Also try getting by name attribute
        if (!username || !password) {
            console.log('Trying by name attribute...');
            const usernameByName = e.target.querySelector('input[name="username"]');
            const passwordByName = e.target.querySelector('input[name="password"]');
            
            console.log('Username by name:', usernameByName);
            console.log('Password by name:', passwordByName);
            
            if (usernameByName) {
                username = usernameByName.value;
                console.log('Got username by name:', username);
            }
            
            if (passwordByName) {
                password = passwordByName.value;
                console.log('Got password by name:', password);
            }
        }
    }
    
    console.log('Final form data:', { username, password, rememberMe });
    console.log('Final username length:', username ? username.length : 0);
    console.log('Final password length:', password ? password.length : 0);
    
    if (!username || !password) {
        console.log('Validation failed:', { username: !!username, password: !!password });
        alert('Please fill in all fields');
        return;
    }
    
    try {
        console.log('Sending login request...');
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
        console.log('Login response:', data);
        
        if (data.message === 'Login successful' || data.success) {
            console.log('✅ Login successful');
            
            // Store user data
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            localStorage.setItem('userData', JSON.stringify(data.user));
            localStorage.setItem('userToken', data.token);
            localStorage.setItem('authToken', data.token);
            
            // Update session start time
            updateSessionStartTime();
            
            // Update global state
            window.isLoggedIn = true;
            window.currentUser = data.user;
            
            // Update UI
            updateAuthUI();
            
            // Close modal
            closeAuthModal();
            
            // Show success message
            showNotification('Login successful!', 'success');
            
            // Reload page to update UI
            setTimeout(() => {
                window.location.reload();
            }, 500);
        } else {
            console.log('❌ Login failed:', data.message);
            showNotification(data.message || 'Login failed', 'error');
        }
        
    } catch (error) {
        console.error('Login error:', error);
        alert(error.message);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    console.log('Handling registration...');
    
    const formData = new FormData(e.target);
    const username = formData.get('username');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    if (password.length < 6) {
        alert('Password must be at least 6 characters');
        return;
    }
    
    try {
        console.log('Sending registration request...');
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
        console.log('Registration response:', data);
        
        if (response.ok && data.user) {
            window.currentUser = data.user;
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            
            const displayName = data.user.profile?.displayName || data.user.username;
            alert(`Registration successful! Welcome to Zippy, ${displayName}`);
            
            closeAuthModal();
            updateAuthUI();
            
            // Show success message
            showNotification('Registration successful!', 'success');
            
            // Refresh the page to ensure UI is properly updated
            setTimeout(() => {
                window.location.reload();
            }, 500);
            
        } else {
            throw new Error(data.error || 'Registration failed');
        }
        
    } catch (error) {
        console.error('Registration error:', error);
        alert(error.message);
    }
}

async function handleLogout() {
    console.log('Handling logout...');
    
    try {
        await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        
        currentUser = null;
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userData');
        localStorage.removeItem('userToken');
        
        alert('Logged out successfully');
        updateAuthUI();
        
    } catch (error) {
        console.error('Logout error:', error);
        alert('Error during logout');
    }
}

function updateAuthUI() {
    // אם הסקריפט החדש פועל, אל תפריע לו
    if (window.blockGlobalUserMenu) {
        console.log('🚫 Auth UI update blocked by simple-user-menu.js');
        return;
    }
    
    console.log('🔄 Updating auth UI...');
    const authBtn = document.getElementById('authBtn');
    const userMenu = document.getElementById('userMenu');
    
    console.log('🔍 Found elements:', { 
        authBtn: !!authBtn, 
        userMenu: !!userMenu,
        authBtnText: authBtn ? authBtn.textContent : 'N/A',
        authBtnDisplay: authBtn ? authBtn.style.display : 'N/A',
        userMenuDisplay: userMenu ? userMenu.style.display : 'N/A'
    });
    
    if (!authBtn) {
        console.log('❌ Auth button not found, skipping UI update');
        return;
    }
    
    const savedUser = localStorage.getItem('currentUser');
    console.log('👤 Saved user:', savedUser ? 'exists' : 'none');
    
    if (savedUser) {
        try {
            const user = JSON.parse(savedUser);
            console.log('✅ Parsed user:', user);
            
            const displayName = user.profile?.displayName || user.username || 'User';
            console.log('📝 Display name:', displayName);
            
            // If userMenu exists, use it. Otherwise, just update the auth button text
            if (authBtn && userMenu) {
                console.log('🎯 Using userMenu approach');
                authBtn.style.display = 'none';
                userMenu.style.display = 'block';
                
                // Update username in menu
                const usernameDisplay = document.getElementById('usernameDisplay');
                if (usernameDisplay) {
                    usernameDisplay.textContent = displayName;
                }
                
                // Set global login status
                window.isLoggedIn = true;
                window.currentUser = user;
                
                console.log('✅ User menu should be visible now');
            } else if (authBtn) {
                console.log('🎯 Using auth button text approach');
                // Just update the button text since userMenu doesn't exist
                authBtn.textContent = displayName;
                authBtn.onclick = function() {
                    console.log('User menu clicked');
                    // You can add user menu functionality here
                    if (confirm('Do you want to logout?')) {
                        handleLogout();
                    }
                };
                
                // Set global login status
                window.isLoggedIn = true;
                window.currentUser = user;
                
                console.log('✅ Auth button updated to show user name');
            } else {
                console.log('❌ Neither authBtn nor userMenu found');
            }
            
            console.log('✅ Updated auth UI for logged-in user');
            
        } catch (error) {
            console.error('❌ Error parsing saved user:', error);
            localStorage.removeItem('currentUser');
            
            // Show login button and hide user menu
            if (authBtn && userMenu) {
                authBtn.style.display = 'inline-block';
                userMenu.style.display = 'none';
            } else if (authBtn) {
                authBtn.textContent = 'Login';
                authBtn.onclick = function() {
                    openAuthModal();
                };
            }
        }
    } else {
        console.log('👤 No saved user, showing login state');
        
        // Show login button and hide user menu
        if (authBtn && userMenu) {
            authBtn.style.display = 'inline-block';
            userMenu.style.display = 'none';
        } else if (authBtn) {
            authBtn.textContent = 'Login';
            authBtn.onclick = function() {
                openAuthModal();
            };
        } else {
            console.log('❌ Neither authBtn nor userMenu found for logout state');
        }
        
        // Set global login status
        window.isLoggedIn = false;
        window.currentUser = null;
    }
    
    console.log('✅ Auth UI update complete');
}

// Make functions globally available
window.updateAuthUI = updateAuthUI;
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;

// Add user menu functionality (copied and adapted from simple-user-menu.js)
function positionDropdownBelowButton() {
    const userMenuToggle = document.getElementById('userMenuToggle');
    const userDropdown = document.getElementById('userDropdown');
    if (userMenuToggle && userDropdown) {
        const buttonRect = userMenuToggle.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        const top = buttonRect.bottom + scrollTop + 5;
        const left = buttonRect.right + scrollLeft - 220;
        userDropdown.style.setProperty('position', 'absolute', 'important');
        userDropdown.style.setProperty('top', top + 'px', 'important');
        userDropdown.style.setProperty('left', left + 'px', 'important');
        userDropdown.style.setProperty('right', 'auto', 'important');
    }
}

function toggleDropdown() {
    console.log('🔄 Auth.js toggleDropdown called');
    const userDropdown = document.getElementById('userDropdown');
    if (userDropdown) {
        const computedDisplay = getComputedStyle(userDropdown).display;
        const isVisible = computedDisplay === 'block';
        if (isVisible) {
            userDropdown.style.setProperty('display', 'none', 'important');
            console.log('🔒 Auth.js dropdown closed');
        } else {
            positionDropdownBelowButton();
            userDropdown.style.setProperty('display', 'block', 'important');
            userDropdown.style.setProperty('visibility', 'visible', 'important');
            userDropdown.style.setProperty('opacity', '1', 'important');
            userDropdown.style.setProperty('z-index', '999999', 'important');
            console.log('🔓 Auth.js dropdown opened');
        }
    } else {
        console.log('❌ Auth.js dropdown element not found');
    }
}

function initUserMenu() {
    console.log('🚀 Initializing simple user menu...');
    // Check if simple-user-menu.js is loaded and block this function
    if (window.blockGlobalUserMenu) {
        console.log('🚫 Auth.js initUserMenu blocked by simple-user-menu.js');
        return;
    }
    // Remove all event listeners from the toggle to prevent conflicts
    const existingToggle = document.getElementById('userMenuToggle');
    if (existingToggle) {
        const newToggle = existingToggle.cloneNode(true);
        existingToggle.parentNode.replaceChild(newToggle, existingToggle);
    }
    const authBtn = document.getElementById('authBtn');
    const userMenu = document.getElementById('userMenu');
    const userMenuToggle = document.getElementById('userMenuToggle');
    const userDropdown = document.getElementById('userDropdown');
    const usernameDisplay = document.getElementById('usernameDisplay');
    // Check login state
    const savedUser = localStorage.getItem('currentUser');
    let isLoggedIn = false;
    let username = '';
    if (savedUser) {
        try {
            const user = JSON.parse(savedUser);
            isLoggedIn = true;
            username = user.profile?.displayName || user.username || 'User';
            console.log('✅ User is logged in:', username);
        } catch (e) {
            console.log('❌ Error parsing user data');
            localStorage.removeItem('currentUser');
        }
    }
    // Set display according to state
    if (isLoggedIn) {
        if (authBtn) authBtn.style.display = 'none';
        if (userMenu) userMenu.style.display = 'block';
        if (usernameDisplay) usernameDisplay.textContent = username;
        if (userMenuToggle && userDropdown) {
            userMenuToggle.addEventListener('click', function(e) {
                console.log('🎯 Auth.js click handler triggered');
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                toggleDropdown();
            }, true);
        }
        console.log('✅ User menu setup completed');
    } else {
        if (authBtn) authBtn.style.display = 'inline-block';
        if (userMenu) userMenu.style.display = 'none';
        console.log('✅ Login button setup completed');
    }
    // Close dropdown on outside click
    document.addEventListener('click', function(e) {
        if (userDropdown && !userMenu.contains(e.target)) {
            userDropdown.style.display = 'none';
        }
    });
    // Reposition on resize/scroll
    window.addEventListener('resize', function() {
        if (userDropdown && getComputedStyle(userDropdown).display === 'block') {
            positionDropdownBelowButton();
        }
    });
    window.addEventListener('scroll', function() {
        if (userDropdown && getComputedStyle(userDropdown).display === 'block') {
            positionDropdownBelowButton();
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    initUserMenu();
});

// Make handleLogout globally available
window.handleLogout = handleLogout;

// Global session management
let globalSessionCheckInterval = null;

// Initialize global session timeout system
function initGlobalSessionTimeout() {
    console.log('🌐 Initializing global session timeout system...');
    
    // Clear any existing global interval
    if (globalSessionCheckInterval) {
        clearInterval(globalSessionCheckInterval);
    }
    
    // Start global periodic check (every 30 seconds)
    globalSessionCheckInterval = setInterval(async () => {
        const userData = localStorage.getItem('currentUser');
        if (!userData) {
            console.log('❌ No user logged in globally');
            return;
        }
        
        try {
            const user = JSON.parse(userData);
            const rememberMe = user.rememberMe || false;
            const timeoutMs = rememberMe ? 12 * 24 * 60 * 60 * 1000 : 30 * 60 * 1000;
            
            // Get session start time from localStorage or use current time
            const sessionStartStr = localStorage.getItem('sessionStartTime');
            const sessionStartTime = sessionStartStr ? parseInt(sessionStartStr) : Date.now();
            
            // Check if session has expired
            const currentTime = Date.now();
            const sessionAge = currentTime - sessionStartTime;
            
            if (sessionAge >= timeoutMs) {
                console.log('⏰ Global session expired, logging out...');
                forceGlobalLogout();
                return;
            }
            
            // Also check server session
            try {
                const response = await fetch('/api/auth/status', {
                    method: 'GET',
                    credentials: 'include'
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (!data.loggedIn) {
                        console.log('🔒 Server session expired globally');
                        forceGlobalLogout();
                        return;
                    }
                }
            } catch (error) {
                console.error('❌ Error checking server session globally:', error);
            }
            
            console.log(`✅ Global session valid (${Math.floor((timeoutMs - sessionAge) / 1000)}s remaining)`);
            
        } catch (error) {
            console.error('❌ Error during global session check:', error);
        }
    }, 30000); // 30 seconds
    
    console.log('🔄 Global periodic session check started (every 30 seconds)');
}

// Force global logout
function forceGlobalLogout() {
    console.log('🔒 Force logging out globally due to session timeout');
    
    // Clear ALL localStorage data
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userData');
    localStorage.removeItem('userToken');
    localStorage.removeItem('authToken');
    localStorage.removeItem('zippyCart');
    localStorage.removeItem('sessionStartTime');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('lastLoginTime');
    
    // Clear any other potential auth data
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('user') || key.includes('auth') || key.includes('token') || key.includes('session'))) {
            localStorage.removeItem(key);
        }
    }
    
    // Reset global state
    window.isLoggedIn = false;
    window.currentUser = null;
    
    // Force server logout
    fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
    }).catch(error => {
        console.log('Server logout request failed:', error);
    });
    
    // Update UI globally
    if (typeof window.updateAuthUI === 'function') {
        window.updateAuthUI();
    }
    
    // Show notification
    if (typeof window.showNotification === 'function') {
        window.showNotification('Session expired. Please log in again.', 'warning');
    } else {
        // Fallback notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255,193,7,0.9);
            color: #000;
            padding: 15px 20px;
            border-radius: 8px;
            border: 2px solid #ffc107;
            z-index: 999999;
            font-weight: 600;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        `;
        notification.textContent = 'Session expired. Please log in again.';
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }
    
    // Force page reload to ensure complete logout
    setTimeout(() => {
        console.log('🔄 Reloading page to ensure complete logout...');
        window.location.reload();
    }, 2000);
}

// Update session start time when user logs in
function updateSessionStartTime() {
    localStorage.setItem('sessionStartTime', Date.now().toString());
    console.log('⏰ Session start time updated');
}

// Try to open auth modal function
function tryOpenAuth() {
    console.log('🔐 tryOpenAuth called');
    const savedUser = localStorage.getItem('currentUser');
    if (!savedUser) {
        console.log('🔐 No user found, opening auth modal');
        openAuthModal();
    } else {
        console.log('🔐 User already logged in');
    }
}

// Make functions globally available
window.tryOpenAuth = tryOpenAuth;
window.closeAuthModal = closeAuthModal;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.updateAuthUI = updateAuthUI;
window.checkUserLogin = checkUserLogin;
window.handleLogout = handleLogout;
window.initGlobalSessionTimeout = initGlobalSessionTimeout;
window.forceGlobalLogout = forceGlobalLogout;
window.updateSessionStartTime = updateSessionStartTime;

console.log('✅ Auth script loaded successfully');