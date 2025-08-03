// Product Detail Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Only run on product detail page
    if (!window.location.pathname.includes('product-detail')) {
        return;
    }
    
    // Wait a bit for global functions to be available
    setTimeout(() => {
        console.log('Product detail - Global functions check:', {
            showAddToCartModal: typeof window.showAddToCartModal,
            directOrder: typeof window.directOrder,
            showNotification: typeof window.showNotification,
            updateCartCountLocal: typeof window.updateCartCountLocal
        });
    }, 100);

    let currentProduct = null;
    let selectedSize = 'M';
    let quantity = 1;

    // Load product data from server
    async function loadProductFromServer(productId) {
        try {
            const response = await fetch('/api/products?limit=50&page=1');
            if (response.ok) {
                const data = await response.json();
                const product = (data.products || []).find(p => p.id === productId);
                
                if (product) {
                    return {
                        id: product.id,
                        name: product.title,
                        price: product.price,
                        category: product.category,
                        status: "available",
                        description: product.description,
                        images: product.images || ["/images/placeholder.jpg"],
                        sizes: product.sizes || ["S", "M", "L", "XL"],
                        specifications: {
                            "Material": "Premium Cotton Blend",
                            "Weight": "320g",
                            "Fit": "Regular",
                            "Care": "Machine wash cold",
                            "Features": "Premium quality, comfortable fit",
                            "Origin": "Designed in Israel"
                        },
                        reviews: [
                            {
                                author: "User_1",
                                rating: 5,
                                comment: "Great quality and comfortable fit!"
                            },
                            {
                                author: "User_2",
                                rating: 4,
                                comment: "Love the design and material."
                            }
                        ]
                    };
                }
            }
        } catch (error) {
            console.error('Error loading product:', error);
        }
        
        // Fallback product if not found
        return {
            id: productId,
            name: "Product Not Found",
            price: 0,
            category: "unknown",
            status: "unavailable",
            description: "This product could not be loaded.",
            images: ["/images/placeholder.jpg"],
            sizes: ["M"],
            specifications: {},
            reviews: []
        };
    }

    // Initialize the page
    async function init() {
        await loadProductData();
        setupEventListeners();
        setupTabs();
        
        // Debug: Check if global functions are available
        console.log('Product detail init - checking global functions:', {
            showAddToCartModal: typeof window.showAddToCartModal,
            directOrder: typeof window.directOrder,
            showNotification: typeof window.showNotification,
            updateCartCountLocal: typeof window.updateCartCountLocal
        });
    }

    // Load product data from URL
    async function loadProductData() {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id') || 'prod-001';
        
        currentProduct = await loadProductFromServer(productId);
        displayProduct(currentProduct);
    }

    // Display product information
    function displayProduct(product) {
        // Update breadcrumb and title
        document.getElementById('productName').textContent = product.name;
        document.title = `${product.name} - Zippy Streetwear`;

        // Update product title and price
        document.getElementById('productTitle').textContent = product.name;
        document.getElementById('productPrice').textContent = `$${product.price.toFixed(2)}`;
        document.getElementById('productDescription').textContent = product.description;

        // Update product status
        const statusElement = document.getElementById('productStatus');
        if (product.status === 'sold-out') {
            statusElement.textContent = 'Sold Out';
            statusElement.className = 'product-status sold-out';
        } else {
            statusElement.textContent = 'In Stock';
            statusElement.className = 'product-status in-stock';
        }

        // Load main image
        const mainImage = document.getElementById('mainProductImage');
        if (product.images && product.images.length > 0) {
            mainImage.src = product.images[0];
            mainImage.alt = product.name;
        }

        // Create thumbnail gallery
        createThumbnailGallery(product.images);

        // Load specifications
        loadSpecifications(product.specifications);

        // Load reviews
        loadReviews(product.reviews);

        // Load related products
        loadRelatedProducts(product.id);
    }

    function createThumbnailGallery(images) {
        const gallery = document.getElementById('thumbnailGallery');
        if (!gallery) return;

        gallery.innerHTML = '';
        images.forEach((image, index) => {
            const thumbnail = document.createElement('div');
            thumbnail.className = 'thumbnail-item';
            thumbnail.onclick = () => changeMainImage(image, thumbnail);
            
            const img = document.createElement('img');
            img.src = image;
            img.alt = `Product image ${index + 1}`;
            
            thumbnail.appendChild(img);
            gallery.appendChild(thumbnail);
        });
    }

    function changeMainImage(imageSrc, thumbnailElement) {
        const mainImage = document.getElementById('mainProductImage');
        mainImage.src = imageSrc;
        
        // Update active thumbnail
        document.querySelectorAll('.thumbnail-item').forEach(item => {
            item.classList.remove('active');
        });
        thumbnailElement.classList.add('active');
    }

    function loadSpecifications(specs) {
        const specsContainer = document.getElementById('specificationsList');
        if (!specsContainer) return;

        specsContainer.innerHTML = '';
        Object.entries(specs).forEach(([key, value]) => {
            const specItem = document.createElement('div');
            specItem.className = 'spec-item';
            specItem.innerHTML = `
                <span class="spec-label">${key}:</span>
                <span class="spec-value">${value}</span>
            `;
            specsContainer.appendChild(specItem);
        });
    }

    function loadReviews(reviews) {
        const reviewsContainer = document.getElementById('reviewsList');
        if (!reviewsContainer) return;

        if (reviews.length === 0) {
            reviewsContainer.innerHTML = '<p class="no-reviews">No reviews yet. Be the first to review this product!</p>';
            return;
        }

        reviewsContainer.innerHTML = '';
        reviews.forEach(review => {
            const reviewItem = document.createElement('div');
            reviewItem.className = 'review-item';
            reviewItem.innerHTML = `
                <div class="review-header">
                    <span class="review-author">${review.author}</span>
                    <div class="review-rating">
                        ${'⭐'.repeat(review.rating)}
                    </div>
                </div>
                <p class="review-comment">${review.comment}</p>
            `;
            reviewsContainer.appendChild(reviewItem);
        });
    }

    function loadRelatedProducts(currentProductId) {
        // This would typically load from an API
        // For now, we'll show a placeholder
        const relatedContainer = document.getElementById('relatedProducts');
        if (relatedContainer) {
            relatedContainer.innerHTML = '<p class="no-related">Related products will be loaded here.</p>';
        }
    }

    function setupEventListeners() {
        // Size selection
        document.querySelectorAll('.size-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                selectedSize = this.dataset.size;
            });
        });

        // Quantity controls
        const decreaseBtn = document.getElementById('decreaseQuantity');
        const increaseBtn = document.getElementById('increaseQuantity');
        const quantityInput = document.getElementById('quantityInput');

        if (decreaseBtn) {
            decreaseBtn.addEventListener('click', () => {
                if (quantity > 1) {
                    quantity--;
                    quantityInput.value = quantity;
                }
            });
        }

        if (increaseBtn) {
            increaseBtn.addEventListener('click', () => {
                if (quantity < 10) {
                    quantity++;
                    quantityInput.value = quantity;
                }
            });
        }

        if (quantityInput) {
            quantityInput.addEventListener('change', () => {
                quantity = parseInt(quantityInput.value) || 1;
                quantity = Math.max(1, Math.min(10, quantity));
                quantityInput.value = quantity;
            });
        }

        // Add to cart button
        const addToCartBtn = document.getElementById('addToCartBtn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', addToCart);
        }

        // Buy now button
        const buyNowBtn = document.getElementById('buyNowBtn');
        if (buyNowBtn) {
            buyNowBtn.addEventListener('click', buyNow);
        }

        // Image zoom
        const mainImage = document.getElementById('mainProductImage');
        if (mainImage) {
            mainImage.addEventListener('click', () => {
                // Implement image zoom functionality
                console.log('Image zoom clicked');
            });
        }
    }

    function setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.dataset.tab;
                
                // Update active tab button
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Show target tab content
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === targetTab) {
                        content.classList.add('active');
                    }
                });
            });
        });
    }

    function addToCart() {
        if (!currentProduct) return;

        const cartItem = {
            id: currentProduct.id,
            name: currentProduct.name,
            price: currentProduct.price,
            size: selectedSize,
            quantity: quantity,
            image: currentProduct.images[0]
        };

        // Show the modal instead of direct add
        if (typeof window.showAddToCartModal === 'function') {
            // Convert to the format expected by showAddToCartModal
            const modalProduct = {
                ...cartItem,
                title: cartItem.name,
                images: [cartItem.image]
            };
            window.showAddToCartModal(modalProduct);
        } else {
            // Fallback to direct add if modal function not available
            const cart = JSON.parse(localStorage.getItem('zippyCart') || '[]');
            
            // Check if item already exists with same size
            const existingIndex = cart.findIndex(item => 
                item.id === cartItem.id && item.size === cartItem.size
            );

            if (existingIndex !== -1) {
                cart[existingIndex].quantity += quantity;
            } else {
                cart.push(cartItem);
            }

            // Save to localStorage
            localStorage.setItem('zippyCart', JSON.stringify(cart));
            
            // Update cart count
            updateCartCount();
            
            // Show success message
            showNotification('Added to cart successfully!', 'success');
            
            // Update auth UI to ensure login status is correct
            if (typeof window.updateAuthUI === 'function') {
                setTimeout(() => {
                    window.updateAuthUI();
                }, 100);
            }
        }
    }

    function buyNow() {
        if (!currentProduct) return;

        const cartItem = {
            id: currentProduct.id,
            name: currentProduct.name,
            price: currentProduct.price,
            size: selectedSize,
            quantity: quantity,
            image: currentProduct.images[0]
        };

        // Use the direct order function if available
        if (typeof window.directOrder === 'function') {
            // Convert to the format expected by directOrder
            const modalProduct = {
                ...cartItem,
                title: cartItem.name,
                images: [cartItem.image]
            };
            window.directOrder(modalProduct);
        } else {
            // Fallback to add to cart and redirect
            addToCart();
            setTimeout(() => {
                window.location.href = '/cart';
            }, 1000);
        }
    }

    function updateCartCount() {
        // Use the global function if available
        if (typeof window.updateCartCountLocal === 'function') {
            window.updateCartCountLocal();
        } else {
            // Fallback to local implementation
            const cart = JSON.parse(localStorage.getItem('zippyCart') || '[]');
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            
            const cartCount = document.getElementById('cartCount');
            if (cartCount) {
                cartCount.textContent = totalItems;
            }
        }
        
        // Update auth UI to ensure login status is correct
        if (typeof window.updateAuthUI === 'function') {
            setTimeout(() => {
                window.updateAuthUI();
            }, 100);
        }
    }

    function showNotification(message, type = 'info') {
        // Use the global function if available
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
        } else {
            // Fallback to local implementation
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'error' ? '#ff4444' : type === 'success' ? '#00ff00' : '#00ffff'};
                color: #000;
                padding: 1rem 2rem;
                border-radius: 4px;
                z-index: 10000;
                font-weight: bold;
                box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                if (notification && notification.parentNode) {
                    notification.remove();
                }
            }, 3000);
        }
    }

    // Initialize the page
    init();
    
    // Additional check after a delay to ensure functions are available
    setTimeout(() => {
        console.log('Product detail - Final functions check:', {
            showAddToCartModal: typeof window.showAddToCartModal,
            directOrder: typeof window.directOrder,
            showNotification: typeof window.showNotification,
            updateCartCountLocal: typeof window.updateCartCountLocal,
            addToCartAndClose: typeof window.addToCartAndClose
        });
        
        // Update auth UI to ensure login status is correct
        if (typeof window.updateAuthUI === 'function') {
            window.updateAuthUI();
        }
    }, 500);
});

// Global functions for external use
function changeMainImage(imageSrc, thumbnailElement) {
    const mainImage = document.getElementById('mainProductImage');
    if (mainImage) {
        mainImage.src = imageSrc;
    }
    
    // Update active thumbnail
    document.querySelectorAll('.thumbnail-item').forEach(item => {
        item.classList.remove('active');
    });
    if (thumbnailElement) {
        thumbnailElement.classList.add('active');
    }
}

function viewProduct(productId) {
    window.location.href = `/product-detail.html?id=${productId}`;
} 