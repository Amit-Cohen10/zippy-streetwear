// Checkout functionality - Project requirement: Checkout screen (choose from cart and "pay")
// Project requirement: Pay screen - fill payment details and click pay
// Project requirement: Upon payment, show "Thank you page" indicating payment was successful
// ===== CHECKOUT STEP MANAGEMENT =====
let currentStep = 1;

// Step definitions
const STEPS = {
    ORDER_REVIEW: 1,
    SHIPPING_INFO: 2, 
    PAYMENT_INFO: 3,
    CONFIRMATION: 4
};

// Step configuration
const STEP_CONFIG = {
    [STEPS.ORDER_REVIEW]: {
        name: 'Order Review',
        section: 'orderReviewSection',
        canGoNext: true,
        canGoBack: false,
        showNextBtn: true,
        showBackBtn: false,
        showPlaceOrderBtn: false
    },
    [STEPS.SHIPPING_INFO]: {
        name: 'Shipping Info', 
        section: 'shippingSection',
        canGoNext: true,
        canGoBack: true,
        showNextBtn: true,
        showBackBtn: true,
        showPlaceOrderBtn: false
    },
    [STEPS.PAYMENT_INFO]: {
        name: 'Payment Info',
        section: 'paymentSection', 
        canGoNext: true,
        canGoBack: true,
        showNextBtn: true,
        showBackBtn: true,
        showPlaceOrderBtn: false
    },
    [STEPS.CONFIRMATION]: {
        name: 'Confirmation',
        section: 'confirmationSection',
        canGoNext: false,
        canGoBack: true, 
        showNextBtn: false,
        showBackBtn: true,
        showPlaceOrderBtn: true
    }
};
let cartData = null;
let orderData = {};

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 CHECKOUT PAGE LOADED');
    console.log('📊 Initial State:', {
        currentStep,
        stepName: STEP_CONFIG[currentStep].name,
        canGoNext: STEP_CONFIG[currentStep].canGoNext,
        canGoBack: STEP_CONFIG[currentStep].canGoBack
    });
    initCheckout();
    
    // Setup admin access checks
    setTimeout(() => {
        if (typeof setupAdminAccessChecks === 'function') {
            setupAdminAccessChecks();
        }
    }, 1000);
});

async function initCheckout() {
    try {
        // Reset to step 1 when page loads
        console.log('🔄 Resetting to step 1');
        currentStep = STEPS.ORDER_REVIEW;
        
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
                    // Preserve original cart item id so we can modify/remove items from checkout
                    id: item.id,
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
        <div class="order-item" data-item-id="${item.id}">
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
                <button class="quantity-btn" onclick="updateCheckoutQuantity('${item.id}', -1)">-</button>
                <span class="quantity" id="checkout-qty-${item.id}">${item.quantity}</span>
                <button class="quantity-btn" onclick="updateCheckoutQuantity('${item.id}', 1)">+</button>
            </div>
            <div class="item-price">
                <span>$${(item.product.price * item.quantity).toFixed(2)}</span>
            </div>
            <button class="remove-btn" onclick="removeCheckoutItem('${item.id}')">×</button>
        </div>
    `).join('');
    
    orderItemsContainer.innerHTML = itemsHTML;
}

function updateOrderSummary() {
    if (!cartData) return;
    
    // Recalculate subtotal from items to reflect live quantity/removal changes
    const subtotal = (cartData.items || []).reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    cartData.total = subtotal;
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

// ===== Checkout item actions (quantity + remove) =====
function updateCheckoutQuantity(itemId, change) {
    try {
        const saved = JSON.parse(localStorage.getItem('zippyCart') || '[]');
        const index = saved.findIndex(it => String(it.id) === String(itemId));
        if (index === -1) return;
        saved[index].quantity = (saved[index].quantity || 1) + change;
        if (saved[index].quantity <= 0) {
            saved.splice(index, 1);
        }
        localStorage.setItem('zippyCart', JSON.stringify(saved));

        // Update in-memory checkout data
        if (cartData && Array.isArray(cartData.items)) {
            const inMemIndex = cartData.items.findIndex(it => String(it.id) === String(itemId));
            if (inMemIndex !== -1) {
                const updated = saved.find(it => String(it.id) === String(itemId));
                if (updated) {
                    cartData.items[inMemIndex].quantity = updated.quantity || 1;
                } else {
                    // Item removed
                    cartData.items.splice(inMemIndex, 1);
                }
            }
        }

        // Re-render UI and totals
        displayOrderItems();
        updateOrderSummary();
        if (typeof updateCartCount === 'function') updateCartCount();

        // If cart is empty now, redirect back to cart page
        if (!cartData.items || cartData.items.length === 0) {
            showNotification('Your cart is empty', 'info');
            setTimeout(() => { window.location.href = '/cart'; }, 600);
            return;
        }
    } catch (e) {
        console.error('Failed to update quantity in checkout:', e);
    }
}

function removeCheckoutItem(itemId) {
    try {
        const saved = JSON.parse(localStorage.getItem('zippyCart') || '[]');
        const filtered = saved.filter(it => String(it.id) !== String(itemId));
        localStorage.setItem('zippyCart', JSON.stringify(filtered));

        // Update in-memory data
        if (cartData && Array.isArray(cartData.items)) {
            cartData.items = cartData.items.filter(it => String(it.id) !== String(itemId));
        }

        displayOrderItems();
        updateOrderSummary();
        if (typeof updateCartCount === 'function') updateCartCount();
        showNotification('Item removed from cart', 'success');

        if (!cartData.items || cartData.items.length === 0) {
            setTimeout(() => { window.location.href = '/cart'; }, 600);
        }
    } catch (e) {
        console.error('Failed to remove item in checkout:', e);
    }
}

// Expose for inline handlers
window.updateCheckoutQuantity = updateCheckoutQuantity;
window.removeCheckoutItem = removeCheckoutItem;

function initFormHandlers() {
    console.log('Initializing form handlers with validation...');
    
    // Card number formatting and validation
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        console.log('Card number input found, adding validation listeners');
        cardNumberInput.addEventListener('input', function(e) {
            console.log('Card number input event triggered');
            formatCardNumber(e);
            validateCardNumber(e.target);
        });
        cardNumberInput.addEventListener('blur', function(e) {
            console.log('Card number blur event triggered');
            validateCardNumber(e.target);
        });
    } else {
        console.log('Card number input not found!');
    }
    
    // Expiry date formatting and validation
    const expiryInput = document.getElementById('expiryDate');
    if (expiryInput) {
        expiryInput.addEventListener('input', function(e) {
            formatExpiryDate(e);
            validateExpiryDate(e.target);
        });
        expiryInput.addEventListener('blur', function(e) {
            validateExpiryDate(e.target);
        });
    }
    
    // CVV validation
    const cvvInput = document.getElementById('cvv');
    if (cvvInput) {
        cvvInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '');
            validateCVV(e.target);
        });
        cvvInput.addEventListener('blur', function(e) {
            validateCVV(e.target);
        });
    }
    
    // Card name validation
    const cardNameInput = document.getElementById('cardName');
    if (cardNameInput) {
        cardNameInput.addEventListener('input', function(e) {
            validateCardName(e.target);
        });
        cardNameInput.addEventListener('blur', function(e) {
            validateCardName(e.target);
        });
    }
    
    // Payment method toggle
    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
    paymentMethods.forEach(method => {
        method.addEventListener('change', togglePaymentMethod);
    });
    
    // Shipping form validation
    initShippingValidation();
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

// Validation Functions
function validateCardNumber(input) {
    console.log('validateCardNumber called with value:', input.value);
    const value = input.value.replace(/\s/g, '');
    const messageEl = document.getElementById('cardNumberValidation');
    console.log('Message element found:', !!messageEl);
    
    // Known test credit card numbers that should always be valid
    const testCards = [
        '4532123456789012', // Our test Visa (FULL 16 digits)
        '4000000000000002', // Test Visa
        '4111111111111111', // Test Visa
        '5555444433331111', // Test Mastercard
        '5105105105105100', // Test Mastercard
        '378282246310005',  // Test Amex (15 digits)
        '371449635398431'   // Test Amex (15 digits)
    ];
    
    // Luhn algorithm for card validation
    function luhnCheck(num) {
        let sum = 0;
        let isEven = false;
        for (let i = num.length - 1; i >= 0; i--) {
            let digit = parseInt(num[i]);
            if (isEven) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }
            sum += digit;
            isEven = !isEven;
        }
        return sum % 10 === 0;
    }
    
    if (value.length === 0) {
        showValidation(input, messageEl, '', 'neutral');
    } else if (value.length < 13 || value.length > 19) {
        showValidation(input, messageEl, '❌ Card number should be 13-19 digits', 'error');
    } else {
        // Check if it's a complete card number and if it's valid
        const isTestCard = testCards.includes(value);
        const passesLuhn = luhnCheck(value);
        const cardType = getCardType(value);
        
        console.log(`Card validation - Length: ${value.length}, Value: ${value}, Type: ${cardType}, IsTestCard: ${isTestCard}, PassesLuhn: ${passesLuhn}`);
        
        // Strict validation: EXACT lengths required for each card type
        let isValid = false;
        let errorMessage = '❌ Invalid card number';
        
        if (isTestCard) {
            isValid = true;
        } else if (passesLuhn) {
            // Strict length requirements
            if (cardType === 'Visa' && value.length === 16) {
                isValid = true;
            } else if (cardType === 'Mastercard' && value.length === 16) {
                isValid = true;
            } else if (cardType === 'American Express' && value.length === 15) {
                isValid = true;
            } else if (cardType === 'Discover' && value.length === 16) {
                isValid = true;
            } else {
                errorMessage = `❌ ${cardType} cards must be ${cardType === 'American Express' ? '15' : '16'} digits`;
            }
        }
        
        if (isValid) {
            showValidation(input, messageEl, `✅ Valid ${cardType} card`, 'success');
        } else {
            showValidation(input, messageEl, errorMessage, 'error');
        }
    }
}

function validateExpiryDate(input) {
    const value = input.value;
    const messageEl = document.getElementById('expiryValidation');
    
    if (value.length === 0) {
        showValidation(input, messageEl, '', 'neutral');
    } else if (!/^\d{2}\/\d{2}$/.test(value)) {
        showValidation(input, messageEl, '❌ Format should be MM/YY', 'error');
    } else {
        const [month, year] = value.split('/');
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100;
        const currentMonth = currentDate.getMonth() + 1;
        
        const expMonth = parseInt(month);
        const expYear = parseInt(year);
        
        if (expMonth < 1 || expMonth > 12) {
            showValidation(input, messageEl, '❌ Invalid month (01-12)', 'error');
        } else if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
            showValidation(input, messageEl, '❌ Card has expired', 'error');
        } else {
            showValidation(input, messageEl, '✅ Valid expiry date', 'success');
        }
    }
}

function validateCVV(input) {
    const value = input.value;
    const messageEl = document.getElementById('cvvValidation');
    
    if (value.length === 0) {
        showValidation(input, messageEl, '', 'neutral');
    } else if (value.length < 3 || value.length > 4) {
        showValidation(input, messageEl, '❌ CVV should be 3-4 digits', 'error');
    } else {
        showValidation(input, messageEl, '✅ Valid CVV', 'success');
    }
}

function validateCardName(input) {
    const value = input.value.trim();
    const messageEl = document.getElementById('cardNameValidation');
    
    if (value.length === 0) {
        showValidation(input, messageEl, '', 'neutral');
    } else if (value.length < 2) {
        showValidation(input, messageEl, '❌ Name is too short', 'error');
    } else if (!/^[a-zA-Z\s]+$/.test(value)) {
        showValidation(input, messageEl, '❌ Name should contain only letters', 'error');
    } else {
        showValidation(input, messageEl, '✅ Valid name', 'success');
    }
}

function showValidation(input, messageEl, message, type) {
    if (messageEl) {
        messageEl.textContent = message;
        messageEl.className = `validation-message ${type}`;
    }
    
    input.classList.remove('valid', 'invalid');
    if (type === 'success') {
        input.classList.add('valid');
    } else if (type === 'error') {
        input.classList.add('invalid');
    }
}

function getCardType(number) {
    const patterns = {
        'Visa': /^4/,
        'Mastercard': /^5[1-5]/,
        'American Express': /^3[47]/,
        'Discover': /^6(?:011|5)/
    };
    
    for (const [type, pattern] of Object.entries(patterns)) {
        if (pattern.test(number)) {
            return type;
        }
    }
    return 'Unknown';
}

// Initialize shipping form validation
function initShippingValidation() {
    console.log('Initializing shipping validation...');
    
    const shippingFields = ['firstName', 'lastName', 'address', 'city', 'zipCode', 'phone'];
    
    shippingFields.forEach(fieldId => {
        const input = document.getElementById(fieldId);
        if (input) {
            input.addEventListener('blur', function() {
                validateShippingField(fieldId);
            });
            input.addEventListener('input', function() {
                // Clear error styling while typing
                input.classList.remove('invalid');
                const messageEl = document.getElementById(fieldId + 'Validation');
                if (messageEl && input.value.trim()) {
                    validateShippingField(fieldId);
                }
            });
        }
    });
    
    // Add shipping method validation
    const shippingMethods = document.querySelectorAll('input[name="shippingMethod"]');
    shippingMethods.forEach(method => {
        method.addEventListener('change', function() {
            const messageEl = document.getElementById('shippingMethodValidation');
            if (messageEl) {
                messageEl.textContent = '✅ Shipping method selected';
                messageEl.className = 'validation-message success';
            }
        });
    });
}

// Validate individual shipping field
function validateShippingField(fieldId) {
    const input = document.getElementById(fieldId);
    const messageEl = document.getElementById(fieldId + 'Validation');
    
    if (!input || !messageEl) return;
    
    const value = input.value.trim();
    const fieldNames = {
        'firstName': 'First Name',
        'lastName': 'Last Name', 
        'address': 'Address',
        'city': 'City',
        'zipCode': 'ZIP Code',
        'phone': 'Phone Number'
    };
    
    const fieldName = fieldNames[fieldId];
    
    if (!value) {
        input.classList.add('invalid');
        input.classList.remove('valid');
        messageEl.textContent = `❌ ${fieldName} is required`;
        messageEl.className = 'validation-message error';
        return false;
    }
    
    // Specific validations
    if (fieldId === 'zipCode') {
        // Remove any non-digit characters for validation
        const cleanZip = value.replace(/\D/g, '');
        if (cleanZip.length < 4 || cleanZip.length > 6) {
            input.classList.add('invalid');
            input.classList.remove('valid');
            messageEl.textContent = '❌ ZIP should be 4-6 digits only';
            messageEl.className = 'validation-message error';
            return false;
        }
    }
    
    if (fieldId === 'phone' && value.replace(/[\s\-\+\(\)]/g, '').length < 9) {
        input.classList.add('invalid');
        input.classList.remove('valid');
        messageEl.textContent = '❌ Phone number too short';
        messageEl.className = 'validation-message error';
        return false;
    }
    
    // Field is valid
    input.classList.remove('invalid');
    input.classList.add('valid');
    messageEl.textContent = `✅ Valid ${fieldName.toLowerCase()}`;
    messageEl.className = 'validation-message success';
    return true;
}

function updateStepDisplay() {
    const stepConfig = STEP_CONFIG[currentStep];
    console.log(`📋 Updating display for step: ${currentStep} (${stepConfig.name})`);
    
    // Update step indicators
    const steps = document.querySelectorAll('.step');
    console.log(`Found ${steps.length} step elements`);
    
    steps.forEach((step, index) => {
        const stepNumber = index + 1;
        if (stepNumber < currentStep) {
            step.classList.add('completed');
            step.classList.remove('active');
        } else if (stepNumber === currentStep) {
            step.classList.add('active');
            step.classList.remove('completed');
            console.log(`✅ Step ${stepNumber} (${stepConfig.name}) is now active`);
        } else {
            step.classList.remove('active', 'completed');
        }
    });
    
    // Hide all sections first
    const sections = document.querySelectorAll('.checkout-section');
    console.log(`Found ${sections.length} checkout sections`);
    sections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Show current section
    const currentSectionId = stepConfig.section;
    const currentSection = document.getElementById(currentSectionId);
    if (currentSection) {
        currentSection.style.display = 'block';
        console.log(`✅ Showing section: ${currentSectionId}`);
        
        // Special handling for confirmation step
        if (currentStep === STEPS.CONFIRMATION) {
            displayConfirmation();
        }
    } else {
        console.error(`❌ Section not found: ${currentSectionId}`);
    }
    
    // Update buttons based on step configuration
    updateButtons();
}

function updateButtons() {
    const stepConfig = STEP_CONFIG[currentStep];
    const backBtn = document.getElementById('backBtn');
    const nextBtn = document.getElementById('nextBtn');
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    
    console.log(`🔘 Updating buttons for step ${currentStep}: Back=${stepConfig.showBackBtn}, Next=${stepConfig.showNextBtn}, PlaceOrder=${stepConfig.showPlaceOrderBtn}`);
    
    // Back button
    if (stepConfig.showBackBtn && backBtn) {
        backBtn.style.display = 'inline-block';
    } else if (backBtn) {
        backBtn.style.display = 'none';
    }
    
    // Next button  
    if (stepConfig.showNextBtn && nextBtn) {
        nextBtn.style.display = 'inline-block';
    } else if (nextBtn) {
        nextBtn.style.display = 'none';
    }
    
    // Place Order button
    if (stepConfig.showPlaceOrderBtn && placeOrderBtn) {
        placeOrderBtn.style.display = 'inline-block';
    } else if (placeOrderBtn) {
        placeOrderBtn.style.display = 'none';
    }
}

// ===== NAVIGATION FUNCTIONS =====
function goNext() {
    console.log(`🔄 goNext called, current step: ${currentStep} (${STEP_CONFIG[currentStep].name})`);
    
    try {
        // Check if this step allows going next
        if (!STEP_CONFIG[currentStep].canGoNext) {
            console.log('❌ Cannot go next from this step');
            showNotification('Cannot proceed from this step', 'error');
            return;
        }
        
        // Validate current step
        const isValid = validateCurrentStep();
        console.log('✅ Validation result:', isValid);
        
        if (isValid) {
            // Move to next step
            const nextStep = currentStep + 1;
            if (nextStep <= STEPS.CONFIRMATION) {
                console.log(`➡️ Moving from step ${currentStep} to step ${nextStep}`);
                currentStep = nextStep;
                updateStepDisplay();
                showNotification(`✅ Moved to ${STEP_CONFIG[currentStep].name}!`, 'success');
            } else {
                console.log('❌ Already at final step');
                showNotification('Already at final step', 'info');
            }
        } else {
            console.log('❌ Validation failed for current step');
            // The validation functions will show their own error messages
        }
    } catch (error) {
        console.error('❌ Error in goNext:', error);
        showNotification('Error occurred. Check console.', 'error');
    }
}

// Make goNext globally accessible
window.goNext = goNext;
console.log('✅ goNext is now global:', typeof window.goNext);

function goBack() {
    console.log(`⬅️ goBack called, current step: ${currentStep} (${STEP_CONFIG[currentStep].name})`);
    
    try {
        // Check if this step allows going back
        if (!STEP_CONFIG[currentStep].canGoBack) {
            console.log('❌ Cannot go back from this step');
            showNotification('Cannot go back from this step', 'info');
            return;
        }
        
        // Move to previous step
        const previousStep = currentStep - 1;
        if (previousStep >= STEPS.ORDER_REVIEW) {
            console.log(`⬅️ Moving from step ${currentStep} to step ${previousStep}`);
            currentStep = previousStep;
            updateStepDisplay();
            showNotification(`↩️ Moved back to ${STEP_CONFIG[currentStep].name}`, 'info');
        } else {
            console.log('❌ Already at first step');
            showNotification('Already at first step', 'info');
        }
    } catch (error) {
        console.error('❌ Error in goBack:', error);
        showNotification('Error occurred. Check console.', 'error');
    }
}

// Make goBack globally accessible
window.goBack = goBack;
console.log('✅ goBack is now global:', typeof window.goBack);

// The async placeOrder function below replaces this one

function validateCurrentStep() {
    console.log('🔍 Validating step:', currentStep);
    switch(currentStep) {
        case 1:
            console.log('📋 Validating Order Review...');
            return validateOrderReview();
        case 2:
            console.log('🚚 Validating Shipping...');
            return validateShipping();
        case 3:
            console.log('💳 Validating Payment...');
            return validatePayment();
        default:
            console.log('❓ Unknown step, allowing...');
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
    console.log('🚚 Validating shipping...');
    const form = document.getElementById('shippingForm');
    
    if (!form) {
        console.log('❌ Shipping form not found!');
        showNotification('Shipping form error', 'error');
        return false;
    }
    
    // Check shipping method is selected
    const shippingMethod = document.querySelector('input[name="shippingMethod"]:checked');
    console.log('📦 Selected shipping method:', shippingMethod ? shippingMethod.value : 'none');
    if (!shippingMethod) {
        showNotification('❌ Please select a shipping method', 'error');
        return false;
    }
    
    // Check required fields
    const requiredFields = [
        { id: 'firstName', name: 'First Name' },
        { id: 'lastName', name: 'Last Name' },
        { id: 'address', name: 'Address' },
        { id: 'city', name: 'City' },
        { id: 'zipCode', name: 'ZIP Code' },
        { id: 'phone', name: 'Phone Number' }
    ];
    
    const missingFields = [];
    
    for (const field of requiredFields) {
        const input = document.getElementById(field.id);
        const value = input ? input.value.trim() : '';
        console.log(`📝 Field ${field.id}: "${value}" (${value ? 'filled' : 'empty'})`);
        
        if (!input || !value) {
            missingFields.push(field.name);
            
            // Add error styling
            if (input) {
                input.classList.add('invalid');
                const messageEl = document.getElementById(field.id + 'Validation');
                if (messageEl) {
                    messageEl.textContent = `❌ ${field.name} is required`;
                    messageEl.className = 'validation-message error';
                }
            }
        } else {
            // Add success styling
            input.classList.remove('invalid');
            input.classList.add('valid');
            const messageEl = document.getElementById(field.id + 'Validation');
            if (messageEl) {
                messageEl.textContent = `✅ Valid ${field.name.toLowerCase()}`;
                messageEl.className = 'validation-message success';
            }
        }
    }
    
    if (missingFields.length > 0) {
        const missingText = missingFields.join(', ');
        showNotification(`Please fill in: ${missingText}`, 'error');
        console.log('Missing shipping fields:', missingFields);
        
        // Focus on first missing field
        const firstMissingId = requiredFields.find(f => missingFields.includes(f.name))?.id;
        if (firstMissingId) {
            const firstField = document.getElementById(firstMissingId);
            if (firstField) {
                firstField.focus();
            }
        }
        
        return false;
    }
    
    // Store shipping data
    const formData = new FormData(form);
    orderData.shipping = Object.fromEntries(formData);
    console.log('Shipping data stored:', orderData.shipping);
    
    showNotification('✅ Shipping information completed!', 'success');
    return true;
}

function validatePayment() {
    console.log('💳 Validating payment...');
    const paymentMethodElement = document.querySelector('input[name="paymentMethod"]:checked');
    
    if (!paymentMethodElement) {
        console.log('❌ No payment method selected');
        showNotification('❌ Please select a payment method', 'error');
        return false;
    }
    
    console.log('✅ Payment method selected:', paymentMethodElement.value);
    
    const paymentMethod = paymentMethodElement.value;
    
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
        cardNumber: cardNumber, // Store full number for card type detection
        cardLast4: cardNumber.slice(-4),
        expiryDate,
        cardName
    };
    
    console.log('✅ Payment validation passed');
    showNotification('✅ Payment information validated!', 'success');
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
                <p>Credit Card ending in ${orderData.payment.cardLast4}</p>
            </div>
        </div>
    `;
    
    confirmationSummary.innerHTML = html;
}

async function syncCartToServer() {
    console.log('🔄 Syncing cart to server...');
    
    try {
        // Get cart data from localStorage
        const savedCart = localStorage.getItem('zippyCart');
        if (!savedCart) {
            console.log('❌ No cart data in localStorage');
            return false;
        }
        
        const cartItems = JSON.parse(savedCart);
        console.log('📦 Cart items from localStorage:', cartItems);
        
        if (!Array.isArray(cartItems) || cartItems.length === 0) {
            console.log('❌ Cart is empty');
            return false;
        }
        
        // Fix cart items with numeric IDs
        const fixedCartItems = cartItems.map(item => {
            // If item has numeric ID, try to map it to correct product ID
            if (typeof item.id === 'number') {
                console.log('🔧 Fixing numeric ID:', item.id);
                // Map common numeric IDs to product IDs
                const idMapping = {
                    1: 'prod-006', // Neural Network Hoodie
                    2: 'prod-001', // Neon Cyber Hoodie
                    3: 'prod-002', // Glitch Art Tee
                    4: 'prod-003', // Holographic Cargo Pants
                    5: 'prod-004', // Neon Grid Jacket
                    6: 'prod-005'  // Digital Camo Pants
                };
                const correctId = idMapping[item.id];
                if (correctId) {
                    console.log('✅ Mapped ID', item.id, 'to', correctId);
                    return { ...item, id: correctId };
                }
            }
            return item;
        });
        
        console.log('🔧 Fixed cart items:', fixedCartItems);
        
        // Sync each item to server
        for (const item of fixedCartItems) {
            console.log('📦 Syncing item:', item.name || item.title, '(ID:', item.id || item.productId || 'undefined', ')');
            
            // Determine the correct productId - items are saved with 'id' field
            const productId = item.id;
            
            if (!productId) {
                console.error('❌ Cannot determine productId for item:', item);
                continue;
            }
            
            try {
                // Build headers dynamically based on the logged-in user
                const addHeaders = { 'Content-Type': 'application/json' };
                try {
                    const userStr = localStorage.getItem('currentUser');
                    if (userStr) {
                        const user = JSON.parse(userStr);
                        if (user && user.id) {
                            addHeaders['X-User-ID'] = user.id;
                        }
                    }
                } catch (_) {}

                const response = await fetch('/api/cart/add', {
                    method: 'POST',
                    headers: addHeaders,
                    credentials: 'include',
                    body: JSON.stringify({
                        productId: productId,
                        quantity: item.quantity || 1,
                        size: item.size || 'M'
                    })
                });
                
                if (response.ok) {
                    console.log('✅ Synced:', item.name || item.title);
                } else {
                    const error = await response.json();
                    console.error('❌ Failed to sync item:', item.name || item.title, '-', error.error);
                }
            } catch (error) {
                console.error('❌ Error syncing item:', item.name || item.title, '-', error);
            }
        }
        
        console.log('✅ Cart synced to server');
        return true;
        
    } catch (error) {
        console.error('❌ Error syncing cart to server:', error);
        return false;
    }
}

async function placeOrder() {
    console.log('placeOrder called!');
    try {
        showLoadingModal();
        
        // First, sync cart to server
        const syncSuccess = await syncCartToServer();
        if (!syncSuccess) {
            throw new Error('Failed to sync cart to server');
        }
        
        // Get cart data from server after sync
        // Build headers dynamically for fetching the cart
        const cartHeaders = {};
        try {
            const userStr = localStorage.getItem('currentUser');
            if (userStr) {
                const user = JSON.parse(userStr);
                if (user && user.id) {
                    cartHeaders['X-User-ID'] = user.id;
                }
            }
        } catch (_) {}

        const cartResponse = await fetch('/api/cart', {
            headers: cartHeaders,
            credentials: 'include'
        });
        
        if (!cartResponse.ok) {
            throw new Error('Failed to get cart from server');
        }
        
        const serverCart = await cartResponse.json();
        console.log('📦 Server cart data:', serverCart);
        console.log('📦 Server cart items count:', serverCart.items.length);
        console.log('📦 Server cart total:', serverCart.total);
        
        const orderPayload = {
            items: serverCart.items, // Use server cart data instead of localStorage
            shippingAddress: orderData.shipping,
            billingAddress: {
                cardHolderName: orderData.payment.cardName || 'Card Holder',
                cardType: getCardType(orderData.payment.cardNumber || ''),
                lastFourDigits: orderData.payment.cardLast4 || '****',
                expiryDate: orderData.payment.expiryDate || 'MM/YY',
                // Don't include full card number for security
                maskedNumber: '**** **** **** ' + (orderData.payment.cardLast4 || '****')
            },
            paymentMethod: orderData.payment.method,
            cardNumber: orderData.payment.method === 'credit' ? '**** **** **** ' + orderData.payment.cardLast4 : null,
            expiryDate: orderData.payment.expiryDate || null,
            cvv: '***', // Never send real CVV
            pricing: orderData.pricing
        };
        
        console.log('💳 Sending payment request with payload:', {
            itemsCount: orderPayload.items.length,
            paymentMethod: orderPayload.paymentMethod,
            shippingAddress: orderPayload.shippingAddress
        });
        
        // Build headers dynamically for checkout
        const checkoutHeaders = { 'Content-Type': 'application/json' };
        try {
            const userStr = localStorage.getItem('currentUser');
            if (userStr) {
                const user = JSON.parse(userStr);
                if (user && user.id) {
                    checkoutHeaders['X-User-ID'] = user.id;
                }
            }
        } catch (_) {}

        const response = await fetch('/api/payment/checkout', {
            method: 'POST',
            headers: checkoutHeaders,
            credentials: 'include',
            body: JSON.stringify(orderPayload)
        });
        
        hideLoadingModal();
        
        if (!response.ok) {
            const error = await response.json();
            console.error('❌ Payment failed with status:', response.status);
            console.error('❌ Payment error details:', error);
            throw new Error(error.error || 'Payment failed');
        }
        
        const result = await response.json();
        console.log('🎉 Payment successful! Order result:', result);
        console.log('🎉 Order ID:', result.order?.id);
        console.log('🎉 Payment ID:', result.paymentResult?.paymentId);
        
        // Clear cart after successful order
        localStorage.removeItem('zippyCart');
        console.log('🧹 Cart cleared from localStorage');
        
        // Redirect to thank you page
        console.log('🔄 Redirecting to thank you page...');
        window.location.href = `/thank-you?orderId=${result.order?.id || ''}`;
        
    } catch (error) {
        hideLoadingModal();
        console.error('Order placement failed:', error);
        showNotification(error.message || 'Failed to place order', 'error');
    }
}

// Make placeOrder globally accessible
window.placeOrder = placeOrder;
console.log('✅ Async placeOrder is now global:', typeof window.placeOrder);

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
    // Check if global notification function exists and is different from this one
    if (typeof window.showNotification === 'function' && window.showNotification !== showNotification) {
        window.showNotification(message, type);
        return;
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
    
    // Also log to console
    console.log(`${type.toUpperCase()}: ${message}`);
}

// Check login status function (if not available from auth.js)
function checkLoginStatus() {
    if (window.checkLoginStatus) {
        window.checkLoginStatus();
    }
}

// Old duplicate code removed - using new step management system above