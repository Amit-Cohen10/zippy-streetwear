// Payment functionality - Project requirement: Pay screen - fill payment details and click pay
// Project requirement: Note that it's a fake payment
console.log('Payment system loaded');

// Initialize payment system
function initPayment() {
    console.log('Payment system initialized');
}

// Proceed to checkout
function proceedToCheckout() {
    console.log('Proceeding to checkout...');
    // Redirect to checkout page
    window.location.href = '/checkout';
}

// Open payment modal
function openPaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

// Close payment modal
function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Process payment
function processPayment(paymentData) {
    console.log('Processing payment...', paymentData);
    // This would normally send data to the server
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ success: true, orderId: Math.random().toString(36).substr(2, 9) });
        }, 2000);
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initPayment();
});