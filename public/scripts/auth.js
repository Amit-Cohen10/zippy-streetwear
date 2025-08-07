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
    console.log('🔐 Setting up auth components...');
    
    const authBtn = document.getElementById('authBtn');
    const authModal = document.getElementById('authModal');
    const closeAuth = document.getElementById('closeAuth');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authTabs = document.querySelectorAll('.auth-tab');
    
    console.log('🔍 Found elements:', {
        authBtn: !!authBtn,
        authModal: !!authModal,
        closeAuth: !!closeAuth,
        loginForm: !!loginForm,
        registerForm: !!registerForm,
        authTabs: authTabs.length
    });
    
    if (!authBtn) {
        console.error('❌ Auth button not found!');
        return;
    }
    
    // Auth button click handler
    if (authBtn) {
        authBtn.onclick = function() {
            console.log('🔘 Auth button clicked');
            const savedUser = localStorage.getItem('currentUser');
            if (!savedUser) {
                console.log('👤 No saved user, opening login modal');
                openAuthModal();
            } else {
                console.log('👤 User is logged in, handling logout');
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
                console.log('🔄 Switching to tab:', targetTab);
                
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
        console.log('✅ Login form event listener added');
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
        console.log('✅ Register form event listener added');
    }
    
    console.log('✅ Auth initialization complete');
    
    // Update UI based on current login status
    updateAuthUI();
}

function openAuthModal() {
    console.log('🔐 Opening auth modal...');
    const authModal = document.getElementById('authModal');
    
    console.log('🔍 Auth modal element:', !!authModal);
    
    if (authModal) {
        console.log('✅ Auth modal found, displaying...');
        authModal.style.display = 'flex';
        authModal.classList.add('active');
        
        // Scroll to top
        window.scrollTo(0, 0);
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        console.log('✅ Auth modal opened successfully');
    } else {
        console.log('❌ Auth modal not found!');
    }
}

function closeAuthModal() {
    console.log('🔐 Closing auth modal...');
    const authModal = document.getElementById('authModal');
    
    console.log('🔍 Auth modal element:', !!authModal);
    
    if (authModal) {
        console.log('✅ Auth modal found, hiding...');
        authModal.style.display = 'none';
        authModal.classList.remove('active');
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        console.log('✅ Auth modal closed successfully');
    } else {
        console.log('❌ Auth modal not found for closing!');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    console.log('🔐 Handling login...');
    
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
            
            // Check if user is admin and show/hide admin activity link
            const isAdmin = data.user.role === 'admin';
            const adminActivityLink = document.getElementById('adminActivityLink');
            if (adminActivityLink) {
                if (isAdmin) {
                    adminActivityLink.style.display = 'block !important';
                    console.log('✅ Admin activity link shown after login');
                } else {
                    adminActivityLink.style.display = 'none !important';
                    console.log('✅ Admin activity link hidden after login');
                }
            }
            
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
    console.log('🔐 Handling registration...');
    
    const formData = new FormData(e.target);
    const username = formData.get('username');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    console.log('📝 Registration data:', { username, email, password: '***', confirmPassword: '***' });
    
    if (password !== confirmPassword) {
        console.log('❌ Passwords do not match');
        alert('Passwords do not match');
        return;
    }
    
    if (password.length < 6) {
        console.log('❌ Password too short');
        alert('Password must be at least 6 characters');
        return;
    }
    
    try {
        console.log('🔄 Sending registration request...');
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
        console.log('📥 Registration response:', data);
        
        if (response.ok && data.user) {
            console.log('✅ Registration successful');
            window.currentUser = data.user;
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            
            const displayName = data.user.profile?.displayName || data.user.username;
            alert(`Registration successful! Welcome to Zippy, ${displayName}`);
            
            closeAuthModal();
            updateAuthUI();
            
            // Check if user is admin and show/hide admin activity link
            const isAdmin = data.user.role === 'admin';
            const adminActivityLink = document.getElementById('adminActivityLink');
            if (adminActivityLink) {
                if (isAdmin) {
                    adminActivityLink.style.display = 'block !important';
                    console.log('✅ Admin activity link shown after registration');
                } else {
                    adminActivityLink.style.display = 'none !important';
                    console.log('✅ Admin activity link hidden after registration');
                }
            }
            
            // Show success message
            showNotification('Registration successful!', 'success');
            
            // Refresh the page to ensure UI is properly updated
            setTimeout(() => {
                window.location.reload();
            }, 500);
            
        } else {
            console.log('❌ Registration failed:', data.error);
            throw new Error(data.error || 'Registration failed');
        }
        
    } catch (error) {
        console.error('❌ Registration error:', error);
        alert(error.message);
    }
}

async function handleLogout() {
    console.log('🔐 Handling logout...');
    
    try {
        console.log('🔄 Sending logout request to server...');
        await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        
        console.log('✅ Server logout successful');
        
        currentUser = null;
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userData');
        localStorage.removeItem('userToken');
        
        console.log('🗑️ Cleared localStorage data');
        
        // Hide admin activity link
        const adminActivityLink = document.getElementById('adminActivityLink');
        if (adminActivityLink) {
            adminActivityLink.style.display = 'none !important';
            console.log('✅ Admin activity link hidden after logout');
        }
        
        alert('Logged out successfully');
        updateAuthUI();
        
    } catch (error) {
        console.error('❌ Logout error:', error);
        alert('Error during logout');
    }
}

function updateAuthUI() {
    // אם הסקריפט החדש פועל, אל תפריע לו
    if (window.blockGlobalUserMenu) {
        console.log('🚫 Auth UI update blocked by simple-user-menu.js');
        // אבל עדיין ננסה לעדכן את הכפתור אם הוא לא מעודכן
        if (!window.authButtonUpdated) {
            forceUpdateAuthButton();
            window.authButtonUpdated = true;
        }
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
                
                // Check if user is admin and show/hide admin activity link
                const isAdmin = user.role === 'admin';
                const adminActivityLink = document.getElementById('adminActivityLink');
                if (adminActivityLink) {
                    if (isAdmin) {
                        adminActivityLink.style.display = 'block !important';
                        console.log('✅ Admin activity link shown in updateAuthUI');
                    } else {
                        adminActivityLink.style.display = 'none !important';
                        console.log('✅ Admin activity link hidden in updateAuthUI');
                    }
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
            
            // Reset global login status
            window.isLoggedIn = false;
            window.currentUser = null;
            
            console.log('✅ Updated auth UI for logged-out user');
        }
    } else {
        console.log('👤 No saved user, showing login button');
        
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
        
        // Reset global login status
        window.isLoggedIn = false;
        window.currentUser = null;
        
        console.log('✅ Updated auth UI for logged-out user');
    }
}

// Force update auth button even when simple-user-menu.js is active
function forceUpdateAuthButton() {
    console.log('🔧 Force updating auth button...');
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
        console.log('❌ Auth button not found for force update');
        return;
    }
    
    const savedUser = localStorage.getItem('currentUser');
    console.log('👤 Saved user for force update:', savedUser ? 'exists' : 'none');
    
    if (savedUser) {
        try {
            const user = JSON.parse(savedUser);
            const displayName = user.profile?.displayName || user.username || 'User';
            console.log('✅ Parsed user for force update:', displayName);
            
            // Update button to show user is logged in
            if (authBtn && userMenu) {
                authBtn.style.display = 'none';
                userMenu.style.display = 'inline-block';
                
                const usernameDisplay = document.getElementById('usernameDisplay');
                if (usernameDisplay) {
                    usernameDisplay.textContent = displayName;
                }
                console.log('✅ Updated userMenu to show logged-in user');
            } else if (authBtn) {
                authBtn.textContent = displayName;
                authBtn.onclick = function() {
                    if (confirm('Do you want to logout?')) {
                        handleLogout();
                    }
                };
                console.log('✅ Updated authBtn to show logged-in user');
            }
            
            console.log('✅ Force updated auth button for logged-in user');
        } catch (error) {
            console.error('❌ Error parsing user data in force update:', error);
            localStorage.removeItem('currentUser');
            forceUpdateAuthButton(); // Recursive call to handle logout
        }
    } else {
        // User is not logged in
        console.log('👤 No user data, updating for logged-out state');
        
        if (authBtn && userMenu) {
            authBtn.style.display = 'inline-block';
            userMenu.style.display = 'none';
            console.log('✅ Updated UI to show login button');
        } else if (authBtn) {
            authBtn.textContent = 'LOGIN';
            authBtn.onclick = function() {
                console.log('🔐 Login button clicked in force update');
                openAuthModal();
            };
            console.log('✅ Updated authBtn to show LOGIN');
        }
        
        console.log('✅ Force updated auth button for logged-out user');
    }
}

// Make functions globally available
window.updateAuthUI = updateAuthUI;
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;

// Add user menu functionality (copied and adapted from simple-user-menu.js)
function positionDropdownBelowButton() {
    console.log('📍 Positioning dropdown below button...');
    const userMenuToggle = document.getElementById('userMenuToggle');
    const userDropdown = document.getElementById('userDropdown');
    
    console.log('🔍 Found elements:', { userMenuToggle: !!userMenuToggle, userDropdown: !!userDropdown });
    
    if (userMenuToggle && userDropdown) {
        const buttonRect = userMenuToggle.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        const top = buttonRect.bottom + scrollTop + 5;
        const left = buttonRect.right + scrollLeft - 220;
        
        console.log('📊 Positioning data:', { 
            buttonRect: { bottom: buttonRect.bottom, right: buttonRect.right },
            scrollTop, scrollLeft, top, left 
        });
        
        userDropdown.style.setProperty('position', 'absolute', 'important');
        userDropdown.style.setProperty('top', top + 'px', 'important');
        userDropdown.style.setProperty('left', left + 'px', 'important');
        userDropdown.style.setProperty('right', 'auto', 'important');
        
        console.log('✅ Dropdown positioned successfully');
    } else {
        console.log('❌ Missing elements for dropdown positioning');
    }
}

function toggleDropdown() {
    console.log('🔄 Auth.js toggleDropdown called');
    const userDropdown = document.getElementById('userDropdown');
    
    console.log('🔍 User dropdown element:', !!userDropdown);
    
    if (userDropdown) {
        const computedDisplay = getComputedStyle(userDropdown).display;
        const isVisible = computedDisplay === 'block';
        
        console.log('📊 Current dropdown state:', { computedDisplay, isVisible });
        
        if (isVisible) {
            userDropdown.style.setProperty('display', 'none', 'important');
            console.log('🔒 Auth.js dropdown closed');
        } else {
            console.log('🔓 Opening dropdown...');
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
    
    console.log('🔍 Setting up user menu elements...');
    
    // Remove all event listeners from the toggle to prevent conflicts
    const existingToggle = document.getElementById('userMenuToggle');
    if (existingToggle) {
        const newToggle = existingToggle.cloneNode(true);
        existingToggle.parentNode.replaceChild(newToggle, existingToggle);
        console.log('🔄 Replaced user menu toggle to clear event listeners');
    }
    
    const authBtn = document.getElementById('authBtn');
    const userMenu = document.getElementById('userMenu');
    const userMenuToggle = document.getElementById('userMenuToggle');
    const userDropdown = document.getElementById('userDropdown');
    const usernameDisplay = document.getElementById('usernameDisplay');
    
    console.log('🔍 Found user menu elements:', {
        authBtn: !!authBtn,
        userMenu: !!userMenu,
        userMenuToggle: !!userMenuToggle,
        userDropdown: !!userDropdown,
        usernameDisplay: !!usernameDisplay
    });
    
    // Check login state
    const savedUser = localStorage.getItem('currentUser');
    let isLoggedIn = false;
    let username = '';
    let isAdmin = false;
    
    if (savedUser) {
        try {
            const user = JSON.parse(savedUser);
            isLoggedIn = true;
            username = user.profile?.displayName || user.username || 'User';
            isAdmin = user.role === 'admin';
            console.log('✅ User is logged in:', username, 'Admin:', isAdmin);
        } catch (e) {
            console.log('❌ Error parsing user data');
            localStorage.removeItem('currentUser');
        }
    } else {
        console.log('👤 No user data found');
    }
    
    // Set display according to state
    if (isLoggedIn) {
        console.log('🎯 Setting up logged-in user menu...');
        if (authBtn) authBtn.style.display = 'none';
        if (userMenu) userMenu.style.display = 'block';
        if (usernameDisplay) usernameDisplay.textContent = username;
        
        // Show/hide admin activity link based on user role
        const adminActivityLink = document.getElementById('adminActivityLink');
        if (adminActivityLink) {
            if (isAdmin) {
                adminActivityLink.style.display = 'block !important';
                console.log('✅ Admin activity link shown');
            } else {
                adminActivityLink.style.display = 'none !important';
                console.log('✅ Admin activity link hidden');
            }
        }
        
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
        console.log('🎯 Setting up login button...');
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
    
    console.log('✅ User menu initialization complete');
}

document.addEventListener('DOMContentLoaded', function() {
    initUserMenu();
    
    // Setup admin access checks
    setTimeout(() => {
        setupAdminAccessChecks();
    }, 1000);
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
        console.log('🔄 Cleared existing global session check interval');
    }
    
    // Start global periodic check (every 30 seconds)
    globalSessionCheckInterval = setInterval(async () => {
        console.log('🔄 Global session check running...');
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
            
            console.log(`⏰ Session age: ${Math.floor(sessionAge / 1000)}s, timeout: ${Math.floor(timeoutMs / 1000)}s`);
            
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
    console.log('📍 Current page:', window.location.pathname);
    
    // Clear ALL localStorage data
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userData');
    localStorage.removeItem('userToken');
    localStorage.removeItem('authToken');
    localStorage.removeItem('zippyCart');
    localStorage.removeItem('sessionStartTime');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('lastLoginTime');
    
    console.log('🗑️ Cleared all localStorage data');
    
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
    
    console.log('🔄 Reset global state');
    
    // Force server logout
    fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
    }).catch(error => {
        console.log('Server logout request failed:', error);
    });
    
    // Update UI globally - force update even if simple-user-menu.js is active
    console.log('🎨 Updating UI...');
    forceUpdateAuthButton();
    
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
    
    // Check if we're on a protected page and need to show login modal
    const currentPath = window.location.pathname;
    const protectedPages = ['/style-guide', '/exchange', '/community', '/fitting-room', '/admin'];
    const isOnProtectedPage = protectedPages.some(page => currentPath.includes(page));
    
    console.log('🔍 Protected page check:', { currentPath, isOnProtectedPage });
    
    // Trigger session timeout event for other scripts
    window.dispatchEvent(new CustomEvent('sessionTimeout'));
    
    if (isOnProtectedPage) {
        console.log('🔐 On protected page, opening auth modal after session timeout');
        // Wait a bit for UI to update, then open modal
        setTimeout(() => {
            if (typeof openAuthModal === 'function') {
                console.log('✅ Opening auth modal...');
                openAuthModal();
            } else {
                console.log('❌ openAuthModal function not available');
            }
        }, 1000);
    }
    
    // Force page reload to ensure complete logout (only if not on protected page)
    if (!isOnProtectedPage) {
        setTimeout(() => {
            console.log('🔄 Reloading page to ensure complete logout...');
            window.location.reload();
        }, 2000);
    }
}

// Update session start time when user logs in
function updateSessionStartTime() {
    const now = Date.now();
    localStorage.setItem('sessionStartTime', now.toString());
    console.log('⏰ Session start time updated:', new Date(now).toLocaleString());
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

// Check if user is logged in
function checkUserLogin() {
    console.log('🔍 checkUserLogin called');
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            const user = JSON.parse(savedUser);
            console.log('✅ User found:', user.username || 'User');
            return user;
        } catch (e) {
            console.log('❌ Error parsing user data');
            localStorage.removeItem('currentUser');
            return null;
        }
    } else {
        console.log('❌ No user data found');
        return null;
    }
}

// Enhanced session check function
function checkSessionStatus() {
    console.log('🔍 Checking session status...');
    
    const savedUser = localStorage.getItem('currentUser');
    if (!savedUser) {
        console.log('❌ No user data found');
        forceUpdateAuthButton();
        return false;
    }
    
    try {
        const user = JSON.parse(savedUser);
        const rememberMe = user.rememberMe || false;
        const timeoutMs = rememberMe ? 12 * 24 * 60 * 60 * 1000 : 30 * 60 * 1000;
        
        // Get session start time
        const sessionStartStr = localStorage.getItem('sessionStartTime');
        const sessionStartTime = sessionStartStr ? parseInt(sessionStartStr) : Date.now();
        
        // Check if session has expired
        const currentTime = Date.now();
        const sessionAge = currentTime - sessionStartTime;
        
        console.log(`⏰ Session check - Age: ${Math.floor(sessionAge / 1000)}s, Timeout: ${Math.floor(timeoutMs / 1000)}s, RememberMe: ${rememberMe}`);
        
        if (sessionAge >= timeoutMs) {
            console.log('⏰ Session expired, logging out...');
            forceGlobalLogout();
            return false;
        }
        
        console.log(`✅ Session valid (${Math.floor((timeoutMs - sessionAge) / 1000)}s remaining)`);
        return true;
        
    } catch (error) {
        console.error('❌ Error checking session status:', error);
        localStorage.removeItem('currentUser');
        forceUpdateAuthButton();
        return false;
    }
}

// Make functions globally available
window.tryOpenAuth = tryOpenAuth;
window.closeAuthModal = closeAuthModal;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.updateAuthUI = updateAuthUI;
window.forceUpdateAuthButton = forceUpdateAuthButton;
window.checkUserLogin = checkUserLogin;
window.handleLogout = handleLogout;
window.initGlobalSessionTimeout = initGlobalSessionTimeout;
window.forceGlobalLogout = forceGlobalLogout;
window.updateSessionStartTime = updateSessionStartTime;
window.checkSessionStatus = checkSessionStatus;
window.openAuthModal = openAuthModal;
window.checkAdminAccess = checkAdminAccess;
window.setupAdminAccessChecks = setupAdminAccessChecks;

console.log('✅ Auth script loaded successfully');

// Check admin access and show message if not admin
function checkAdminAccess(event) {
    console.log('🔐 Checking admin access...');
    
    const savedUser = localStorage.getItem('currentUser');
    if (!savedUser) {
        console.log('❌ No user logged in');
        event.preventDefault();
        showNotification('You need to be logged in to access admin features.', 'warning');
        return false;
    }
    
    try {
        const user = JSON.parse(savedUser);
        const isAdmin = user.role === 'admin';
        
        console.log('👤 User role check:', { username: user.username, role: user.role, isAdmin });
        
        if (!isAdmin) {
            console.log('❌ User is not admin');
            event.preventDefault();
            showNotification('You do not have permission to access admin features. Admin privileges required.', 'error');
            return false;
        }
        
        console.log('✅ User is admin, allowing access');
        return true;
        
    } catch (error) {
        console.error('❌ Error checking admin access:', error);
        event.preventDefault();
        showNotification('Error checking admin access. Please try again.', 'error');
        return false;
    }
}

// Add admin access check to all admin activity links
function setupAdminAccessChecks() {
    // Prevent multiple setups
    if (window.adminChecksSetup) {
        console.log('🚫 Admin checks already setup, skipping...');
        return;
    }
    
    console.log('🔐 Setting up admin access checks...');
    
    // Find all admin links
    const adminLinks = document.querySelectorAll('a[href*="/admin"]');
    console.log('🔍 Found admin links:', adminLinks.length);
    
    adminLinks.forEach((link, index) => {
        console.log(`🔗 Admin link ${index + 1}:`, { href: link.href, text: link.textContent, id: link.id });
        
        // Add click event listener
        link.addEventListener('click', function(e) {
            const savedUser = localStorage.getItem('currentUser');
            if (!savedUser) {
                e.preventDefault();
                alert('Please login to access admin features');
                return;
            }
            
            try {
                const user = JSON.parse(savedUser);
                if (user.role !== 'admin') {
                    e.preventDefault();
                    alert('Admin access required');
                    return;
                }
            } catch (error) {
                e.preventDefault();
                alert('Invalid user session');
                return;
            }
        });
        
        console.log(`✅ Added admin access check to link ${index + 1}`);
    });
    
    // Also check for admin links in dropdown menus
    const dropdowns = document.querySelectorAll('.dropdown-menu a');
    dropdowns.forEach((link, index) => {
        if (link.textContent.includes('Admin') || link.href.includes('/admin')) {
            console.log(`🔗 Found admin activity link in dropdown ${index + 1}:`, link.textContent);
            
            link.addEventListener('click', function(e) {
                const savedUser = localStorage.getItem('currentUser');
                if (!savedUser) {
                    e.preventDefault();
                    alert('Please login to access admin features');
                    return;
                }
                
                try {
                    const user = JSON.parse(savedUser);
                    if (user.role !== 'admin') {
                        e.preventDefault();
                        alert('Admin access required');
                        return;
                    }
                } catch (error) {
                    e.preventDefault();
                    alert('Invalid user session');
                    return;
                }
            });
            
            console.log(`✅ Added admin access check to dropdown link ${index + 1}`);
        }
    });
    
    console.log('✅ Admin access checks setup complete');
    window.adminChecksSetup = true;
}