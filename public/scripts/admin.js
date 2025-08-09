// Admin panel functionality
let activityData = [];
let userData = [];
let adminProducts = [];

document.addEventListener('DOMContentLoaded', function() {
    initAdmin();
    
    // Setup admin access checks
    setTimeout(() => {
        if (typeof setupAdminAccessChecks === 'function') {
            setupAdminAccessChecks();
        }
    }, 1000);
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

// Filter activity by username prefix
function applyActivityFilter() {
  const input = document.getElementById('usernamePrefixFilter');
  if (!input) return;
  const prefix = (input.value || '').trim().toLowerCase();
  if (!prefix) {
    displayActivityTable(activityData);
    return;
  }
  const filtered = activityData.filter(a => {
    const uname = (a.user?.username || a.details?.username || '').toLowerCase();
    return uname.startsWith(prefix);
  });
  displayActivityTable(filtered);
}

function clearActivityFilter() {
  const input = document.getElementById('usernamePrefixFilter');
  if (input) input.value = '';
  displayActivityTable(activityData);
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
window.applyActivityFilter = applyActivityFilter;
window.clearActivityFilter = clearActivityFilter;

// ---------------
// Manage products
// ---------------

async function loadProductsForAdmin() {
  try {
    const tbody = document.getElementById('adminProductsTableBody');
    if (tbody) tbody.innerHTML = '<tr><td colspan="3" class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading products...</td></tr>';
    const res = await fetch('/api/products?limit=500&page=1', { credentials: 'include' });
    const data = await res.json();
    adminProducts = data.products || [];
    renderAdminProducts();
  } catch (e) {
    showError('Failed to load products');
  }
}

function renderAdminProducts() {
  const tbody = document.getElementById('adminProductsTableBody');
  if (!tbody) return;
  if (!adminProducts.length) {
    tbody.innerHTML = '<tr><td colspan="3" class="no-data">No products yet</td></tr>';
    return;
  }
  tbody.innerHTML = adminProducts.map(p => `
    <tr>
      <td>${p.title}</td>
      <td>$${Number(p.price).toFixed(2)}</td>
      <td>
        <button class="refresh-btn" onclick="deleteAdminProduct('${p.id}')"><i class="fas fa-trash"></i> Remove</button>
      </td>
    </tr>
  `).join('');
}

async function deleteAdminProduct(id) {
  if (!confirm('Delete this product?')) return;
  try {
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE', credentials: 'include' });
    if (!res.ok) throw new Error('Delete failed');
    showSuccess('Product deleted');
    await loadProductsForAdmin();
  } catch (e) {
    showError('Failed to delete product');
  }
}

async function handleCreateProductSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const title = form.title.value.trim();
  const description = form.description.value.trim();
  const price = parseFloat(form.price.value);
  const category = form.category.value.trim();
  const brand = form.brand.value.trim();
  const sizesCsv = (form.sizes.value || '').trim();
  const defaultStock = parseInt(form.defaultStock.value || '0', 10);
  const imageUrl = (form.imageUrl.value || '').trim();
  const fileInput = form.imageFile;

  const sizes = sizesCsv ? sizesCsv.split(',').map(s => s.trim()).filter(Boolean) : [];
  const stock = sizes.reduce((acc, size) => { acc[size] = defaultStock; return acc; }, {});

  // Upload image first (file takes precedence, else URL)
  const images = [];
  try {
    if (fileInput && fileInput.files && fileInput.files[0]) {
      const fd = new FormData();
      fd.append('productTitle', title);
      fd.append('image', fileInput.files[0]);
      fd.append('fileName', title);
      const up = await fetch('/api/admin/upload-image', { method: 'POST', body: fd, credentials: 'include' });
      if (!up.ok) throw new Error('Upload failed');
      const upJson = await up.json();
      if (upJson.path) images.push(upJson.path);
    } else if (imageUrl) {
      const up = await fetch('/api/admin/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productTitle: title, imageUrl, fileName: title }),
        credentials: 'include'
      });
      if (!up.ok) throw new Error('Upload failed');
      const upJson = await up.json();
      if (upJson.path) images.push(upJson.path);
    }
  } catch (error) {
    showError('Image upload failed');
    return;
  }

  try {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ title, description, price, category, brand, sizes, stock, images })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Create failed');
    }
    showSuccess('Product created');
    form.reset();
    await loadProductsForAdmin();
  } catch (e) {
    showError(e.message || 'Failed to create product');
  }
}

// Attach listeners after DOM load
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('createProductForm');
  if (form) form.addEventListener('submit', handleCreateProductSubmit);
  loadProductsForAdmin();
  populateAdminCategoryBrandOptions();
});

// Expose for inline handlers
window.deleteAdminProduct = deleteAdminProduct;
window.loadProductsForAdmin = loadProductsForAdmin;

async function populateAdminCategoryBrandOptions() {
  try {
    const [catsRes, brandsRes] = await Promise.all([
      fetch('/api/products/categories/list', { credentials: 'include' }),
      fetch('/api/products/brands/list', { credentials: 'include' })
    ]);
    const cats = await catsRes.json().catch(() => ({ categories: [] }));
    const brands = await brandsRes.json().catch(() => ({ brands: [] }));
    const catSel = document.getElementById('adminCategorySelect');
    const brandSel = document.getElementById('adminBrandSelect');

    // Only allow known categories: exactly the existing ones in the catalog
    const knownCats = (cats.categories || []).filter(Boolean);
    const knownBrands = (brands.brands || []).filter(Boolean);

    if (catSel) {
      catSel.innerHTML = '';
      knownCats.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c;
        catSel.appendChild(opt);
      });
    }
    if (brandSel) {
      brandSel.innerHTML = '';
      knownBrands.forEach(b => {
        const opt = document.createElement('option');
        opt.value = b;
        opt.textContent = b;
        brandSel.appendChild(opt);
      });
    }
  } catch (e) {
    console.warn('Failed to populate categories/brands:', e);
  }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdmin);
} else {
    initAdmin();
}