// Thank you page functionality
document.addEventListener('DOMContentLoaded', function() {
    initThankYouPage();
    
    // Setup admin access checks
    setTimeout(() => {
        if (typeof setupAdminAccessChecks === 'function') {
            setupAdminAccessChecks();
        }
    }, 1000);
});

function initThankYouPage() {
    try {
        // Check if user is logged in
        checkLoginStatus();
        
        // Get order ID from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('orderId');
        
        if (orderId) {
            loadOrderDetails(orderId);
        } else {
            showErrorState();
        }
        
        // Initialize animations
        initSuccessAnimation();
        
        console.log('Thank you page initialized successfully');
    } catch (error) {
        console.error('Failed to initialize thank you page:', error);
        showErrorState();
    }
}

async function loadOrderDetails(orderId) {
    try {
        const response = await fetch(`/api/payment/order/${orderId}`, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Failed to load order details');
        }
        
        const orderData = await response.json();
        displayOrderDetails(orderData);
        
    } catch (error) {
        console.error('Failed to load order details:', error);
        showErrorState();
    }
}

function displayOrderDetails(orderData) {
    // Update order information
    document.getElementById('orderNumber').textContent = orderData.id || 'N/A';
    document.getElementById('orderDate').textContent = new Date(orderData.timestamp).toLocaleDateString();
    document.getElementById('totalAmount').textContent = `$${orderData.total?.toFixed(2) || '0.00'}`;
    document.getElementById('paymentMethod').textContent = formatPaymentMethod(orderData.paymentMethod);
    
    // Display order items
    displayOrderItems(orderData.items || []);
    
    // Display shipping details
    displayShippingDetails(orderData.shippingAddress);
    
    // Calculate estimated delivery
    updateEstimatedDelivery();
}

function displayOrderItems(items) {
    const itemsList = document.getElementById('orderItemsList');
    if (!itemsList || !items.length) return;
    
    const itemsHTML = items.map(item => `
        <div class="order-item-summary">
            <div class="item-image">
                <img src="${item.product?.images?.[0] || '/images/placeholder.jpg'}" alt="${item.product?.title || 'Product'}">
            </div>
            <div class="item-details">
                <h4>${item.product?.title || 'Unknown Product'}</h4>
                <p class="brand">${item.product?.brand || 'Unknown Brand'}</p>
                <div class="item-specs">
                    <span class="quantity">Qty: ${item.quantity}</span>
                    ${item.size ? `<span class="size">Size: ${item.size}</span>` : ''}
                    ${item.color ? `<span class="color">Color: ${item.color}</span>` : ''}
                </div>
            </div>
            <div class="item-price">
                <span>$${((item.product?.price || 0) * item.quantity).toFixed(2)}</span>
            </div>
        </div>
    `).join('');
    
    itemsList.innerHTML = itemsHTML;
}

function displayShippingDetails(shippingAddress) {
    const shippingDetails = document.getElementById('shippingDetails');
    if (!shippingDetails || !shippingAddress) return;
    
    const addressHTML = `
        <div class="address-card">
            <p class="recipient-name">${shippingAddress.firstName} ${shippingAddress.lastName}</p>
            <p class="street">${shippingAddress.address}</p>
            <p class="city-state">${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}</p>
            <p class="country">${shippingAddress.country}</p>
            ${shippingAddress.phone ? `<p class="phone">Phone: ${shippingAddress.phone}</p>` : ''}
        </div>
    `;
    
    shippingDetails.innerHTML = addressHTML;
}

function formatPaymentMethod(paymentMethod) {
    switch(paymentMethod) {
        case 'credit':
            return 'Credit Card';
        case 'debit':
            return 'Debit Card';
        default:
            return 'Credit Card';
    }
}

function updateEstimatedDelivery() {
    const today = new Date();
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + 5); // 5 days from now
    
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    
    document.getElementById('estimatedDelivery').textContent = deliveryDate.toLocaleDateString('en-US', options);
}

function initSuccessAnimation() {
    // Add animation class to success icon
    setTimeout(() => {
        const successIcon = document.querySelector('.success-icon');
        if (successIcon) {
            successIcon.classList.add('animate');
        }
        
        const successGlow = document.querySelector('.success-glow');
        if (successGlow) {
            successGlow.classList.add('pulse');
        }
    }, 100);
    
    // Stagger animation for step cards
    const stepCards = document.querySelectorAll('.step-card');
    stepCards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('fade-in');
        }, 300 + (index * 150));
    });
}

function showErrorState() {
    const thankYouContent = document.querySelector('.thank-you-content');
    if (!thankYouContent) return;
    
    thankYouContent.innerHTML = `
        <div class="error-state">
            <div class="error-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h1>Something went wrong</h1>
            <p>We couldn't load your order details. Please check your email for order confirmation or contact support.</p>
            <div class="error-actions">
                <a href="/my-items" class="btn-primary">View My Orders</a>
                <a href="/support" class="btn-secondary">Contact Support</a>
            </div>
        </div>
    `;
}

// Social sharing functions
function shareOnTwitter() {
    const text = "Just made an awesome purchase from @ZippyStreetwear! 🔥 #streetwear #fashion";
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'width=600,height=400');
}

function shareOnInstagram() {
    // Instagram doesn't support direct sharing via URL, so we'll copy a message
    const message = "Just made an awesome purchase from Zippy Streetwear! 🔥 #streetwear #fashion";
    copyToClipboard(message);
    showNotification('Message copied! Paste it in your Instagram post', 'success');
}

function shareOnFacebook() {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}`;
    window.open(url, '_blank', 'width=600,height=400');
}

function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }
}

// Print order details
function printOrderDetails() {
    window.print();
}

// Notification function (if not available from global.js)
function showNotification(message, type = 'info') {
    // Try to use global notification function first
    if (window.showNotification) {
        window.showNotification(message, type);
        return;
    }
    
    // Fallback notification
    console.log(`${type.toUpperCase()}: ${message}`);
    alert(message);
}

// Check login status function (if not available from auth.js)
function checkLoginStatus() {
    if (window.checkLoginStatus) {
        window.checkLoginStatus();
    }
}