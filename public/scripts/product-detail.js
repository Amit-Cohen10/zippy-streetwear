// Product Detail Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Only run on product detail page
    if (!window.location.pathname.includes('product-detail')) {
        return;
    }

    // Product data - replace with actual API call
    const products = {
        1: {
            id: 1,
            name: "Neural Network Hoodie",
            price: 459,
            category: "hoodies",
            status: "available",
            description: "Experience the future of streetwear with this cutting-edge neural network design. Crafted with premium materials and featuring our signature cyberpunk aesthetic with LED-embedded circuit patterns.",
            images: [
                "/images/products/neural-network-hoodie.jpg",
                "/images/products/neural-network-hoodie-2.jpg",
                "/images/products/neural-network-hoodie-3.jpg",
                "/images/products/neural-network-hoodie-4.jpg"
            ],
            sizes: ["XS", "S", "M", "L", "XL", "XXL"],
            specifications: {
                "Material": "Premium Cotton Blend with LED Elements",
                "Weight": "320g",
                "Fit": "Regular with slight oversize",
                "Care": "Machine wash cold, tumble dry low",
                "Features": "LED circuit patterns, neon accents, reflective details",
                "Origin": "Designed in Neo Tokyo, Made in Japan"
            },
            reviews: [
                {
                    author: "CyberUser_42",
                    rating: 5,
                    comment: "Amazing quality and the LED effects are incredible! The neural network pattern is so unique."
                },
                {
                    author: "NeonLover",
                    rating: 5,
                    comment: "Perfect fit and the cyberpunk aesthetic is on point! The quality is outstanding."
                },
                {
                    author: "StreetGuru",
                    rating: 4,
                    comment: "Great design and comfortable fit. The LED elements really make it stand out."
                }
            ]
        },
        2: {
            id: 2,
            name: "Glitch Reality Hoodie",
            price: 429,
            category: "hoodies",
            status: "sold-out",
            description: "Embrace the digital distortion with this glitch reality hoodie. Features corrupted graphics and neon glitch effects that create a truly unique cyberpunk aesthetic.",
            images: [
                "/images/products/glitch-reality-hoodie.jpg",
                "/images/products/glitch-reality-hoodie-2.jpg",
                "/images/products/glitch-reality-hoodie-3.jpg"
            ],
            sizes: ["S", "M", "L", "XL"],
            specifications: {
                "Material": "Premium Cotton Blend",
                "Weight": "300g",
                "Fit": "Oversized",
                "Care": "Machine wash cold",
                "Features": "Glitch graphics, neon accents, digital distortion effects",
                "Origin": "Designed in Cyber City, Made in Korea"
            },
            reviews: []
        }
    };

    let currentProduct = null;
    let selectedSize = 'M';
    let quantity = 1;

    // Initialize the page
    function init() {
        loadProductData();
        setupEventListeners();
        setupTabs();
    }

    // Load product data from URL
    function loadProductData() {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id') || '1';
        
        currentProduct = products[productId] || products[1];
        displayProduct(currentProduct);
    }

    // Display product information
    function displayProduct(product) {
        // Update breadcrumb and title
        document.getElementById('productName').textContent = product.name;
        document.title = `${product.name} - Zippy Streetwear`;

        // Update main product info
        document.getElementById('productTitle').textContent = product.name;
        document.getElementById('productPrice').textContent = `${product.price} NIS`;
        document.getElementById('productDescription').textContent = product.description;

        // Update status
        const statusElement = document.getElementById('productStatus');
        if (product.status === 'sold-out') {
            statusElement.textContent = 'SOLD OUT';
            statusElement.style.display = 'block';
        } else {
            statusElement.style.display = 'none';
        }

        // Load main image
        const mainImage = document.getElementById('mainProductImage');
        mainImage.src = product.images[0];
        mainImage.alt = product.name;

        // Create thumbnail gallery
        createThumbnailGallery(product.images);

        // Load specifications
        loadSpecifications(product.specifications);

        // Load reviews
        loadReviews(product.reviews);

        // Load related products
        loadRelatedProducts(product.id);
    }

    // Create thumbnail gallery
    function createThumbnailGallery(images) {
        const gallery = document.getElementById('thumbnailGallery');
        gallery.innerHTML = images.map((image, index) => `
            <div class="thumbnail ${index === 0 ? 'active' : ''}" onclick="changeMainImage('${image}', this)">
                <img src="${image}" alt="Product thumbnail" onerror="this.src='/images/placeholder-product.jpg'">
            </div>
        `).join('');
    }

    // Change main image
    function changeMainImage(imageSrc, thumbnailElement) {
        const mainImage = document.getElementById('mainProductImage');
        mainImage.src = imageSrc;

        // Update active thumbnail
        document.querySelectorAll('.thumbnail').forEach(thumb => {
            thumb.classList.remove('active');
        });
        if (thumbnailElement) {
            thumbnailElement.classList.add('active');
        }
    }

    // Load specifications
    function loadSpecifications(specs) {
        const specsContainer = document.querySelector('.spec-grid');
        if (specsContainer) {
            specsContainer.innerHTML = Object.entries(specs).map(([key, value]) => `
                <div class="spec-item">
                    <span class="spec-label">${key}:</span>
                    <span class="spec-value">${value}</span>
                </div>
            `).join('');
        }
    }

    // Load reviews
    function loadReviews(reviews) {
        const reviewsContainer = document.querySelector('.reviews-list');
        if (reviewsContainer) {
            if (reviews.length === 0) {
                reviewsContainer.innerHTML = `
                    <div class="review-item">
                        <p class="review-text">No reviews yet. Be the first to review this product!</p>
                    </div>
                `;
            } else {
                reviewsContainer.innerHTML = reviews.map(review => `
                    <div class="review-item">
                        <div class="review-header">
                            <span class="reviewer-name">${review.author}</span>
                            <span class="review-rating">${'⭐'.repeat(review.rating)}</span>
                        </div>
                        <p class="review-text">${review.comment}</p>
                    </div>
                `).join('');
            }
        }
    }

    // Load related products
    function loadRelatedProducts(currentProductId) {
        const relatedProducts = Object.values(products).filter(p => p.id !== parseInt(currentProductId)).slice(0, 4);
        const relatedGrid = document.getElementById('relatedProducts');
        
        if (relatedGrid) {
            relatedGrid.innerHTML = relatedProducts.map(product => `
                <div class="related-item" onclick="viewProduct(${product.id})">
                    <img src="${product.images[0]}" alt="${product.name}" onerror="this.src='/images/placeholder-product.jpg'">
                    <div class="related-item-info">
                        <div class="related-item-name">${product.name}</div>
                        <div class="related-item-price">${product.price} NIS</div>
                    </div>
                </div>
            `).join('');
        }
    }

    // Setup event listeners
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
        document.getElementById('decreaseQuantity').addEventListener('click', function() {
            const input = document.getElementById('quantityInput');
            const currentValue = parseInt(input.value);
            if (currentValue > 1) {
                input.value = currentValue - 1;
                quantity = currentValue - 1;
            }
        });

        document.getElementById('increaseQuantity').addEventListener('click', function() {
            const input = document.getElementById('quantityInput');
            const currentValue = parseInt(input.value);
            if (currentValue < 10) {
                input.value = currentValue + 1;
                quantity = currentValue + 1;
            }
        });

        document.getElementById('quantityInput').addEventListener('change', function() {
            quantity = parseInt(this.value) || 1;
        });

        // Action buttons
        document.getElementById('addToCartBtn').addEventListener('click', addToCart);
        document.getElementById('buyNowBtn').addEventListener('click', buyNow);

        // Image zoom
        document.getElementById('mainProductImage').addEventListener('click', function() {
            // Create lightbox effect
            const lightbox = document.createElement('div');
            lightbox.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                cursor: pointer;
            `;
            
            const img = document.createElement('img');
            img.src = this.src;
            img.style.cssText = `
                max-width: 90%;
                max-height: 90%;
                object-fit: contain;
            `;
            
            lightbox.appendChild(img);
            document.body.appendChild(lightbox);
            
            lightbox.addEventListener('click', function() {
                document.body.removeChild(lightbox);
            });
        });
    }

    // Setup tabs
    function setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabPanels = document.querySelectorAll('.tab-panel');

        tabButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const targetTab = this.dataset.tab;
                
                // Update active button
                tabButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Update active panel
                tabPanels.forEach(panel => {
                    panel.classList.remove('active');
                    if (panel.id === targetTab) {
                        panel.classList.add('active');
                    }
                });
            });
        });
    }

    // Add to cart
    function addToCart() {
        if (!currentProduct) return;
        
        if (currentProduct.status === 'sold-out') {
            showNotification('This product is sold out!', 'error');
            return;
        }

        const cartItem = {
            id: currentProduct.id,
            name: currentProduct.name,
            price: currentProduct.price,
            size: selectedSize,
            quantity: quantity,
            image: currentProduct.images[0],
            description: currentProduct.description
        };

        // Show the new modal instead of direct add
        showAddToCartModal(cartItem);
    }

    // Buy now
    function buyNow() {
        if (!currentProduct) return;
        
        if (currentProduct.status === 'sold-out') {
            showNotification('This product is sold out!', 'error');
            return;
        }

        const cartItem = {
            id: currentProduct.id,
            name: currentProduct.name,
            price: currentProduct.price,
            size: selectedSize,
            quantity: quantity,
            image: currentProduct.images[0],
            description: currentProduct.description
        };

        // Use the direct order function
        directOrder(cartItem);
    }

    // Initialize the page
    init();
});

// Global functions for external access
function changeMainImage(imageSrc, thumbnailElement) {
    const mainImage = document.getElementById('mainProductImage');
    if (mainImage) {
        mainImage.src = imageSrc;
    }

    // Update active thumbnail
    document.querySelectorAll('.thumbnail').forEach(thumb => {
        thumb.classList.remove('active');
    });
    if (thumbnailElement) {
        thumbnailElement.classList.add('active');
    }
}

function viewProduct(productId) {
    window.location.href = `/product-detail.html?id=${productId}`;
} 