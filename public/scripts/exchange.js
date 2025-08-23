// Exchange Page JavaScript - Project requirement: Additional pages with functionality that communicates with server
// Project requirement: Each page functionality must communicate with the server
document.addEventListener('DOMContentLoaded', function() {
    // Only run on exchange page
    if (!window.location.pathname.includes('exchange')) {
        return;
    }
    
    // Setup admin access checks
    setTimeout(() => {
        if (typeof setupAdminAccessChecks === 'function') {
            setupAdminAccessChecks();
        }
    }, 1000);

    // Sample data for 3 fictional users
    const users = [
        { id: 1, name: "CyberVibes", avatar: "👨‍💻", color: "#00ffff" },
        { id: 2, name: "NeonQueen", avatar: "👩‍🎨", color: "#ff00ff" },
        { id: 3, name: "StreetTech", avatar: "🧑‍🔧", color: "#00ff00" }
    ];

    // Load products data for exchange
    let products = [];
    
    // Function to load products
    async function loadProducts() {
        try {
            // Try to load from API first
            const apiResponse = await fetch('/api/products?limit=50&page=1');
            if (apiResponse.ok) {
                const data = await apiResponse.json();
                products = (data.products || []).map(product => ({
                    id: product.id,
                    title: product.title,
                    name: product.title, // Add name for compatibility
                    price: product.price,
                    category: product.category,
                    image: product.images && product.images.length > 0 ? product.images[0] : '/images/placeholder.svg',
                    brand: product.brand,
                    sizes: product.sizes
                }));
                console.log('✅ Products loaded from API:', products.length);
                console.log('📦 First few API products:', products.slice(0, 3).map(p => ({ id: p.id, title: p.title, name: p.name })));
            } else {
                // Fallback to local JSON
                const response = await fetch('/data/products/products.json');
                if (response.ok) {
                    products = await response.json();
                    console.log('✅ Products loaded from local JSON:', products.length);
                    console.log('📦 First few JSON products:', products.slice(0, 3).map(p => ({ id: p.id, title: p.title, name: p.name })));
                } else {
                    throw new Error('Failed to load products from server');
                }
            }
        } catch (error) {
            console.error('❌ Error loading products:', error);
            // Fallback to sample products if fetch fails
            products = [
                {
                    id: "Circuit Board Hoodie",
                    title: "Circuit Board Hoodie",
                    images: ["/images/products/Circuit Board Hoodie/Circuit Board Hoodie.png"],
                    category: "hoodies",
                    sizes: ["S", "M", "L", "XL"],
                    brand: "Zippy Originals"
                },
                {
                    id: "404 Not Found Tee", 
                    title: "404 Not Found Tee",
                    images: ["/images/products/404 Not Found Tee/404 Not Found Tee.png"],
                    category: "t-shirts",
                    sizes: ["S", "M", "L", "XL", "XXL"],
                    brand: "Street Tech"
                },
                {
                    id: "Neon Cargo Pants",
                    title: "Neon Cargo Pants", 
                    images: ["/images/products/Neon Cargo Pants/Neon Cargo Pants.png"],
                    category: "pants",
                    sizes: ["28", "30", "32", "34", "36"],
                    brand: "Future Wear"
                },
                {
                    id: "Circuit Pattern Hoodie",
                    title: "Circuit Pattern Hoodie",
                    images: ["/images/products/Circuit Pattern Hoodie/Circuit Pattern Hoodie.png"],
                    category: "hoodies",
                    sizes: ["S", "M", "L", "XL"],
                    brand: "Zippy Originals"
                },
                {
                    id: "Circuit Breaker Pants",
                    title: "Circuit Breaker Pants",
                    images: ["/images/products/Circuit Breaker Pants/Circuit Breaker Pants.png"],
                    category: "pants",
                    sizes: ["S", "M", "L", "XL"],
                    brand: "Street Tech"
                },
                {
                    id: "Neural Network Hoodie",
                    title: "Neural Network Hoodie",
                    images: ["/images/products/Neural Network Hoodie/Neural Network Hoodie.png"],
                    category: "hoodies",
                    sizes: ["S", "M", "L", "XL", "XXL"],
                    brand: "Zippy Originals"
                },
                {
                    id: "Cyber Samurai Hoodie",
                    title: "Cyber Samurai Hoodie",
                    images: ["/images/products/Cyber Samurai Hoodie/Cyber Samurai Hoodie.png"],
                    category: "hoodies",
                    sizes: ["S", "M", "L", "XL"],
                    brand: "Zippy Originals"
                },
                {
                    id: "Crypto Punk Tee",
                    title: "Crypto Punk Tee",
                    images: ["/images/products/Crypto Punk Tee/Crypto Punk Tee.png"],
                    category: "t-shirts",
                    sizes: ["S", "M", "L", "XL", "XXL"],
                    brand: "Street Tech"
                },
                {
                    id: "SYSTEM OVERRIDE Tee",
                    title: "SYSTEM OVERRIDE Tee",
                    images: ["/images/products/SYSTEM OVERRIDE Tee/SYSTEM OVERRIDE Tee.png"],
                    category: "t-shirts",
                    sizes: ["S", "M", "L", "XL"],
                    brand: "Street Tech"
                },
                {
                    id: "Quantum Circuit Hoodie",
                    title: "Quantum Circuit Hoodie",
                    images: ["/images/products/Quantum Circuit Hoodie/Quantum Circuit Hoodie.png"],
                    category: "hoodies",
                    sizes: ["S", "M", "L", "XL", "XXL"],
                    brand: "Zippy Originals"
                },
                {
                    id: "Code Cargo Pants",
                    title: "Code Cargo Pants",
                    images: ["/images/products/Code Cargo Pants/Code Cargo Pants.png"],
                    category: "pants",
                    sizes: ["S", "M", "L", "XL"],
                    brand: "Future Wear"
                },
                {
                    id: "Digital Glitch Tee",
                    title: "Digital Glitch Tee",
                    images: ["/images/products/Digital Glitch Tee/Digital Glitch Tee.png"],
                    category: "t-shirts",
                    sizes: ["28", "30", "32", "34", "36"],
                    brand: "Future Wear"
                },
                {
                    id: "Code Warrior Tee",
                    title: "Code Warrior Tee",
                    images: ["/images/products/Code Warrior Tee/Code Warrior Tee.png"],
                    category: "t-shirts",
                    sizes: ["S", "M", "L", "XL", "XXL"],
                    brand: "Street Tech"
                },
                {
                    id: "Vapor Dream Tee",
                    title: "Vapor Dream Tee",
                    images: ["/images/products/Vapor Dream Tee/Vapor Dream Tee.png"],
                    category: "t-shirts",
                    sizes: ["S", "M", "L", "XL", "XXL"],
                    brand: "Future Wear"
                },
                {
                    id: "Neon Pulse Tee",
                    title: "Neon Pulse Tee",
                    images: ["/images/products/Neon Pulse Tee/Neon Pulse Tee.png"],
                    category: "t-shirts",
                    sizes: ["S", "M", "L", "XL", "XXL"],
                    brand: "Street Tech"
                },
                {
                    id: "Electric Night Tee",
                    title: "Electric Night Tee",
                    images: ["/images/products/Electric Night Tee/Electric Night Tee.png"],
                    category: "t-shirts",
                    sizes: ["S", "M", "L", "XL", "XXL"],
                    brand: "Future Wear"
                },
                {
                    id: "Cyber Rose Tee",
                    title: "Cyber Rose Tee",
                    images: ["/images/products/Cyber Rose Tee/Cyber Rose Tee.png"],
                    category: "t-shirts",
                    sizes: ["S", "M", "L", "XL", "XXL"],
                    brand: "Street Tech"
                },
                {
                    id: "Augmented Tee",
                    title: "Augmented Tee",
                    images: ["/images/products/Augmented Tee/Augmented Tee.png"],
                    category: "t-shirts",
                    sizes: ["S", "M", "L", "XL", "XXL"],
                    brand: "Future Wear"
                },
                {
                    id: "Pixel Art Tee",
                    title: "Pixel Art Tee",
                    images: ["/images/products/Pixel Art Tee/Pixel Art Tee.png"],
                    category: "t-shirts",
                    sizes: ["S", "M", "L", "XL", "XXL"],
                    brand: "Street Tech"
                },
                {
                    id: "Glitch Reality Hoodie",
                    title: "Glitch Reality Hoodie",
                    images: ["/images/products/Glitch Reality Hoodie/Glitch Reality Hoodie.png"],
                    category: "hoodies",
                    sizes: ["S", "M", "L", "XL", "XXL"],
                    brand: "Zippy Originals"
                },
                {
                    id: "Neon Cyber Grid Hoodie",
                    title: "Neon Cyber Grid Hoodie",
                    images: ["/images/products/Neon Cyber Grid Hoodie/Neon Cyber Grid Hoodie.png"],
                    category: "hoodies",
                    sizes: ["S", "M", "L", "XL", "XXL"],
                    brand: "Zippy Originals"
                },
                {
                    id: "Quantum Hoodie",
                    title: "Quantum Hoodie",
                    images: ["/images/products/Quantum Hoodie/Quantum Hoodie.png"],
                    category: "hoodies",
                    sizes: ["S", "M", "L", "XL", "XXL"],
                    brand: "Zippy Originals"
                },
                {
                    id: "Urban Operator Pants",
                    title: "Urban Operator Pants",
                    images: ["/images/products/Urban Operator Pants/Urban Operator Pants.png"],
                    category: "pants",
                    sizes: ["S", "M", "L", "XL"],
                    brand: "Future Wear"
                },
                {
                    id: "Shadow Tech Pants",
                    title: "Shadow Tech Pants",
                    images: ["/images/products/Shadow Tech Pants/Shadow Tech Pants.png"],
                    category: "pants",
                    sizes: ["S", "M", "L", "XL"],
                    brand: "Street Tech"
                },
                {
                    id: "Neon Racer Pants",
                    title: "Neon Racer Pants",
                    images: ["/images/products/Neon Racer Pants/Neon Racer Pants.png"],
                    category: "pants",
                    sizes: ["S", "M", "L", "XL"],
                    brand: "Future Wear"
                },
                {
                    id: "Holo Flex Pants",
                    title: "Holo Flex Pants",
                    images: ["/images/products/Holo Flex Pants/Holo Flex Pants.png"],
                    category: "pants",
                    sizes: ["S", "M", "L", "XL"],
                    brand: "Street Tech"
                },
                {
                    id: "Grid Walker Pants",
                    title: "Grid Walker Pants",
                    images: ["/images/products/Grid Walker Pants/Grid Walker Pants.png"],
                    category: "pants",
                    sizes: ["S", "M", "L", "XL"],
                    brand: "Future Wear"
                },
                {
                    id: "Cyber Ninja Pants",
                    title: "Cyber Ninja Pants",
                    images: ["/images/products/Cyber Ninja Pants/Cyber Ninja Pants.png"],
                    category: "pants",
                    sizes: ["S", "M", "L", "XL"],
                    brand: "Street Tech"
                },
                {
                    id: "Data Runner Pants",
                    title: "Data Runner Pants",
                    images: ["/images/products/Data Runner Pants/Data Runner Pants.png"],
                    category: "pants",
                    sizes: ["S", "M", "L", "XL"],
                    brand: "Future Wear"
                }
            ];
            console.log('✅ Using fallback products:', products.length);
            console.log('📦 First few fallback products:', products.slice(0, 3).map(p => ({ id: p.id, title: p.title, name: p.name })));
            console.log('✅ Fallback products have real image paths');
        }
    }

    // Sample exchange data with real product references
    const exchanges = [
        {
            id: 1,
            title: "Circuit Board Hoodie for Neural Network Hoodie",
            description: "Looking to trade my Circuit Board Hoodie (M) for any Neural Network Hoodie in size M. Both are from the Zippy Originals collection and in excellent condition.",
            offeredProductId: "Circuit Board Hoodie",
            offeredSize: "M",
            wantedProductId: "Neural Network Hoodie", 
            wantedSize: "M",
            status: "active",
            userId: 1,
            likes: 12,
            comments: [
                { id: 1, userId: 2, text: "I have a Neural Network Hoodie in M! DM me", date: "2024-01-15" },
                { id: 2, userId: 3, text: "Great piece! Wish I had something to trade", date: "2024-01-14" }
            ],
            createdAt: "2024-01-10"
        },
        {
            id: 2,
            title: "Cyber Samurai Hoodie for Quantum Circuit Hoodie",
            description: "Trading my Cyber Samurai Hoodie (L) for Quantum Circuit Hoodie in size L. Both are limited edition pieces from Zippy Originals.",
            offeredProductId: "Cyber Samurai Hoodie",
            offeredSize: "L",
            wantedProductId: "Quantum Circuit Hoodie",
            wantedSize: "L", 
            status: "pending",
            userId: 2,
            likes: 8,
            comments: [
                { id: 3, userId: 1, text: "I have Quantum Circuit Hoodie in L! Let's trade", date: "2024-01-13" }
            ],
            createdAt: "2024-01-12"
        },
        {
            id: 3,
            title: "404 Not Found Tee for SYSTEM OVERRIDE Tee",
            description: "Looking to exchange my 404 Not Found Tee (XL) for SYSTEM OVERRIDE Tee in XL. Both are from Street Tech collection.",
            offeredProductId: "404 Not Found Tee",
            offeredSize: "XL",
            wantedProductId: "SYSTEM OVERRIDE Tee",
            wantedSize: "XL",
            status: "completed",
            userId: 3,
            likes: 15,
            comments: [
                { id: 4, userId: 1, text: "Perfect! I have SYSTEM OVERRIDE in XL", date: "2024-01-11" },
                { id: 5, userId: 2, text: "Great trade! Both pieces are amazing", date: "2024-01-10" }
            ],
            createdAt: "2024-01-08"
        },
        {
            id: 4,
            title: "Circuit Pattern Hoodie for Circuit Board Hoodie",
            description: "Trading my Circuit Pattern Hoodie (S) for Circuit Board Hoodie in size S. Both are from the latest Zippy Originals collection.",
            offeredProductId: "Circuit Pattern Hoodie",
            offeredSize: "S",
            wantedProductId: "Circuit Board Hoodie",
            wantedSize: "S",
            status: "active",
            userId: 1,
            likes: 6,
            comments: [],
            createdAt: "2024-01-16"
        },
        {
            id: 5,
            title: "Crypto Punk Tee for Code Warrior Tee",
            description: "Looking to trade Crypto Punk Tee (M) for Code Warrior Tee in M. Both are from Street Tech collection.",
            offeredProductId: "Crypto Punk Tee",
            offeredSize: "M",
            wantedProductId: "Code Warrior Tee",
            wantedSize: "M",
            status: "active",
            userId: 2,
            likes: 9,
            comments: [
                { id: 6, userId: 3, text: "I have Code Warrior Tee in M! Interested?", date: "2024-01-15" }
            ],
            createdAt: "2024-01-14"
        },
        {
            id: 6,
            title: "Neon Cargo Pants for Code Cargo Pants",
            description: "Trading Neon Cargo Pants (32) for Code Cargo Pants in 32. Both are tactical style from Future Wear.",
            offeredProductId: "Neon Cargo Pants",
            offeredSize: "32",
            wantedProductId: "Code Cargo Pants",
            wantedSize: "32",
            status: "pending",
            userId: 3,
            likes: 11,
            comments: [
                { id: 7, userId: 1, text: "I have Code Cargo Pants! Let's discuss", date: "2024-01-13" }
            ],
            createdAt: "2024-01-12"
        },
        {
            id: 7,
            title: "Circuit Breaker Pants for Digital Glitch Tee",
            description: "Trading Circuit Breaker Pants (L) for Digital Glitch Tee in L. Looking for something more casual.",
            offeredProductId: "Circuit Breaker Pants",
            offeredSize: "L",
            wantedProductId: "Digital Glitch Tee",
            wantedSize: "L",
            status: "active",
            userId: 1,
            likes: 7,
            comments: [],
            createdAt: "2024-01-17"
        },
        {
            id: 8,
            title: "Quantum Circuit Hoodie for Cyber Samurai Hoodie",
            description: "Looking to trade Quantum Circuit Hoodie (XL) for Cyber Samurai Hoodie in XL. Both are premium Zippy Originals pieces.",
            offeredProductId: "Quantum Circuit Hoodie",
            offeredSize: "XL",
            wantedProductId: "Cyber Samurai Hoodie",
            wantedSize: "XL",
            status: "active",
            userId: 2,
            likes: 13,
            comments: [
                { id: 8, userId: 3, text: "I have Cyber Samurai in XL! Perfect match", date: "2024-01-16" }
            ],
            createdAt: "2024-01-15"
        },
        {
            id: 9,
            title: "Code Cargo Pants for Circuit Breaker Pants",
            description: "Trading Code Cargo Pants (M) for Circuit Breaker Pants in M. Both are from Street Tech collection.",
            offeredProductId: "Code Cargo Pants",
            offeredSize: "M",
            wantedProductId: "Circuit Breaker Pants",
            wantedSize: "M",
            status: "active",
            userId: 3,
            likes: 5,
            comments: [],
            createdAt: "2024-01-18"
        },
        {
            id: 10,
            title: "Digital Glitch Tee for Crypto Punk Tee",
            description: "Looking to exchange Digital Glitch Tee (S) for Crypto Punk Tee in S. Both are from Future Wear collection.",
            offeredProductId: "Digital Glitch Tee",
            offeredSize: "S",
            wantedProductId: "Crypto Punk Tee",
            wantedSize: "S",
            status: "active",
            userId: 1,
            likes: 10,
            comments: [
                { id: 9, userId: 2, text: "I have Crypto Punk Tee in S! Let's trade", date: "2024-01-17" }
            ],
            createdAt: "2024-01-16"
        },
        {
            id: 11,
            title: "Vapor Dream Tee for Neon Pulse Tee",
            description: "Trading Vapor Dream Tee (M) for Neon Pulse Tee in M. Both are from the latest collection.",
            offeredProductId: "Vapor Dream Tee",
            offeredSize: "M",
            wantedProductId: "Neon Pulse Tee",
            wantedSize: "M",
            status: "active",
            userId: 2,
            likes: 8,
            comments: [],
            createdAt: "2024-01-19"
        },
        {
            id: 12,
            title: "Electric Night Tee for Cyber Rose Tee",
            description: "Looking to trade Electric Night Tee (L) for Cyber Rose Tee in L. Both are premium Street Tech pieces.",
            offeredProductId: "Electric Night Tee",
            offeredSize: "L",
            wantedProductId: "Cyber Rose Tee",
            wantedSize: "L",
            status: "active",
            userId: 3,
            likes: 12,
            comments: [
                { id: 10, userId: 1, text: "I have Cyber Rose Tee in L! Perfect match", date: "2024-01-18" }
            ],
            createdAt: "2024-01-17"
        },
        {
            id: 13,
            title: "Glitch Reality Hoodie for Neon Cyber Grid Hoodie",
            description: "Trading Glitch Reality Hoodie (XL) for Neon Cyber Grid Hoodie in XL. Both are from Zippy Originals.",
            offeredProductId: "Glitch Reality Hoodie",
            offeredSize: "XL",
            wantedProductId: "Neon Cyber Grid Hoodie",
            wantedSize: "XL",
            status: "active",
            userId: 1,
            likes: 15,
            comments: [
                { id: 11, userId: 2, text: "I have Neon Cyber Grid Hoodie in XL!", date: "2024-01-18" }
            ],
            createdAt: "2024-01-16"
        },
        {
            id: 14,
            title: "Urban Operator Pants for Shadow Tech Pants",
            description: "Looking to exchange Urban Operator Pants (32) for Shadow Tech Pants in 32. Both are tactical style.",
            offeredProductId: "Urban Operator Pants",
            offeredSize: "32",
            wantedProductId: "Shadow Tech Pants",
            wantedSize: "32",
            status: "active",
            userId: 2,
            likes: 9,
            comments: [],
            createdAt: "2024-01-19"
        },
        {
            id: 15,
            title: "Neon Racer Pants for Holo Flex Pants",
            description: "Trading Neon Racer Pants (M) for Holo Flex Pants in M. Both are from Future Wear collection.",
            offeredProductId: "Neon Racer Pants",
            offeredSize: "M",
            wantedProductId: "Holo Flex Pants",
            wantedSize: "M",
            status: "active",
            userId: 3,
            likes: 11,
            comments: [
                { id: 12, userId: 1, text: "I have Holo Flex Pants in M! Let's trade", date: "2024-01-19" }
            ],
            createdAt: "2024-01-18"
        }
    ];

    let filteredExchanges = [...exchanges];
    let currentUser = null;
    let isInitialized = false;
    let lastRenderTime = 0;
    const RENDER_THROTTLE = 100;

    // Helper function to get product by name
    function getProductById(productName) {
        if (!products || !Array.isArray(products)) {
            console.warn('❌ Products not loaded yet or invalid:', products);
            return null;
        }
        
        console.log('🔍 Looking for product:', productName);
        console.log('📦 Available products count:', products.length);
        console.log('📦 First few products:', products.slice(0, 3).map(p => ({ id: p.id, title: p.title, name: p.name })));
        
        const searchName = (productName || '').toLowerCase().trim();
        
        // Search by title first (since exchange data uses titles as IDs)
        let product = products.find(p => {
            const productTitle = (p.title || '').toLowerCase().trim();
            return productTitle === searchName;
        });
        
        // If not found by title, try by name
        if (!product) {
            product = products.find(p => {
                const productName = (p.name || '').toLowerCase().trim();
                return productName === searchName;
            });
        }
        
        // If still not found, try by ID
        if (!product) {
            product = products.find(p => {
                const productId = (p.id || '').toLowerCase().trim();
                return productId === searchName;
            });
        }
        
        // If still not found, try partial matches
        if (!product) {
            product = products.find(p => {
                const productTitle = (p.title || '').toLowerCase().trim();
                const productName = (p.name || '').toLowerCase().trim();
                
                return productTitle.includes(searchName) ||
                       productName.includes(searchName) ||
                       searchName.includes(productTitle) ||
                       searchName.includes(productName);
            });
        }
        
        if (product) {
            console.log('✅ Found product:', product);
        } else {
            console.warn('❌ Product not found:', productName);
            console.log('🔍 Search name was:', searchName);
            console.log('📦 First few products:', products.slice(0, 3).map(p => ({ id: p.id, title: p.title, name: p.name })));
        }
        
        return product;
    }

    // Load products into select elements
    function loadProductsIntoSelects() {
        try {
            // Check if products are loaded
            if (!products || products.length === 0) {
                console.warn('⚠️ Products not loaded yet, skipping select population');
                return;
            }
            
            const offeredProductSelect = document.getElementById('offeredProduct');
            const wantedProductSelect = document.getElementById('wantedProduct');
            
            if (offeredProductSelect && wantedProductSelect) {
                // Clear existing options
                offeredProductSelect.innerHTML = '<option value="">Select Product</option>';
                wantedProductSelect.innerHTML = '<option value="">Select Product</option>';
                
                // Add products to both selects
                products.forEach(product => {
                    const option = document.createElement('option');
                    option.value = product.title; // Use title as value since we're using titles as IDs
                    option.textContent = `${product.title} - ${product.brand}`;
                    option.dataset.category = product.category;
                    option.dataset.image = product.images?.[0] || '/images/placeholder.svg';
                    
                    // Clone for both selects
                    offeredProductSelect.appendChild(option.cloneNode(true));
                    wantedProductSelect.appendChild(option);
                });
                
                // Add event listeners for product preview
                offeredProductSelect.addEventListener('change', updateProductPreview);
                wantedProductSelect.addEventListener('change', updateProductPreview);
                
                console.log('✅ Products loaded into select elements');
            }
        } catch (error) {
            console.error('❌ Error loading products into selects:', error);
        }
    }

    // Update product preview when selection changes
    function updateProductPreview() {
        const offeredProductSelect = document.getElementById('offeredProduct');
        const wantedProductSelect = document.getElementById('wantedProduct');
        
        if (offeredProductSelect && wantedProductSelect) {
            const offeredProductId = offeredProductSelect.value;
            const wantedProductId = wantedProductSelect.value;
            
            // Update offered product preview
            if (offeredProductId) {
                const offeredProduct = getProductById(offeredProductId);
                const offeredPreview = document.getElementById('offeredProductPreview');
                if (offeredPreview && offeredProduct) {
                    offeredPreview.innerHTML = `
                        <div class="product-preview">
                            <img src="${offeredProduct.image || offeredProduct.images?.[0] || '/images/placeholder.svg'}" alt="${offeredProduct.title || offeredProduct.name}" onerror="this.src='/images/placeholder.svg'">
                            <div class="preview-info">
                                <h5>${offeredProduct.title || offeredProduct.name}</h5>
                                <p>${offeredProduct.brand}</p>
                            </div>
                        </div>
                    `;
                }
            }
            
            // Update wanted product preview
            if (wantedProductId) {
                const wantedProduct = getProductById(wantedProductId);
                const wantedPreview = document.getElementById('wantedProductPreview');
                if (wantedPreview && wantedProduct) {
                    wantedPreview.innerHTML = `
                        <div class="product-preview">
                            <img src="${wantedProduct.image || wantedProduct.images?.[0] || '/images/placeholder.svg'}" alt="${wantedProduct.title || wantedProduct.name}" onerror="this.src='/images/placeholder.svg'">
                            <div class="preview-info">
                                <h5>${wantedProduct.title || wantedProduct.name}</h5>
                                <p>${wantedProduct.brand}</p>
                            </div>
                        </div>
                    `;
                }
            }
        }
    }

    // Initialize the page
    async function init() {
        if (isInitialized) return;
        
        try {
            // Load products first
            await loadProducts();
            
            // Verify products are loaded
            if (!products || products.length === 0) {
                console.error('❌ No products loaded, cannot initialize exchange page');
                setTimeout(init, 1000);
                return;
            }
            
            console.log('✅ Products loaded successfully:', products.length);
            
            // Pre-load critical elements
            const criticalElements = [
                'exchangeGrid',
                'createExchangeBtn',
                'createExchangeModal',
                'closeCreateModal',
                'createExchangeForm',
                'exchangeSearch',
                'categoryFilter',
                'sizeFilter',
                'statusFilter'
            ];
            
            const missingElements = criticalElements.filter(id => !document.getElementById(id));
            if (missingElements.length > 0) {
                console.warn('Missing critical elements:', missingElements);
                setTimeout(init, 100);
                return;
            }
            
            // Load approved exchanges from localStorage
            setTimeout(() => {
                if (products && products.length > 0) {
                    loadApprovedExchanges();
                } else {
                    console.warn('⚠️ Products not ready for approved exchanges load');
                }
            }, 200);
            
            // Initialize with requestAnimationFrame for better performance
            requestAnimationFrame(() => {
                try {
                    // Double-check products are loaded
                    if (!products || products.length === 0) {
                        console.error('❌ Products still not loaded, retrying...');
                        setTimeout(init, 1000);
                        return;
                    }
                    
                    renderExchanges();
                    setupEventListeners();
                    updateStats();
                    isInitialized = true;
                    console.log('Exchange page initialized successfully');
                } catch (error) {
                    console.error('Error in initialization animation frame:', error);
                    setTimeout(() => {
                        try {
                            renderExchanges();
                            setupEventListeners();
                            updateStats();
                            isInitialized = true;
                        } catch (fallbackError) {
                            console.error('Fallback initialization failed:', fallbackError);
                        }
                    }, 500);
                }
            });
        } catch (error) {
            console.error('Error initializing exchange page:', error);
            setTimeout(init, 1000);
        }
    }

    // Optimized render function with throttling
    function renderExchanges() {
        const now = Date.now();
        if (now - lastRenderTime < RENDER_THROTTLE) {
            setTimeout(() => renderExchanges(), RENDER_THROTTLE - (now - lastRenderTime));
            return;
        }
        lastRenderTime = now;

        // Check if products are loaded
        if (!products || products.length === 0) {
            console.warn('⚠️ Products not loaded yet, skipping render');
            return;
        }

        const grid = document.getElementById('exchangeGrid');
        if (!grid) {
            console.error('Exchange grid not found');
            return;
        }
        
        if (filteredExchanges.length === 0) {
            grid.innerHTML = `
                <div class="no-exchanges" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                    <h3 style="font-family: 'Space Grotesk', sans-serif; color: var(--text-gray); margin-bottom: 16px;">No exchanges found</h3>
                    <p style="font-family: 'Space Grotesk', sans-serif; color: var(--text-gray);">Try adjusting your filters or create a new exchange.</p>
                </div>
            `;
            return;
        }

        // Use DocumentFragment for better performance
        const fragment = document.createDocumentFragment();
        
        filteredExchanges.forEach(exchange => {
            const exchangeCard = createExchangeCard(exchange);
            fragment.appendChild(exchangeCard);
        });
        
        // Clear and append in one operation
        grid.innerHTML = '';
        grid.appendChild(fragment);
    }

    // Create exchange card with product images
    function createExchangeCard(exchange) {
        const user = users.find(u => u.id === exchange.userId);
        const offeredProduct = getProductById(exchange.offeredProductId);
        const wantedProduct = getProductById(exchange.wantedProductId);
        
        const card = document.createElement('div');
        card.className = 'exchange-card';
        card.dataset.exchangeId = exchange.id;
        
        // Get product images or fallback with proper URL encoding
        const offeredImage = offeredProduct?.image || offeredProduct?.images?.[0] || '/images/placeholder.svg';
        const wantedImage = wantedProduct?.image || wantedProduct?.images?.[0] || '/images/placeholder.svg';
        
        // Enhanced debug logging
        console.log('=== Creating Exchange Card ===');
        console.log('Exchange ID:', exchange.id);
        console.log('Exchange title:', exchange.title);
        console.log('Offered Product ID:', exchange.offeredProductId);
        console.log('Wanted Product ID:', exchange.wantedProductId);
        console.log('Offered product found:', offeredProduct);
        console.log('Wanted product found:', wantedProduct);
        console.log('Offered image path:', offeredImage);
        console.log('Wanted image path:', wantedImage);
        console.log('Products array length:', products?.length || 0);
        console.log('First few products:', products?.slice(0, 3).map(p => ({ id: p.id, title: p.title })));
        console.log('========================');
        
        // Use real product data or meaningful fallback
        const offeredTitle = offeredProduct?.title || offeredProduct?.name || 'Product Not Found';
        const offeredBrand = offeredProduct?.brand || 'Brand Unknown';
        const wantedTitle = wantedProduct?.title || wantedProduct?.name || 'Product Not Found';
        const wantedBrand = wantedProduct?.brand || 'Brand Unknown';
        
        card.innerHTML = `
            <div class="card-header">
                <div class="user-info">
                    <span class="user-avatar" style="color: ${user.color}">${user.avatar}</span>
                    <span class="user-name">${user.name}</span>
                </div>
                <span class="exchange-status ${exchange.status}">${exchange.status}</span>
            </div>
            <div class="card-body">
                <h3 class="card-title">${exchange.title}</h3>
                <p class="card-description">${exchange.description.length > 80 ? exchange.description.substring(0, 80) + '...' : exchange.description}</p>
                <div class="exchange-items">
                    <div class="offering-section">
                        <h4>OFFERING</h4>
                        <div class="item-display">
                            <div class="product-image">
                                <img src="${offeredImage}" alt="${offeredTitle}" 
                                     onerror="this.src='/images/placeholder.svg'; console.log('❌ Failed to load offered image:', this.src);" 
                                     onload="console.log('✅ Offered image loaded:', this.src)"
                                     style="object-fit: cover; width: 100%; height: 100%; border-radius: 8px;">
                            </div>
                            <div class="product-info">
                                <h5 style="color: #00ffff; margin-bottom: 4px; font-size: 14px; font-weight: 600;">${offeredTitle}</h5>
                                <p style="color: #00ff00; margin-bottom: 4px; font-size: 12px; font-weight: 500;">${offeredBrand}</p>
                                <p style="color: #cccccc; font-size: 11px;">Size: ${exchange.offeredSize}</p>
                            </div>
                        </div>
                    </div>
                    <div class="exchange-arrow">⇄</div>
                    <div class="wanted-section">
                        <h4>WANTING</h4>
                        <div class="item-display">
                            <div class="product-image">
                                <img src="${wantedImage}" alt="${wantedTitle}" 
                                     onerror="this.src='/images/placeholder.svg'; console.log('❌ Failed to load wanted image:', this.src);" 
                                     onload="console.log('✅ Wanted image loaded:', this.src)"
                                     style="object-fit: cover; width: 100%; height: 100%; border-radius: 8px;">
                            </div>
                            <div class="product-info">
                                <h5 style="color: #00ffff; margin-bottom: 4px; font-size: 14px; font-weight: 600;">${wantedTitle}</h5>
                                <p style="color: #00ff00; margin-bottom: 4px; font-size: 12px; font-weight: 500;">${wantedBrand}</p>
                                <p style="color: #cccccc; font-size: 11px;">Size: ${exchange.wantedSize}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card-footer">
                <div class="card-actions">
                    <button class="action-btn view-btn" data-exchange-id="${exchange.id}">
                        <span>👁️</span> View
                    </button>
                    <button class="action-btn respond-btn" data-exchange-id="${exchange.id}">
                        <span>💬</span> Respond
                    </button>
                    <button class="action-btn approve-btn" data-exchange-id="${exchange.id}">
                        <span>✅</span> Approve Exchange
                    </button>
                </div>
                <div class="card-stats">
                    <button class="like-btn ${exchange.liked ? 'liked' : ''}" data-exchange-id="${exchange.id}">
                        <span class="like-icon">❤️</span>
                        <span class="like-count">${exchange.likes}</span>
                    </button>
                    <span class="comment-count">💬 ${exchange.comments.length}</span>
                </div>
            </div>
        `;
        
        // Add event listeners
        card.querySelector('.view-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            viewExchange(exchange.id);
        });
        
        card.querySelector('.respond-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            respondToExchange(exchange.id);
        });
        
        card.querySelector('.approve-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            approveExchange(exchange.id);
        });
        
        card.querySelector('.like-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            toggleLike(exchange.id);
        });
        
        return card;
    }

    // Setup event listeners with error handling
    function setupEventListeners() {
        const elements = {
            createExchangeBtn: document.getElementById('createExchangeBtn'),
            closeCreateModal: document.getElementById('closeCreateModal'),
            createExchangeForm: document.getElementById('createExchangeForm'),
            exchangeSearch: document.getElementById('exchangeSearch'),
            categoryFilter: document.getElementById('categoryFilter'),
            sizeFilter: document.getElementById('sizeFilter'),
            statusFilter: document.getElementById('statusFilter')
        };

        // Load products into select elements
        setTimeout(() => {
            if (products && products.length > 0) {
                loadProductsIntoSelects();
            } else {
                console.warn('⚠️ Products not ready for select population');
            }
        }, 100);

        // Add event listeners only if elements exist
        if (elements.createExchangeBtn) {
            elements.createExchangeBtn.addEventListener('click', () => {
                const createModal = document.getElementById('createExchangeModal');
                createModal.classList.add('active');
                
                // Ensure modal is centered in viewport and scroll to top
                setTimeout(() => {
                    // Scroll page to top first
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                    
                    // Then scroll modal to top
                    createModal.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                        inline: 'nearest'
                    });
                }, 100);
            }, { passive: true });
        }

        if (elements.closeCreateModal) {
            elements.closeCreateModal.addEventListener('click', () => {
                document.getElementById('createExchangeModal').classList.remove('active');
            }, { passive: true });
        }

        if (elements.createExchangeForm) {
            elements.createExchangeForm.addEventListener('submit', handleCreateExchange, { passive: false });
        }

        // Add filter listeners
        if (elements.exchangeSearch) {
            elements.exchangeSearch.addEventListener('input', debounce(filterExchanges, 300), { passive: true });
        }

        if (elements.categoryFilter) {
            elements.categoryFilter.addEventListener('change', filterExchanges, { passive: true });
        }

        if (elements.sizeFilter) {
            elements.sizeFilter.addEventListener('change', filterExchanges, { passive: true });
        }

        if (elements.statusFilter) {
            elements.statusFilter.addEventListener('change', filterExchanges, { passive: true });
        }

        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.remove('active');
            }
        }, { passive: true });
    }

    // Enhanced debounce function with better performance
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Filter exchanges with memoization
    let lastFilterState = '';
    function filterExchanges() {
        try {
            // Check if products are loaded
            if (!products || products.length === 0) {
                console.warn('⚠️ Products not loaded yet, skipping filter');
                return;
            }
            
            const searchTerm = document.getElementById('exchangeSearch')?.value.toLowerCase() || '';
            const category = document.getElementById('categoryFilter')?.value || '';
            const size = document.getElementById('sizeFilter')?.value || '';
            const status = document.getElementById('statusFilter')?.value || '';

            // Create filter state string for memoization
            const filterState = `${searchTerm}-${category}-${size}-${status}`;
            
            // Skip if filter state hasn't changed
            if (filterState === lastFilterState) {
                return;
            }
            lastFilterState = filterState;

            filteredExchanges = exchanges.filter(exchange => {
                const offeredProduct = getProductById(exchange.offeredProductId);
                const wantedProduct = getProductById(exchange.wantedProductId);
                
                const matchesSearch = !searchTerm || 
                    exchange.title.toLowerCase().includes(searchTerm) ||
                    exchange.description.toLowerCase().includes(searchTerm) ||
                    (offeredProduct?.title?.toLowerCase().includes(searchTerm)) ||
                    (wantedProduct?.title?.toLowerCase().includes(searchTerm));
                
                const matchesCategory = !category || 
                    (offeredProduct?.category === category) || 
                    (wantedProduct?.category === category);
                
                const matchesSize = !size || 
                    exchange.offeredSize === size || 
                    exchange.wantedSize === size;
                
                const matchesStatus = !status || exchange.status === status;
                
                return matchesSearch && matchesCategory && matchesSize && matchesStatus;
            });

            renderExchanges();
            updateStats();
        } catch (error) {
            console.error('Error filtering exchanges:', error);
        }
    }

    // Update statistics
    function updateStats() {
        try {
            const activeCount = exchanges.filter(e => e.status === 'active').length;
            const completedCount = exchanges.filter(e => e.status === 'completed').length;
            const memberCount = new Set(exchanges.map(e => e.userId)).size;
            const totalComments = exchanges.reduce((sum, e) => sum + e.comments.length, 0);

            document.getElementById('activeExchanges').textContent = activeCount;
            document.getElementById('completedExchanges').textContent = completedCount;
            document.getElementById('communityMembers').textContent = memberCount;
            document.getElementById('totalComments').textContent = totalComments;
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }

    // Handle create exchange
    function handleCreateExchange(e) {
        e.preventDefault();
        
        try {
            const formData = {
                title: document.getElementById('exchangeTitle').value,
                description: document.getElementById('exchangeDescription').value,
                offeredProductId: document.getElementById('offeredProduct').value,
                offeredSize: document.getElementById('offeredSize').value,
                wantedProductId: document.getElementById('wantedProduct').value,
                wantedSize: document.getElementById('wantedSize').value
            };

            // Validate that products are selected
            if (!formData.offeredProductId || !formData.wantedProductId) {
                showNotification('Please select both products for exchange', 'error');
                return;
            }

            // Validate that different products are selected
            if (formData.offeredProductId === formData.wantedProductId) {
                showNotification('Please select different products for exchange', 'error');
                return;
            }

            // Create new exchange
            const newExchange = {
                id: exchanges.length + 1,
                ...formData,
                status: 'active',
                userId: 1, // Default user
                likes: 0,
                comments: [],
                createdAt: new Date().toISOString().split('T')[0]
            };

            exchanges.unshift(newExchange);
            filteredExchanges = [...exchanges];
            
            // Close modal and reset form
            document.getElementById('createExchangeModal').classList.remove('active');
            document.getElementById('createExchangeForm').reset();
            
            renderExchanges();
            updateStats();
            
            // Show success message
            showNotification('Exchange created successfully!', 'success');
        } catch (error) {
            console.error('Error creating exchange:', error);
            showNotification('Error creating exchange. Please try again.', 'error');
        }
    }

    // View exchange details
    function viewExchange(exchangeId) {
        const exchange = exchanges.find(e => e.id === exchangeId);
        if (!exchange) return;

        const user = users.find(u => u.id === exchange.userId);
        const offeredProduct = getProductById(exchange.offeredProductId);
        const wantedProduct = getProductById(exchange.wantedProductId);
        
        // Populate modal
        document.getElementById('detailTitle').textContent = exchange.title;
        document.getElementById('detailDescription').textContent = exchange.description;
        
        // Update offering and wanting displays with product info
        const offeringDisplay = document.getElementById('offeringDisplay');
        const wantedDisplay = document.getElementById('wantedDisplay');
        
        if (offeringDisplay) {
            const offeredTitle = offeredProduct?.title || offeredProduct?.name || `Product ${exchange.offeredProductId}`;
            const offeredBrand = offeredProduct?.brand || 'Unknown Brand';
            offeringDisplay.innerHTML = `
                <div class="product-detail">
                    <img src="${offeredProduct?.image || offeredProduct?.images?.[0] || '/images/placeholder.svg'}" alt="${offeredTitle}" onerror="this.src='/images/placeholder.svg'">
                    <div class="product-info">
                        <h4>${offeredTitle}</h4>
                        <p>${offeredBrand}</p>
                        <p>Size: ${exchange.offeredSize}</p>
                    </div>
                </div>
            `;
        }
        
        if (wantedDisplay) {
            const wantedTitle = wantedProduct?.title || wantedProduct?.name || `Product ${exchange.wantedProductId}`;
            const wantedBrand = wantedProduct?.brand || 'Unknown Brand';
            wantedDisplay.innerHTML = `
                <div class="product-detail">
                    <img src="${wantedProduct?.image || wantedProduct?.images?.[0] || '/images/placeholder.svg'}" alt="${wantedTitle}" onerror="this.src='/images/placeholder.svg'">
                    <div class="product-info">
                        <h4>${wantedTitle}</h4>
                        <p>${wantedBrand}</p>
                        <p>Size: ${exchange.wantedSize}</p>
                    </div>
                </div>
            `;
        }
        
        document.getElementById('likeCount').textContent = exchange.likes;
        
        // Render comments
        renderComments(exchange.comments);
        
        // Show modal
        const detailModal = document.getElementById('exchangeDetailModal');
        detailModal.classList.add('active');
        
        // Ensure modal is centered in viewport and scroll to top
        setTimeout(() => {
            // Scroll page to top first
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            
            // Then scroll modal to top
            detailModal.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
                inline: 'nearest'
            });
        }, 100);
        
        // Setup modal event listeners
        setupDetailModalListeners(exchangeId);
    }

    // Render comments
    function renderComments(comments) {
        const commentsList = document.getElementById('commentsList');
        if (!commentsList) return;

        commentsList.innerHTML = comments.map(comment => {
            const user = users.find(u => u.id === comment.userId);
            return `
                <div class="comment-item">
                    <div class="comment-header">
                        <span class="comment-author">${user.name}</span>
                        <span class="comment-date">${comment.date}</span>
                    </div>
                    <div class="comment-text">${comment.text}</div>
                </div>
            `;
        }).join('');
    }

    // Setup detail modal listeners
    function setupDetailModalListeners(exchangeId) {
        console.log('setupDetailModalListeners called with ID:', exchangeId);
        const exchange = exchanges.find(e => e.id === exchangeId);
        if (!exchange) {
            console.log('Exchange not found in setupDetailModalListeners');
            return;
        }

        // Close modal
        const closeBtn = document.getElementById('closeDetailModal');
        if (closeBtn) {
            console.log('Close button found, adding listener');
            closeBtn.addEventListener('click', () => {
                document.getElementById('exchangeDetailModal').classList.remove('active');
            }, { passive: true });
        } else {
            console.error('Close button not found in modal');
        }

        // Like button
        const likeBtn = document.getElementById('likeBtn');
        if (likeBtn) {
            console.log('Like button found, adding listener');
            // Remove existing listeners first
            const newLikeBtn = likeBtn.cloneNode(true);
            likeBtn.parentNode.replaceChild(newLikeBtn, likeBtn);
            
            newLikeBtn.addEventListener('click', () => {
                console.log('Like button clicked in modal for exchange:', exchangeId);
                toggleLike(exchangeId);
            }, { passive: true });
        } else {
            console.error('Like button not found in modal');
        }

        // Add comment
        const addCommentBtn = document.getElementById('addCommentBtn');
        if (addCommentBtn) {
            console.log('Add comment button found, adding listener');
            addCommentBtn.addEventListener('click', () => {
                console.log('Add comment button clicked for exchange:', exchangeId);
                addComment(exchangeId);
            }, { passive: true });
        } else {
            console.error('Add comment button not found in modal');
        }

        // Respond button
        const respondBtn = document.getElementById('respondBtn');
        if (respondBtn) {
            console.log('Respond button found, adding listener');
            // Remove existing listeners first
            const newRespondBtn = respondBtn.cloneNode(true);
            respondBtn.parentNode.replaceChild(newRespondBtn, respondBtn);
            
            newRespondBtn.addEventListener('click', () => {
                console.log('Respond button clicked in modal for exchange:', exchangeId);
                respondToExchange(exchangeId);
            }, { passive: true });
        } else {
            console.error('Respond button not found in modal');
        }
    }

    // Toggle like
    function toggleLike(exchangeId) {
        console.log('toggleLike called with ID:', exchangeId);
        const exchange = exchanges.find(e => e.id === exchangeId);
        if (!exchange) {
            console.log('Exchange not found in toggleLike');
            return;
        }

        exchange.liked = !exchange.liked;
        exchange.likes += exchange.liked ? 1 : -1;
        
        // Update UI
        const likeBtn = document.querySelector(`[data-exchange-id="${exchangeId}"] .like-btn`);
        if (likeBtn) {
            likeBtn.classList.toggle('liked', exchange.liked);
            likeBtn.querySelector('.like-count').textContent = exchange.likes;
        }
        
        // Update detail modal if open
        const detailLikeBtn = document.getElementById('likeBtn');
        const likeCount = document.getElementById('likeCount');
        if (detailLikeBtn && likeCount) {
            console.log('Updating detail modal like button');
            detailLikeBtn.classList.toggle('liked', exchange.liked);
            likeCount.textContent = exchange.likes;
            console.log('Like count updated to:', exchange.likes);
        } else {
            console.log('Detail modal like elements not found');
        }
    }

    // Add comment
    function addComment(exchangeId) {
        const commentText = document.getElementById('commentText').value.trim();
        if (!commentText) return;

        const exchange = exchanges.find(e => e.id === exchangeId);
        if (!exchange) return;

        const newComment = {
            id: exchange.comments.length + 1,
            userId: 1, // Current user
            text: commentText,
            date: new Date().toISOString().split('T')[0]
        };

        exchange.comments.push(newComment);
        
        // Update UI
        renderComments(exchange.comments);
        document.getElementById('commentText').value = '';
        
        // Update comment count in grid
        const exchangeCard = document.querySelector(`[data-exchange-id="${exchangeId}"]`);
        if (exchangeCard) {
            exchangeCard.querySelector('.comment-count').textContent = `💬 ${exchange.comments.length}`;
        }
        
        updateStats();
        showNotification('Comment added successfully!', 'success');
    }

    // Respond to exchange
    function respondToExchange(exchangeId) {
        console.log('respondToExchange called with ID:', exchangeId);
        
        const exchange = exchanges.find(e => e.id === exchangeId);
        if (!exchange) {
            console.log('Exchange not found');
            return;
        }

        // Check if exchange is still active
        if (exchange.status !== 'active') {
            showNotification(`This exchange is ${exchange.status} and cannot be responded to.`, 'error');
            return;
        }

        // Open the exchange detail modal to show response options
        viewExchange(exchangeId);
        
        // Add response section to detail modal
        const detailModal = document.getElementById('exchangeDetailModal');
        if (detailModal) {
            console.log('Detail modal found, adding response section');
            
            // Remove existing response section if any
            const existingResponseSection = detailModal.querySelector('.response-section');
            if (existingResponseSection) {
                existingResponseSection.remove();
            }
            
            // Create new response section
            const responseSection = document.createElement('div');
            responseSection.className = 'response-section';
            responseSection.innerHTML = `
                <div class="response-options">
                    <h4>Respond to this Exchange</h4>
                    <div class="response-buttons">
                        <button class="btn-primary accept-exchange-btn" data-exchange-id="${exchangeId}">
                            <span>✅</span> Accept Exchange
                        </button>
                        <button class="btn-secondary counter-offer-btn" data-exchange-id="${exchangeId}">
                            <span>🔄</span> Propose Counter Offer
                        </button>
                        <button class="btn-secondary ask-question-btn" data-exchange-id="${exchangeId}">
                            <span>❓</span> Ask Question
                        </button>
                    </div>
                </div>
            `;
            
            // Add event listeners to the new buttons
            responseSection.querySelector('.accept-exchange-btn').addEventListener('click', () => {
                console.log('Accept exchange clicked');
                acceptExchange(exchangeId);
            });
            
            responseSection.querySelector('.counter-offer-btn').addEventListener('click', () => {
                console.log('Counter offer clicked');
                proposeCounterOffer(exchangeId);
            });
            
            responseSection.querySelector('.ask-question-btn').addEventListener('click', () => {
                console.log('Ask question clicked');
                askQuestion(exchangeId);
            });
            
            // Insert before comments section
            const commentsSection = detailModal.querySelector('.comments-section');
            const modalBody = detailModal.querySelector('.modal-body');
            
            if (commentsSection) {
                commentsSection.parentNode.insertBefore(responseSection, commentsSection);
            } else if (modalBody) {
                modalBody.appendChild(responseSection);
            }
        }
        
        showNotification('Response options loaded!', 'success');
    }

    // Accept exchange function
    function acceptExchange(exchangeId) {
        console.log('acceptExchange called with ID:', exchangeId);
        const exchange = exchanges.find(e => e.id === exchangeId);
        if (!exchange) {
            console.log('Exchange not found in acceptExchange');
            return;
        }

        exchange.status = 'completed';
        
        // Update UI
        const exchangeCard = document.querySelector(`[data-exchange-id="${exchangeId}"]`);
        if (exchangeCard) {
            const statusBadge = exchangeCard.querySelector('.status-badge');
            if (statusBadge) {
                statusBadge.textContent = 'COMPLETED';
                statusBadge.className = 'status-badge completed';
            }
        }
        
        // Close modal
        document.getElementById('exchangeDetailModal').classList.remove('active');
        
        updateStats();
        showNotification('Exchange accepted successfully!', 'success');
    }

    // Propose counter offer function
    function proposeCounterOffer(exchangeId) {
        console.log('proposeCounterOffer called with ID:', exchangeId);
        
        // Create counter offer modal
        const counterModal = document.createElement('div');
        counterModal.className = 'modal active';
        counterModal.innerHTML = `
            <div class="modal-container">
                <div class="modal-header">
                    <h2>Propose Counter Offer</h2>
                    <button class="close-btn" id="closeCounterModal">×</button>
                </div>
                <div class="modal-body">
                    <form id="counterOfferForm">
                        <div class="form-group">
                            <label for="counterDescription">What are you offering?</label>
                            <textarea id="counterDescription" required placeholder="Describe your item..."></textarea>
                        </div>
                        <div class="form-group">
                            <label for="counterCategory">Category</label>
                            <select id="counterCategory" required>
                                <option value="">Select category</option>
                                <option value="hoodies">Hoodies</option>
                                <option value="shirts">Shirts</option>
                                <option value="pants">Pants</option>
                                <option value="shoes">Shoes</option>
                                <option value="accessories">Accessories</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="counterSize">Size</label>
                            <select id="counterSize" required>
                                <option value="">Select size</option>
                                <option value="XS">XS</option>
                                <option value="S">S</option>
                                <option value="M">M</option>
                                <option value="L">L</option>
                                <option value="XL">XL</option>
                                <option value="XXL">XXL</option>
                            </select>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn-secondary" id="cancelCounterBtn">Cancel</button>
                            <button type="submit" class="btn-primary">Submit Counter Offer</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(counterModal);
        
        // Add event listeners
        counterModal.querySelector('#closeCounterModal').addEventListener('click', () => {
            counterModal.remove();
        });
        
        counterModal.querySelector('#cancelCounterBtn').addEventListener('click', () => {
            counterModal.remove();
        });
        
        counterModal.querySelector('#counterOfferForm').addEventListener('submit', (e) => {
            e.preventDefault();
            submitCounterOffer(e, exchangeId);
            counterModal.remove();
        });
        
        // Center modal
        setTimeout(() => {
            const modalRect = counterModal.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;
            
            // Scroll page to top first
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            
            // Then scroll modal to top
            counterModal.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
                inline: 'nearest'
            });
        }, 100);
    }

    // Submit counter offer function
    function submitCounterOffer(event, exchangeId) {
        console.log('submitCounterOffer called');
        
        const description = document.getElementById('counterDescription').value;
        const category = document.getElementById('counterCategory').value;
        const size = document.getElementById('counterSize').value;
        
        if (!description || !category || !size) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        
        const exchange = exchanges.find(e => e.id === exchangeId);
        if (!exchange) return;
        
        // Add counter offer as a comment
        const counterComment = {
            id: exchange.comments.length + 1,
            userId: 1, // Current user
            text: `Counter Offer: ${description} (${category} - Size ${size})`,
            date: new Date().toISOString().split('T')[0],
            isCounterOffer: true
        };
        
        exchange.comments.push(counterComment);
        renderComments(exchange.comments);
        
        showNotification('Counter offer submitted successfully!', 'success');
    }

    // Ask question function
    function askQuestion(exchangeId) {
        console.log('askQuestion called with ID:', exchangeId);
        
        const question = prompt('What would you like to ask about this exchange?');
        if (!question) return;
        
        const exchange = exchanges.find(e => e.id === exchangeId);
        if (!exchange) return;
        
        // Add question as a comment
        const questionComment = {
            id: exchange.comments.length + 1,
            userId: 1, // Current user
            text: `Question: ${question}`,
            date: new Date().toISOString().split('T')[0],
            isQuestion: true
        };
        
        exchange.comments.push(questionComment);
        renderComments(exchange.comments);
        
        showNotification('Question submitted successfully!', 'success');
    }

    // Approve exchange function
    function approveExchange(exchangeId) {
        console.log('approveExchange called with ID:', exchangeId);
        const exchange = exchanges.find(e => e.id === exchangeId);
        if (!exchange) {
            console.log('Exchange not found in approveExchange');
            return;
        }

        // Check if exchange is still active
        if (exchange.status !== 'active') {
            showNotification(`This exchange is ${exchange.status} and cannot be approved.`, 'error');
            return;
        }

        // Create approval modal
        const approvalModal = document.createElement('div');
        approvalModal.className = 'modal active';
        approvalModal.innerHTML = `
            <div class="modal-container large">
                <div class="modal-header">
                    <h2>Approve Exchange</h2>
                    <button class="close-btn" id="closeApprovalModal">×</button>
                </div>
                <div class="modal-body">
                    <div class="exchange-summary">
                        <h3>Exchange Summary</h3>
                        <div class="exchange-details">
                            <p><strong>Title:</strong> ${exchange.title}</p>
                            <p><strong>Description:</strong> ${exchange.description}</p>
                            <div class="exchange-items-summary">
                                <div class="offering-summary">
                                    <h4>You're Offering:</h4>
                                    <p>${exchange.offeredCategory} - Size ${exchange.offeredSize}</p>
                                </div>
                                <div class="exchange-arrow">⇄</div>
                                <div class="wanted-summary">
                                    <h4>You Want:</h4>
                                    <p>${exchange.wantedCategory} - Size ${exchange.wantedSize}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <form id="approvalForm" class="approval-form">
                        <div class="form-section">
                            <h3>Contact Information</h3>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="approvalPhone">Phone Number *</label>
                                    <input type="tel" id="approvalPhone" class="form-input" placeholder="+1 (555) 123-4567" required>
                                </div>
                                <div class="form-group">
                                    <label for="approvalEmail">Email Address *</label>
                                    <input type="email" id="approvalEmail" class="form-input" placeholder="your.email@example.com" required>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-section">
                            <h3>Shipping Address</h3>
                            <div class="form-group">
                                <label for="approvalAddress">Street Address *</label>
                                <input type="text" id="approvalAddress" class="form-input" placeholder="123 Main Street" required>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="approvalCity">City *</label>
                                    <input type="text" id="approvalCity" class="form-input" placeholder="New York" required>
                                </div>
                                <div class="form-group">
                                    <label for="approvalState">State/Province *</label>
                                    <input type="text" id="approvalState" class="form-input" placeholder="NY" required>
                                </div>
                                <div class="form-group">
                                    <label for="approvalZip">ZIP/Postal Code *</label>
                                    <input type="text" id="approvalZip" class="form-input" placeholder="10001" required>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-section">
                            <h3>Exchange Agreement</h3>
                            <div class="contract-text">
                                <p><strong>Exchange Terms and Conditions:</strong></p>
                                <ol>
                                    <li>I confirm that the item I'm offering is in the condition described and is authentic.</li>
                                    <li>I agree to ship my item within 3 business days of exchange approval.</li>
                                    <li>I understand that Zippy Streetwear acts as a facilitator and is not responsible for item condition or shipping delays.</li>
                                    <li>I agree to provide accurate contact information and shipping address for this exchange.</li>
                                </ol>
                            </div>
                            <div class="form-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="approvalAgreement" required>
                                    <span class="checkmark"></span>
                                    I have read and agree to the exchange terms and conditions above
                                </label>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn-secondary" id="cancelApprovalBtn">Cancel</button>
                            <button type="submit" class="btn-primary" id="submitApprovalBtn">
                                <span>✅</span> Approve & Complete Exchange
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(approvalModal);
        
        // Add event listeners
        approvalModal.querySelector('#closeApprovalModal').addEventListener('click', () => {
            approvalModal.remove();
        });
        
        approvalModal.querySelector('#cancelApprovalBtn').addEventListener('click', () => {
            approvalModal.remove();
        });
        
        approvalModal.querySelector('#approvalForm').addEventListener('submit', (e) => {
            e.preventDefault();
            submitApproval(e, exchangeId);
            approvalModal.remove();
        });
        
        // Center modal
        setTimeout(() => {
            // Scroll page to top first
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            
            // Then scroll modal to top
            approvalModal.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
                inline: 'nearest'
            });
        }, 100);
    }

    // Submit approval function
    function submitApproval(event, exchangeId) {
        console.log('submitApproval called for exchange:', exchangeId);
        
        const formData = {
            phone: document.getElementById('approvalPhone').value,
            email: document.getElementById('approvalEmail').value,
            address: document.getElementById('approvalAddress').value,
            city: document.getElementById('approvalCity').value,
            state: document.getElementById('approvalState').value,
            zip: document.getElementById('approvalZip').value,
            agreement: document.getElementById('approvalAgreement').checked
        };
        
        // Validate form
        if (!formData.phone || !formData.email || !formData.address || !formData.city || !formData.state || !formData.zip || !formData.agreement) {
            showNotification('Please fill in all required fields and agree to the terms.', 'error');
            return;
        }
        
        const exchange = exchanges.find(e => e.id === exchangeId);
        if (!exchange) return;
        
        // Update exchange status to completed
        exchange.status = 'completed';
        exchange.approvalData = {
            ...formData,
            approvedAt: new Date().toISOString(),
            approvedBy: 1 // Current user ID
        };
        
        // Save approved exchanges to localStorage
        saveApprovedExchange(exchange);
        
        // Add exchange items to My Items
        addExchangeToMyItems(exchange);
        
        // Update UI
        const exchangeCard = document.querySelector(`[data-exchange-id="${exchangeId}"]`);
        if (exchangeCard) {
            const statusBadge = exchangeCard.querySelector('.exchange-status');
            if (statusBadge) {
                statusBadge.textContent = 'completed';
                statusBadge.className = 'exchange-status completed';
            }
        }
        
        // Get product names for approval comment
        const offeredProduct = getProductById(exchange.offeredProductId);
        const wantedProduct = getProductById(exchange.wantedProductId);
        
        // Add approval comment
        const approvalComment = {
            id: exchange.comments.length + 1,
            userId: 1, // Current user
            text: `✅ Exchange approved and completed! ${offeredProduct?.title || offeredProduct?.name || `Product ${exchange.offeredProductId}`} for ${wantedProduct?.title || wantedProduct?.name || `Product ${exchange.wantedProductId}`}. Contact: ${formData.phone} | ${formData.email}`,
            date: new Date().toISOString().split('T')[0],
            isApproval: true
        };
        
        exchange.comments.push(approvalComment);
        
        // Update stats
        updateStats();
        
        showNotification('Exchange approved and completed successfully!', 'success');
        
        // Re-render exchanges to update status
        renderExchanges();
    }

    // Save approved exchange to localStorage
    function saveApprovedExchange(exchange) {
        try {
            const approvedExchanges = JSON.parse(localStorage.getItem('approvedExchanges') || '[]');
            approvedExchanges.push(exchange);
            localStorage.setItem('approvedExchanges', JSON.stringify(approvedExchanges));
            console.log('✅ Approved exchange saved to localStorage');
        } catch (error) {
            console.error('❌ Error saving approved exchange:', error);
        }
    }

    // Add exchange items to My Items
    function addExchangeToMyItems(exchange) {
        try {
            // Get current purchased items
            const purchasedItems = JSON.parse(localStorage.getItem('purchasedItems') || '[]');
            
            // Get product information (like in products.js)
            const offeredProduct = getProductById(exchange.offeredProductId);
            const wantedProduct = getProductById(exchange.wantedProductId);
            
            console.log('🔄 Adding exchange to My Items:', exchange);
            console.log('📦 Offered product:', offeredProduct);
            console.log('📦 Wanted product:', wantedProduct);
            
            // Create items from the exchange (like in products.js)
            const exchangeItems = [
                {
                    id: `exchange-${exchange.id}-offered`,
                    name: offeredProduct?.title || offeredProduct?.name || `Product ${exchange.offeredProductId}`,
                    title: offeredProduct?.title || offeredProduct?.name || `Product ${exchange.offeredProductId}`,
                    brand: offeredProduct?.brand || 'Exchange Item',
                    price: 0,
                    quantity: 1,
                    size: exchange.offeredSize,
                    category: offeredProduct?.category || 'unknown',
                    image: offeredProduct?.image || (offeredProduct?.images && offeredProduct?.images[0]) || '/images/placeholder.jpg',
                    type: 'exchange',
                    exchangeId: exchange.id,
                    isOffered: true,
                    purchaseDate: new Date().toISOString(),
                    status: 'completed'
                },
                {
                    id: `exchange-${exchange.id}-wanted`,
                    name: wantedProduct?.title || wantedProduct?.name || `Product ${exchange.wantedProductId}`,
                    title: wantedProduct?.title || wantedProduct?.name || `Product ${exchange.wantedProductId}`,
                    brand: wantedProduct?.brand || 'Exchange Item',
                    price: 0,
                    quantity: 1,
                    size: exchange.wantedSize,
                    category: wantedProduct?.category || 'unknown',
                    image: wantedProduct?.image || (wantedProduct?.images && wantedProduct?.images[0]) || '/images/placeholder.jpg',
                    type: 'exchange',
                    exchangeId: exchange.id,
                    isWanted: true,
                    purchaseDate: new Date().toISOString(),
                    status: 'completed'
                }
            ];
            
            console.log('✅ Created exchange items:', exchangeItems);
            
            // Add to purchased items
            purchasedItems.push(...exchangeItems);
            localStorage.setItem('purchasedItems', JSON.stringify(purchasedItems));
            
            console.log('✅ Exchange items added to My Items');
        } catch (error) {
            console.error('❌ Error adding exchange to My Items:', error);
        }
    }

    // Load approved exchanges from localStorage on page load
    function loadApprovedExchanges() {
        try {
            // Check if products are loaded
            if (!products || products.length === 0) {
                console.warn('⚠️ Products not loaded yet, skipping approved exchanges load');
                return;
            }
            
            const approvedExchanges = JSON.parse(localStorage.getItem('approvedExchanges') || '[]');
            
            // Update exchanges with approved status
            approvedExchanges.forEach(approvedExchange => {
                const existingExchange = exchanges.find(e => e.id === approvedExchange.id);
                if (existingExchange) {
                    existingExchange.status = 'completed';
                    existingExchange.approvalData = approvedExchange.approvalData;
                    
                    // Add approval comment if not exists
                    const hasApprovalComment = existingExchange.comments.some(c => c.isApproval);
                    if (!hasApprovalComment && approvedExchange.approvalData) {
                        const offeredProduct = getProductById(existingExchange.offeredProductId);
                        const wantedProduct = getProductById(existingExchange.wantedProductId);
                        
                        const approvalComment = {
                            id: existingExchange.comments.length + 1,
                            userId: 1,
                            text: `✅ Exchange approved and completed! ${offeredProduct?.title || offeredProduct?.name || `Product ${existingExchange.offeredProductId}`} for ${wantedProduct?.title || wantedProduct?.name || `Product ${existingExchange.wantedProductId}`}. Contact: ${approvedExchange.approvalData.phone} | ${approvedExchange.approvalData.email}`,
                            date: new Date(approvedExchange.approvalData.approvedAt).toISOString().split('T')[0],
                            isApproval: true
                        };
                        existingExchange.comments.push(approvalComment);
                    }
                }
            });
            
            console.log('✅ Loaded approved exchanges from localStorage');
        } catch (error) {
            console.error('❌ Error loading approved exchanges:', error);
        }
    }

    // Show notification
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 2rem;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 3000;
            animation: slideIn 0.3s ease;
        `;
        
        if (type === 'success') {
            notification.style.background = 'var(--accent-neon-green)';
        } else if (type === 'error') {
            notification.style.background = '#ff4444';
        } else {
            notification.style.background = 'var(--accent-neon-cyan)';
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Initialize the page
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 0);
    }
}); 