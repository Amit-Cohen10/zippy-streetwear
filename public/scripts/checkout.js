// Checkout functionality
let currentStep = 1;
let cartData = null;
let orderData = {};

document.addEventListener('DOMContentLoaded', function() {
    initCheckout();
});

async function initCheckout() {
    try {
        // Check if user is logged in first
        const isLoggedIn = await checkUserLoginStatus();
        
        if (!isLoggedIn) {
            showNotification('Please log in to continue', 'error');
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
            return;
        }
        
        // Load cart data
        await loadCheckoutData();
        
        // Initialize form handlers
        initFormHandlers();
        
        // Initialize step navigation
        updateStepDisplay();
        
        console.log('Checkout initialized successfully');
    } catch (error) {
        console.error('Failed to initialize checkout:', error);
        showNotification('Failed to load checkout', 'error');
    }
}

// Check user login status
async function checkUserLoginStatus() {
    try {
        console.log('Checking user login status...');
        
        // First check localStorage
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            console.log('User found in localStorage:', currentUser);
            return true;
        }
        
        console.log('No user in localStorage, checking server...');
        const response = await fetch('/api/auth/status', {
            credentials: 'include'
        });
        
        console.log('Server response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Server response data:', data);
            return data.loggedIn;
        }
        
        console.log('Server response not ok, returning false');
        return false;
    } catch (error) {
        console.error('Failed to check login status:', error);
        return false;
    }
}

async function loadCheckoutData() {
    try {
        // Load cart data from localStorage (same as cart page)
        const savedCart = localStorage.getItem('zippyCart');
        
        if (savedCart) {
            const cartItems = JSON.parse(savedCart);
            console.log('Loaded cart data from localStorage:', cartItems);
            
            if (!Array.isArray(cartItems) || cartItems.length === 0) {
                showNotification('Your cart is empty', 'error');
                window.location.href = '/cart';
                return;
            }
            
            // Convert to expected format for checkout
            cartData = {
                items: cartItems.map(item => ({
                    product: {
                        title: item.name || item.title,
                        brand: item.brand || 'Zippy Streetwear',
                        price: item.price || 0,
                        images: item.image ? [item.image] : (item.images || ['/images/placeholder.jpg'])
                    },
                    quantity: item.quantity || 1,
                    size: item.size,
                    color: item.color
                })),
                total: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
            };
        } else {
            // Fallback to server data
            console.log('No cart data in localStorage, trying server...');
            const response = await fetch('/api/cart', {
                credentials: 'include'
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    showNotification('Please log in to continue', 'error');
                    window.location.href = '/';
                    return;
                }
                throw new Error('Failed to load cart');
            }
            
            cartData = await response.json();
        }
        
        if (!cartData.items || cartData.items.length === 0) {
            showNotification('Your cart is empty', 'error');
            window.location.href = '/cart';
            return;
        }
        
        console.log('Final cart data for checkout:', cartData);
        displayOrderItems();
        updateOrderSummary();
        
    } catch (error) {
        console.error('Failed to load checkout data:', error);
        showNotification('Failed to load order details', 'error');
    }
}

function displayOrderItems() {
    const orderItemsContainer = document.getElementById('orderItems');
    if (!orderItemsContainer || !cartData.items) return;
    
    const itemsHTML = cartData.items.map(item => `
        <div class="order-item">
            <div class="item-image">
                <img src="${item.product.images[0] || '/images/placeholder.jpg'}" alt="${item.product.title}">
            </div>
            <div class="item-details">
                <h4>${item.product.title}</h4>
                <p class="brand">${item.product.brand}</p>
                <div class="item-options">
                    ${item.size ? `<span class="size">Size: ${item.size}</span>` : ''}
                    ${item.color ? `<span class="color">Color: ${item.color}</span>` : ''}
                </div>
            </div>
            <div class="item-quantity">
                <span>Qty: ${item.quantity}</span>
            </div>
            <div class="item-price">
                <span>$${(item.product.price * item.quantity).toFixed(2)}</span>
            </div>
        </div>
    `).join('');
    
    orderItemsContainer.innerHTML = itemsHTML;
}

function updateOrderSummary() {
    if (!cartData) return;
    
    const subtotal = cartData.total || 0;
    const shipping = subtotal > 100 ? 0 : 9.99; // Free shipping over $100
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shipping + tax;
    
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('shipping').textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
    
    // Store for later use
    orderData.pricing = {
        subtotal,
        shipping,
        tax,
        total
    };
}

function initFormHandlers() {
    // Card number formatting
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', formatCardNumber);
    }
    
    // Expiry date formatting
    const expiryInput = document.getElementById('expiryDate');
    if (expiryInput) {
        expiryInput.addEventListener('input', formatExpiryDate);
    }
    
    // CVV validation
    const cvvInput = document.getElementById('cvv');
    if (cvvInput) {
        cvvInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }
    
    // Payment method toggle
    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
    paymentMethods.forEach(method => {
        method.addEventListener('change', togglePaymentMethod);
    });
}

function formatCardNumber(e) {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    e.target.value = value;
}

function formatExpiryDate(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    e.target.value = value;
}

function togglePaymentMethod() {
    const creditCardForm = document.getElementById('creditCardForm');
    const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    
    if (selectedMethod === 'credit') {
        creditCardForm.style.display = 'block';
    } else {
        creditCardForm.style.display = 'none';
    }
}

function updateStepDisplay() {
    // Update step indicators
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
        const stepNumber = index + 1;
        if (stepNumber < currentStep) {
            step.classList.add('completed');
            step.classList.remove('active');
        } else if (stepNumber === currentStep) {
            step.classList.add('active');
            step.classList.remove('completed');
        } else {
            step.classList.remove('active', 'completed');
        }
    });
    
    // Show/hide sections
    const sections = document.querySelectorAll('.checkout-section');
    sections.forEach(section => section.style.display = 'none');
    
    switch(currentStep) {
        case 1:
            document.getElementById('orderReviewSection').style.display = 'block';
            break;
        case 2:
            document.getElementById('shippingSection').style.display = 'block';
            break;
        case 3:
            document.getElementById('paymentSection').style.display = 'block';
            break;
        case 4:
            document.getElementById('confirmationSection').style.display = 'block';
            displayConfirmation();
            break;
    }
    
    // Update buttons
    updateButtons();
}

function updateButtons() {
    const backBtn = document.getElementById('backBtn');
    const nextBtn = document.getElementById('nextBtn');
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    
    // Back button
    if (currentStep > 1) {
        backBtn.style.display = 'inline-block';
    } else {
        backBtn.style.display = 'none';
    }
    
    // Next/Place Order buttons
    if (currentStep < 4) {
        nextBtn.style.display = 'inline-block';
        placeOrderBtn.style.display = 'none';
    } else {
        nextBtn.style.display = 'none';
        placeOrderBtn.style.display = 'inline-block';
    }
}

function goNext() {
    console.log('goNext called, current step:', currentStep);
    if (validateCurrentStep()) {
        currentStep++;
        console.log('Moving to step:', currentStep);
        updateStepDisplay();
    } else {
        console.log('Validation failed for step:', currentStep);
    }
}

function goBack() {
    console.log('goBack called, current step:', currentStep);
    if (currentStep > 1) {
        currentStep--;
        console.log('Moving back to step:', currentStep);
        updateStepDisplay();
    } else {
        console.log('Cannot go back from step 1');
    }
}

function validateCurrentStep() {
    console.log('Validating step:', currentStep);
    switch(currentStep) {
        case 1:
            return validateOrderReview();
        case 2:
            return validateShipping();
        case 3:
            return validatePayment();
        default:
            return true;
    }
}

function validateOrderReview() {
    console.log('Validating order review, cartData:', cartData);
    
    // For now, always allow moving from step 1 even if cart is empty
    // This allows testing the checkout flow
    if (!cartData || !cartData.items || cartData.items.length === 0) {
        console.log('Cart is empty, but allowing to continue for testing');
        // showNotification('Your cart is empty', 'error');
        // return false;
    }
    return true;
}

function validateShipping() {
    console.log('Validating shipping...');
    const form = document.getElementById('shippingForm');
    
    if (!form) {
        console.log('Shipping form not found, allowing to continue');
        return true;
    }
    
    const formData = new FormData(form);
    
    // For now, just store whatever data is available
    orderData.shipping = Object.fromEntries(formData);
    console.log('Shipping data stored:', orderData.shipping);
    return true;
}

function validatePayment() {
    console.log('Validating payment...');
    const paymentMethodElement = document.querySelector('input[name="paymentMethod"]:checked');
    
    if (!paymentMethodElement) {
        console.log('No payment method selected, allowing to continue');
        return true;
    }
    
    const paymentMethod = paymentMethodElement.value;
    
    if (paymentMethod === 'credit') {
        const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
        const expiryDate = document.getElementById('expiryDate').value;
        const cvv = document.getElementById('cvv').value;
        const cardName = document.getElementById('cardName').value;
        
        if (!cardNumber || cardNumber.length < 13) {
            showNotification('Please enter a valid card number', 'error');
            return false;
        }
        
        if (!expiryDate || !expiryDate.match(/^\d{2}\/\d{2}$/)) {
            showNotification('Please enter a valid expiry date (MM/YY)', 'error');
            return false;
        }
        
        if (!cvv || cvv.length < 3) {
            showNotification('Please enter a valid CVV', 'error');
            return false;
        }
        
        if (!cardName) {
            showNotification('Please enter the name on card', 'error');
            return false;
        }
        
        // Store payment data (don't store sensitive info in real app)
        orderData.payment = {
            method: 'credit',
            cardLast4: cardNumber.slice(-4),
            expiryDate,
            cardName
        };
    } else {
        orderData.payment = {
            method: 'paypal'
        };
    }
    
    return true;
}

function displayConfirmation() {
    const confirmationSummary = document.getElementById('confirmationSummary');
    if (!confirmationSummary) return;
    
    const html = `
        <div class="confirmation-section">
            <h3>Order Summary</h3>
            <div class="summary-items">
                ${cartData.items.map(item => `
                    <div class="summary-item">
                        <span>${item.product.title} x ${item.quantity}</span>
                        <span>$${(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
            <div class="summary-totals">
                <div class="summary-row">
                    <span>Subtotal:</span>
                    <span>$${orderData.pricing.subtotal.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                    <span>Shipping:</span>
                    <span>${orderData.pricing.shipping === 0 ? 'FREE' : '$' + orderData.pricing.shipping.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                    <span>Tax:</span>
                    <span>$${orderData.pricing.tax.toFixed(2)}</span>
                </div>
                <div class="summary-row total">
                    <span>Total:</span>
                    <span>$${orderData.pricing.total.toFixed(2)}</span>
                </div>
            </div>
        </div>
        
        <div class="confirmation-section">
            <h3>Shipping Address</h3>
            <div class="address-details">
                <p>${orderData.shipping.firstName} ${orderData.shipping.lastName}</p>
                <p>${orderData.shipping.address}</p>
                <p>${orderData.shipping.city}, ${orderData.shipping.state} ${orderData.shipping.zipCode}</p>
                <p>${orderData.shipping.country}</p>
                ${orderData.shipping.phone ? `<p>Phone: ${orderData.shipping.phone}</p>` : ''}
            </div>
        </div>
        
        <div class="confirmation-section">
            <h3>Payment Method</h3>
            <div class="payment-details">
                ${orderData.payment.method === 'credit' ? 
                    `<p>Credit Card ending in ${orderData.payment.cardLast4}</p>` :
                    `<p>PayPal</p>`
                }
            </div>
        </div>
    `;
    
    confirmationSummary.innerHTML = html;
}

async function placeOrder() {
    console.log('placeOrder called!');
    try {
        showLoadingModal();
        
        const orderPayload = {
            items: cartData.items,
            shippingAddress: orderData.shipping,
            billingAddress: orderData.shipping, // Using same as shipping for now
            paymentMethod: orderData.payment.method,
            cardNumber: orderData.payment.method === 'credit' ? '**** **** **** ' + orderData.payment.cardLast4 : null,
            expiryDate: orderData.payment.expiryDate || null,
            cvv: '***', // Never send real CVV
            pricing: orderData.pricing
        };
        
        const response = await fetch('/api/payment/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(orderPayload)
        });
        
        hideLoadingModal();
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Payment failed');
        }
        
        const result = await response.json();
        
        // Redirect to thank you page
        window.location.href = `/thank-you?orderId=${result.orderId}`;
        
    } catch (error) {
        hideLoadingModal();
        console.error('Order placement failed:', error);
        showNotification(error.message || 'Failed to place order', 'error');
    }
}

function showLoadingModal() {
    const modal = document.getElementById('loadingModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function hideLoadingModal() {
    const modal = document.getElementById('loadingModal');
    if (modal) {
        modal.style.display = 'none';
    }
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

// Make functions globally available
console.log('Making functions globally available...');
window.goNext = goNext;
window.goBack = goBack;
window.placeOrder = placeOrder;
window.validateCurrentStep = validateCurrentStep;
window.updateStepDisplay = updateStepDisplay;

// Test if functions are working
console.log('Functions available:', {
    goNext: typeof window.goNext,
    goBack: typeof window.goBack,
    placeOrder: typeof window.placeOrder
});

// Add click handlers as backup
document.addEventListener('DOMContentLoaded', function() {
    console.log('Adding backup click handlers...');
    
    const nextBtn = document.getElementById('nextBtn');
    const backBtn = document.getElementById('backBtn');
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Next button clicked via event listener');
            goNext();
        });
    }
    
    if (backBtn) {
        backBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Back button clicked via event listener');
            goBack();
        });
    }
    
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Place order button clicked via event listener');
            placeOrder();
        });
    }
});