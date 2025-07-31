// Simple Authentication System
if (!window.currentUser) {
    window.currentUser = null;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Auth system initializing...');
    initAuth();
    updateAuthUI();
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
        
        if (response.ok && data.user) {
            window.currentUser = data.user;
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            
            const displayName = data.user.profile?.displayName || data.user.username;
            alert(`Login successful! Welcome back, ${displayName}`);
            
            closeAuthModal();
            updateAuthUI();
            
        } else {
            throw new Error(data.error || 'Login failed');
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
    console.log('Updating auth UI...');
    const authBtn = document.getElementById('authBtn');
    
    if (!authBtn) {
        console.log('Auth button not found, skipping UI update');
        return;
    }
    
    const savedUser = localStorage.getItem('currentUser');
    console.log('Saved user:', savedUser ? 'exists' : 'none');
    
    if (savedUser) {
        try {
            const user = JSON.parse(savedUser);
            console.log('Parsed user:', user);
            
            const displayName = user.profile?.displayName || user.username || 'User';
            console.log('Display name:', displayName);
            
            authBtn.innerHTML = `
                <span class="user-name">${displayName}</span>
                <span class="logout-text">Logout</span>
            `;
            authBtn.classList.add('logged-in');
            console.log('Updated auth button for logged-in user');
            
        } catch (error) {
            console.error('Error parsing saved user:', error);
            localStorage.removeItem('currentUser');
            authBtn.innerHTML = 'Login';
            authBtn.classList.remove('logged-in');
        }
    } else {
        console.log('No saved user, showing login state');
        authBtn.innerHTML = 'Login';
        authBtn.classList.remove('logged-in');
    }
    
    console.log('Auth UI update complete');
}

// Make functions globally available
window.updateAuthUI = updateAuthUI;
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;