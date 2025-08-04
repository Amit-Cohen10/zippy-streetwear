// Admin panel functionality
let currentTab = 'dashboard';
let activityData = [];
let userData = [];
let productData = [];

document.addEventListener('DOMContentLoaded', function() {
    initAdmin();
});

function initAdmin() {
    try {
        // Check if user is admin
        checkAdminAccess();
        
        // Initialize tabs
        initTabs();
        
        // Load initial data
        loadDashboardData();
        
        // Initialize filters
        initFilters();
        
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

function initTabs() {
    const tabButtons = document.querySelectorAll('.admin-tab');
    const tabContents = document.querySelectorAll('.admin-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    // Update current tab
    currentTab = tabName;
    
    // Update tab buttons
    document.querySelectorAll('.admin-tab').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update tab contents
    document.querySelectorAll('.admin-content').forEach(content => {
        content.classList.add('hidden');
    });
    document.getElementById(`${tabName}Tab`).classList.remove('hidden');
    
    // Load tab-specific data
    switch(tabName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'activity':
            loadActivityData();
            break;
        case 'users':
            loadUserData();
            break;
        case 'products':
            loadProductData();
            break;
        case 'exchanges':
            loadExchangeData();
            break;
    }
}

async function loadDashboardData() {
    try {
        const [analyticsResponse, activityResponse] = await Promise.all([
            fetch('/api/admin/analytics', { credentials: 'include' }),
            fetch('/api/admin/activity?limit=10', { credentials: 'include' })
        ]);
        
        if (analyticsResponse.ok) {
            const analytics = await analyticsResponse.json();
            updateAnalytics(analytics);
        }
        
        if (activityResponse.ok) {
            const recentActivity = await activityResponse.json();
            displayRecentActivity(recentActivity.activities || recentActivity);
        }
        
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
    }
}

function updateAnalytics(analytics) {
    document.getElementById('totalRevenue').textContent = `$${analytics.totalRevenue?.toFixed(2) || '0.00'}`;
    document.getElementById('totalOrders').textContent = analytics.totalOrders || '0';
    document.getElementById('activeUsers').textContent = analytics.activeUsers || '0';
    document.getElementById('totalExchanges').textContent = analytics.totalExchanges || '0';
}

function displayRecentActivity(activities) {
    const activityList = document.getElementById('recentActivityList');
    if (!activityList) return;
    
    if (!activities || activities.length === 0) {
        activityList.innerHTML = '<p class="no-data">No recent activity</p>';
        return;
    }
    
    const html = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-user">${activity.username || 'Unknown User'}</div>
            <div class="activity-action">${formatActivityAction(activity.action)}</div>
            <div class="activity-time">${formatTime(activity.timestamp)}</div>
        </div>
    `).join('');
    
    activityList.innerHTML = html;
}

async function loadActivityData() {
    try {
        showLoadingState('activityTableBody');
        
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
        tableBody.innerHTML = '<tr><td colspan="5" class="no-data">No activity data available</td></tr>';
        return;
    }
    
    const html = activities.map(activity => `
        <tr>
            <td>${activity.username || 'Unknown User'}</td>
            <td><span class="action-badge ${getActionClass(activity.action)}">${formatActivityAction(activity.action)}</span></td>
            <td>${formatActivityDetails(activity.details)}</td>
            <td>${formatDateTime(activity.timestamp)}</td>
            <td>${activity.ip || 'N/A'}</td>
        </tr>
    `).join('');
    
    tableBody.innerHTML = html;
}

function initFilters() {
    // Activity filters
    const activityFilter = document.getElementById('activityFilter');
    const activityStartDate = document.getElementById('activityStartDate');
    const activityEndDate = document.getElementById('activityEndDate');
    const filterActivityBtn = document.getElementById('filterActivity');
    
    if (filterActivityBtn) {
        filterActivityBtn.addEventListener('click', filterActivityData);
    }
    
    // Add username filter input
    const activityFilters = document.querySelector('.activity-filters');
    if (activityFilters && !document.getElementById('usernameFilter')) {
        const usernameFilter = document.createElement('input');
        usernameFilter.type = 'text';
        usernameFilter.id = 'usernameFilter';
        usernameFilter.placeholder = 'Filter by username...';
        usernameFilter.style.marginRight = '10px';
        
        activityFilters.insertBefore(usernameFilter, activityStartDate);
    }
    
    // User filters
    const userSearch = document.getElementById('userSearch');
    const userRoleFilter = document.getElementById('userRoleFilter');
    const filterUsersBtn = document.getElementById('filterUsers');
    
    if (filterUsersBtn) {
        filterUsersBtn.addEventListener('click', filterUserData);
    }
    
    // Product actions
    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', showAddProductModal);
    }
}

function filterActivityData() {
    const actionFilter = document.getElementById('activityFilter').value;
    const usernameFilter = document.getElementById('usernameFilter').value.toLowerCase();
    const startDate = document.getElementById('activityStartDate').value;
    const endDate = document.getElementById('activityEndDate').value;
    
    let filteredData = activityData.filter(activity => {
        // Filter by action
        if (actionFilter && activity.action !== actionFilter) {
            return false;
        }
        
        // Filter by username
        if (usernameFilter && !activity.username?.toLowerCase().includes(usernameFilter)) {
            return false;
        }
        
        // Filter by date range
        if (startDate && new Date(activity.timestamp) < new Date(startDate)) {
            return false;
        }
        
        if (endDate && new Date(activity.timestamp) > new Date(endDate + 'T23:59:59')) {
            return false;
        }
        
        return true;
    });
    
    displayActivityTable(filteredData);
}

function filterUserData() {
    const searchTerm = document.getElementById('userSearch')?.value.toLowerCase() || '';
    const roleFilter = document.getElementById('userRoleFilter')?.value || '';
    
    let filteredData = userData.filter(user => {
        // Filter by search term
        if (searchTerm && !user.username?.toLowerCase().includes(searchTerm) && 
            !user.email?.toLowerCase().includes(searchTerm)) {
            return false;
        }
        
        // Filter by role
        if (roleFilter && user.role !== roleFilter) {
            return false;
        }
        
        return true;
    });
    
    displayUserTable(filteredData);
}

async function loadUserData() {
    try {
        showLoadingState('userTableBody');
        
        const response = await fetch('/api/admin/users', {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Failed to load user data');
        }
        
        userData = await response.json();
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
        tableBody.innerHTML = '<tr><td colspan="5" class="no-data">No users found</td></tr>';
        return;
    }
    
    const html = users.map(user => `
        <tr>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td><span class="role-badge ${user.role}">${user.role}</span></td>
            <td>${formatDateTime(user.createdAt)}</td>
            <td>
                <button class="btn-sm btn-outline" onclick="editUser('${user.id}')">Edit</button>
                <button class="btn-sm btn-danger" onclick="deleteUser('${user.id}')">Delete</button>
            </td>
        </tr>
    `).join('');
    
    tableBody.innerHTML = html;
}

async function loadProductData() {
    try {
        showLoadingState('productTableBody');
        
        const response = await fetch('/api/products', {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Failed to load product data');
        }
        
        productData = await response.json();
        displayProductTable(productData);
        
    } catch (error) {
        console.error('Failed to load product data:', error);
        showError('Failed to load product data');
    }
}

function displayProductTable(products) {
    const tableBody = document.getElementById('productTableBody');
    if (!tableBody) return;
    
    if (!products || products.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="no-data">No products found</td></tr>';
        return;
    }
    
    const html = products.map(product => `
        <tr>
            <td><img src="${product.images?.[0] || '/images/placeholder.jpg'}" alt="${product.title}" class="product-thumb"></td>
            <td>${product.title}</td>
            <td>${product.brand}</td>
            <td>$${product.price?.toFixed(2) || '0.00'}</td>
            <td><span class="status-badge ${product.available ? 'available' : 'unavailable'}">${product.available ? 'Available' : 'Unavailable'}</span></td>
            <td>
                <button class="btn-sm btn-outline" onclick="editProduct('${product.id}')">Edit</button>
                <button class="btn-sm btn-danger" onclick="deleteProduct('${product.id}')">Delete</button>
            </td>
        </tr>
    `).join('');
    
    tableBody.innerHTML = html;
}

// Utility functions
function formatActivityAction(action) {
    const actionMap = {
        'login': 'Login',
        'logout': 'Logout',
        'register': 'Register',
        'cart_add': 'Added to Cart',
        'cart_remove': 'Removed from Cart',
        'order_placed': 'Order Placed',
        'exchange_create': 'Exchange Created',
        'product_create': 'Product Created'
    };
    
    return actionMap[action] || action;
}

function formatActivityDetails(details) {
    if (!details) return 'N/A';
    if (typeof details === 'string') return details;
    if (typeof details === 'object') {
        return Object.entries(details).map(([key, value]) => `${key}: ${value}`).join(', ');
    }
    return String(details);
}

function getActionClass(action) {
    const classMap = {
        'login': 'success',
        'logout': 'info',
        'register': 'primary',
        'cart_add': 'info',
        'cart_remove': 'warning',
        'order_placed': 'success',
        'exchange_create': 'primary',
        'product_create': 'success'
    };
    
    return classMap[action] || 'default';
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
}

function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString();
}

function showLoadingState(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '<tr><td colspan="100%" class="loading">Loading...</td></tr>';
    }
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

// Product management functions
function showAddProductModal() {
    // Implementation for adding products
    alert('Add product functionality would open a modal here');
}

function editProduct(productId) {
    alert(`Edit product ${productId} functionality would open a modal here`);
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        // Implementation for deleting products
        alert(`Delete product ${productId} functionality would be implemented here`);
    }
}

// User management functions
function editUser(userId) {
    alert(`Edit user ${userId} functionality would open a modal here`);
}

function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        alert(`Delete user ${userId} functionality would be implemented here`);
    }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdmin);
} else {
    initAdmin();
}