// Simple and clean solution for user menu - Project requirement: menu should include logout button
// No conflicts with existing code

(function() {
    'use strict';
    
    // Click counter for testing
    let clickCount = 0;
    let isInitialized = false;
    
    // Immediate button state update without delay
    function setInitialButtonState() {
        if (isInitialized) return; // Prevent multiple initializations
        
        console.log('⚡ Setting initial button state immediately...');
        
        // Immediate check of login status (same place as initUserMenu)
        const savedUser = localStorage.getItem('currentUser');
        let isLoggedIn = false;
        let username = '';
        
        if (savedUser) {
            try {
                const user = JSON.parse(savedUser);
                isLoggedIn = true;
                username = user.profile?.displayName || user.username || 'User';
                console.log('⚡ Found user data immediately:', { isLoggedIn, username });
            } catch (e) {
                console.log('❌ Error parsing user data:', e);
            }
        }
        
        // Immediate button update if it exists
        const authBtn = document.getElementById('authBtn');
        const userMenu = document.getElementById('userMenu');
        const usernameDisplay = document.getElementById('usernameDisplay');
        
        if (isLoggedIn && username) {
            // User logged in - show username immediately
            if (authBtn) authBtn.style.display = 'none';
            if (userMenu) userMenu.style.display = 'inline-block';
            if (usernameDisplay) usernameDisplay.textContent = username;
            console.log('⚡ Set button to username immediately:', username);
        } else {
            // User not logged in - show LOGIN immediately
            if (authBtn) authBtn.style.display = 'inline-block';
            if (userMenu) userMenu.style.display = 'none';
            console.log('⚡ Set button to LOGIN immediately');
        }
        
        isInitialized = true;
    }
    
    // Immediate call to update button state
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setInitialButtonState);
    } else {
        setInitialButtonState();
    }
    
    // Wait for page load and all other scripts
    document.addEventListener('DOMContentLoaded', function() {
        // Block auth.js from interfering with user menu
        window.blockGlobalUserMenu = true;
        
        // No delay - all initialization already happened
        initUserMenu();
        
        // Call auth functions after page loads (only once)
        setTimeout(() => {
            if (typeof forceUpdateAuthButton === 'function' && !window.authButtonUpdated) {
                console.log('🔧 Calling forceUpdateAuthButton from simple-user-menu.js...');
                forceUpdateAuthButton();
                window.authButtonUpdated = true;
            }
            if (typeof checkSessionStatus === 'function' && !window.sessionChecked) {
                console.log('🔍 Calling checkSessionStatus from simple-user-menu.js...');
                checkSessionStatus();
                window.sessionChecked = true;
            }
        }, 1000);
        
        // Listen for session timeout events
        window.addEventListener('sessionTimeout', function() {
            console.log('🔄 Session timeout detected, updating UI...');
            // Force update the button state
            const savedUser = localStorage.getItem('currentUser');
            if (!savedUser) {
                const authBtn = document.getElementById('authBtn');
                const userMenu = document.getElementById('userMenu');
                
                if (authBtn && userMenu) {
                    authBtn.style.display = 'inline-block';
                    userMenu.style.display = 'none';
                } else if (authBtn) {
                    authBtn.textContent = 'LOGIN';
                    authBtn.onclick = function() {
                        if (typeof openAuthModal === 'function') {
                            openAuthModal();
                        }
                    };
                }
            }
        });
        
        // Setup admin access checks (only once)
        setTimeout(() => {
            if (!window.adminChecksSetup) {
                setupAdminAccessChecks();
                window.adminChecksSetup = true;
            }
        }, 2000);
    });
    
    function initUserMenu() {
        console.log('🚀 Initializing simple user menu...');
        
        // Cancel all existing event listeners on the button to prevent conflicts
        const existingToggle = document.getElementById('userMenuToggle');
        if (existingToggle) {
            // Clone the button to remove all existing listeners
            const newToggle = existingToggle.cloneNode(true);
            existingToggle.parentNode.replaceChild(newToggle, existingToggle);
            console.log('🔄 Cleared all existing event listeners from user menu toggle');
        }
        
        const authBtn = document.getElementById('authBtn');
        const userMenu = document.getElementById('userMenu'); 
        const userMenuToggle = document.getElementById('userMenuToggle');
        const userDropdown = document.getElementById('userDropdown');
        const usernameDisplay = document.getElementById('usernameDisplay');
        
        // Check if user is logged in
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
        }
        
        // Set display based on state
        if (isLoggedIn) {
            // User logged in - show user menu
            authBtn.style.display = 'none';
            userMenu.style.display = 'block';
            usernameDisplay.textContent = username;
            
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
            
            // Add click handler to the user menu button with high priority
            userMenuToggle.addEventListener('click', function(e) {
                clickCount++;
                console.log(`🔢 CLICK COUNT: ${clickCount}`);
                console.log('🎯 Simple user menu click handler triggered');
                console.log('📍 Event details:', {
                    type: e.type,
                    target: e.target.id,
                    phase: e.eventPhase,
                    bubbles: e.bubbles
                });
                
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation(); // Prevent other listeners from running
                
                toggleDropdown();
            }, true); // capture phase - runs before others
            
            console.log('✅ User menu setup completed');
        } else {
            // User not logged in - show LOGIN
            authBtn.style.display = 'inline-block';
            userMenu.style.display = 'none';
            console.log('✅ Login button setup completed');
        }
        
        // Close dropdown on outside click
        document.addEventListener('click', function(e) {
            if (userDropdown && !userMenu.contains(e.target)) {
                userDropdown.style.display = 'none';
            }
        });
        
        // Update dropdown position on window resize
        window.addEventListener('resize', function() {
            const userDropdown = document.getElementById('userDropdown');
            if (userDropdown && getComputedStyle(userDropdown).display === 'block') {
                positionDropdownBelowButton();
                console.log('📱 Repositioned dropdown on window resize');
            }
        });
        
        // Update dropdown position on scroll
        window.addEventListener('scroll', function() {
            const userDropdown = document.getElementById('userDropdown');
            if (userDropdown && getComputedStyle(userDropdown).display === 'block') {
                positionDropdownBelowButton();
            }
        });
    }
    
    function positionDropdownBelowButton() {
        const userMenuToggle = document.getElementById('userMenuToggle');
        const userDropdown = document.getElementById('userDropdown');
        
        if (userMenuToggle && userDropdown) {
            const buttonRect = userMenuToggle.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
            
            // Calculate position below the button
            const top = buttonRect.bottom + scrollTop + 5; // 5px spacing
            const left = buttonRect.right + scrollLeft - 220; // Align to the right of the button
            
            console.log('📍 Positioning dropdown:', {
                buttonRect: buttonRect,
                calculatedTop: top,
                calculatedLeft: left,
                scrollTop: scrollTop,
                scrollLeft: scrollLeft
            });
            
            // Update dropdown position
            userDropdown.style.setProperty('position', 'absolute', 'important');
            userDropdown.style.setProperty('top', top + 'px', 'important');
            userDropdown.style.setProperty('left', left + 'px', 'important');
            userDropdown.style.setProperty('right', 'auto', 'important');
        }
    }

    function toggleDropdown() {
        const userDropdown = document.getElementById('userDropdown');
        
        console.log('🔄 toggleDropdown called');
        console.log('📋 Dropdown element:', userDropdown);
        
        if (userDropdown) {
            const currentDisplay = userDropdown.style.display;
            const currentVisibility = getComputedStyle(userDropdown).visibility;
            const currentOpacity = getComputedStyle(userDropdown).opacity;
            
            console.log('📊 Current state:', {
                display: currentDisplay,
                visibility: currentVisibility,
                opacity: currentOpacity,
                computedDisplay: getComputedStyle(userDropdown).display
            });
            
            // Use computedDisplay instead of style.display as CSS might override
            const computedDisplay = getComputedStyle(userDropdown).display;
            const isVisible = computedDisplay === 'block';
            
            if (isVisible) {
                userDropdown.style.setProperty('display', 'none', 'important');
                console.log('🔒 Dropdown closed - set display: none !important');
            } else {
                // Position the dropdown below the button
                positionDropdownBelowButton();
                
                // Open the dropdown
                userDropdown.style.setProperty('display', 'block', 'important');
                userDropdown.style.setProperty('visibility', 'visible', 'important');
                userDropdown.style.setProperty('opacity', '1', 'important');
                userDropdown.style.setProperty('z-index', '999999', 'important');
                console.log('🔓 Dropdown opened and positioned below button');
            }
            
            // Check after the change
            setTimeout(() => {
                console.log('📊 State after change:', {
                    display: userDropdown.style.display,
                    visibility: getComputedStyle(userDropdown).visibility,
                    opacity: getComputedStyle(userDropdown).opacity,
                    computedDisplay: getComputedStyle(userDropdown).display,
                    position: userDropdown.style.position,
                    top: userDropdown.style.top,
                    left: userDropdown.style.left
                });
            }, 10);
        } else {
            console.log('❌ Dropdown element not found!');
        }
    }
    
    // Update menu after login/logout
    window.updateUserMenu = function() {
        console.log('🔄 Updating user menu...');
        initUserMenu();
    };
    
    // Block global.js from handling the user button
    window.blockGlobalUserMenu = true;
    
})();