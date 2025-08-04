// Admin panel functionality
let activityData = [];
let userData = [];

document.addEventListener('DOMContentLoaded', function() {
    initAdmin();
});

function initAdmin() {
    try {
        // Check if user is admin
        checkAdminAccess();
        
        // Load all data automatically
        loadAllData();
        
        console.log('Admin panel initialized successfully');
    } catch (error) {
        console.error('Failed to initialize admin panel:', error);
        showError('Failed to initialize admin panel');
    }
}

async function checkAdminAccess() {
    try {
        const response = await fetch('/api/admin/check', {
            credentials: 'include'
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                showError('Please log in as admin');
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
                return;
            }
            if (response.status === 403) {
                showError('Admin access required');
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
                return;
            }
            throw new Error('Failed to verify admin access');
        }
        
        const result = await response.json();
        console.log('Admin access verified:', result);
        
    } catch (error) {
        console.error('Admin access check failed:', error);
        showError('Failed to verify admin access');
    }
}

async function loadAllData() {
    try {
        // Show loading state for all tables
        const activityTableBody = document.getElementById('activityTableBody');
        const userTableBody = document.getElementById('userTableBody');
        
        if (activityTableBody) {
            activityTableBody.innerHTML = '<tr><td colspan="3" class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading activities...</td></tr>';
        }
        if (userTableBody) {
            userTableBody.innerHTML = '<tr><td colspan="4" class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading users...</td></tr>';
        }
        
        // Load all data in parallel
        await Promise.all([
            loadActivityData(),
            loadUserData(),
            loadStatistics()
        ]);
        
    } catch (error) {
        console.error('Failed to load data:', error);
        showError('Failed to load data');
    }
}

async function loadActivityData() {
    try {
        // Show loading state
        const tableBody = document.getElementById('activityTableBody');
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="3" class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading activities...</td></tr>';
        }
        
        const response = await fetch('/api/admin/activity', {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Failed to load activity data');
        }
        
        const data = await response.json();
        activityData = data.activities || data;
        displayActivityTable(activityData);
        
    } catch (error) {
        console.error('Failed to load activity data:', error);
        showError('Failed to load activity data');
    }
}

function displayActivityTable(activities) {
    const tableBody = document.getElementById('activityTableBody');
    if (!tableBody) return;
    
    if (!activities || activities.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="3" class="no-data">No activity data available</td></tr>';
        return;
    }
    
    const html = activities.map(activity => {
        const username = activity.user?.username || activity.details?.username || 'Unknown User';
        const action = activity.action;
        const timestamp = new Date(activity.timestamp).toLocaleString();
        
        return `
            <tr>
                <td>${timestamp}</td>
                <td>${username}</td>
                <td><span class="activity-type ${action}">${formatActivityAction(action)}</span></td>
            </tr>
        `;
    }).join('');
    
    tableBody.innerHTML = html;
}

async function loadUserData() {
    try {
        // Show loading state
        const tableBody = document.getElementById('userTableBody');
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="4" class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading users...</td></tr>';
        }
        
        const response = await fetch('/api/admin/users', {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Failed to load user data');
        }
        
        const data = await response.json();
        userData = data.users || data; // Handle both array and object with users property
        displayUserTable(userData);
        
    } catch (error) {
        console.error('Failed to load user data:', error);
        showError('Failed to load user data');
    }
}

function displayUserTable(users) {
    const tableBody = document.getElementById('userTableBody');
    if (!tableBody) return;
    
    if (!users || users.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" class="no-data">No users found</td></tr>';
        return;
    }
    
    const html = users.map(user => {
        const joinDate = new Date(user.profile?.joinDate || user.createdAt || Date.now()).toLocaleDateString();
        
        return `
            <tr>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td><span class="user-role ${user.role}">${user.role}</span></td>
                <td>${joinDate}</td>
            </tr>
        `;
    }).join('');
    
    tableBody.innerHTML = html;
}

async function loadStatistics() {
    try {
        const response = await fetch('/api/admin/stats', {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Failed to load statistics');
        }
        
        const stats = await response.json();
        
        // Update statistics display
        document.getElementById('totalUsers').textContent = stats.totalUsers || 0;
        document.getElementById('totalActivities').textContent = stats.totalActivities || 0;
        document.getElementById('totalOrders').textContent = stats.totalOrders || 0;
        document.getElementById('totalRevenue').textContent = `$${stats.totalRevenue || '0.00'}`;
        
    } catch (error) {
        console.error('Failed to load statistics:', error);
        showError('Failed to load statistics');
    }
}

// Utility functions
function formatActivityAction(action) {
    const actionMap = {
        'login': 'Login',
        'logout': 'Logout',
        'register': 'Register',
        'cart_add': 'Add to Cart',
        'cart_remove': 'Remove from Cart',
        'cart_clear': 'Clear Cart',
        'order_placed': 'Order Placed',
        'exchange_create': 'Exchange Created',
        'product_create': 'Product Created'
    };
    
    return actionMap[action] || action;
}

function showError(message) {
    console.error(message);
    
    // Create a toast notification instead of alert
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(220, 53, 69, 0.9);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        border: 2px solid #dc3545;
        z-index: 999999;
        font-weight: 600;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        max-width: 400px;
        word-wrap: break-word;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Remove toast after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 5000);
}

function showSuccess(message) {
    console.log(message);
    
    // Create a success toast notification
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(40, 167, 69, 0.9);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        border: 2px solid #28a745;
        z-index: 999999;
        font-weight: 600;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        max-width: 400px;
        word-wrap: break-word;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 3000);
}

// Make functions globally available
window.loadActivityData = loadActivityData;
window.loadUserData = loadUserData;
window.loadStatistics = loadStatistics;
window.loadAllData = loadAllData;

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdmin);
} else {
    initAdmin();
}