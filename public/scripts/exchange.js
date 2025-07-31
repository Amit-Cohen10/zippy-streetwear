// Exchange Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Only run on exchange page
    if (!window.location.pathname.includes('exchange')) {
        return;
    }

    // Sample data for 3 fictional users
    const users = [
        { id: 1, name: "CyberVibes", avatar: "👨‍💻", color: "#00ffff" },
        { id: 2, name: "NeonQueen", avatar: "👩‍🎨", color: "#ff00ff" },
        { id: 3, name: "StreetTech", avatar: "🧑‍🔧", color: "#00ff00" }
    ];

    // Sample exchange data
    const exchanges = [
        {
            id: 1,
            title: "Vintage Neural Network Hoodie for Retro Future",
            description: "Looking to trade my rare vintage Neural Network hoodie (M) for any Retro Future hoodie in size M. This is a limited edition piece from 2022 that's no longer available.",
            offeredCategory: "hoodies",
            offeredSize: "M",
            wantedCategory: "hoodies",
            wantedSize: "M",
            status: "active",
            userId: 1,
            likes: 12,
            comments: [
                { id: 1, userId: 2, text: "I have a Retro Future hoodie in M! DM me", date: "2024-01-15" },
                { id: 2, userId: 3, text: "Great piece! Wish I had something to trade", date: "2024-01-14" }
            ],
            createdAt: "2024-01-10"
        },
        {
            id: 2,
            title: "Cyber Samurai Pants for Data Stream",
            description: "Trading my Cyber Samurai pants (L) for Data Stream pants in size L. Both are in excellent condition, barely worn.",
            offeredCategory: "pants",
            offeredSize: "L",
            wantedCategory: "pants",
            wantedSize: "L",
            status: "pending",
            userId: 2,
            likes: 8,
            comments: [
                { id: 3, userId: 1, text: "I have Data Stream pants in L! Let's trade", date: "2024-01-13" }
            ],
            createdAt: "2024-01-12"
        },
        {
            id: 3,
            title: "404 Not Found Tee for System Override",
            description: "Looking to exchange my 404 Not Found tee (XL) for System Override tee in XL. Both are from the same collection.",
            offeredCategory: "t-shirts",
            offeredSize: "XL",
            wantedCategory: "t-shirts",
            wantedSize: "XL",
            status: "completed",
            userId: 3,
            likes: 15,
            comments: [
                { id: 4, userId: 1, text: "Perfect! I have System Override in XL", date: "2024-01-11" },
                { id: 5, userId: 2, text: "Great trade! Both pieces are amazing", date: "2024-01-10" }
            ],
            createdAt: "2024-01-08"
        },
        {
            id: 4,
            title: "Hologram Hoodie for Quantum",
            description: "Trading my Hologram hoodie (S) for Quantum hoodie in size S. Both are from the latest collection.",
            offeredCategory: "hoodies",
            offeredSize: "S",
            wantedCategory: "hoodies",
            wantedSize: "S",
            status: "active",
            userId: 1,
            likes: 6,
            comments: [],
            createdAt: "2024-01-16"
        },
        {
            id: 5,
            title: "Matrix Rain for Digital Camo",
            description: "Looking to trade Matrix Rain hoodie (M) for Digital Camo hoodie in M. Both are in perfect condition.",
            offeredCategory: "hoodies",
            offeredSize: "M",
            wantedCategory: "hoodies",
            wantedSize: "M",
            status: "active",
            userId: 2,
            likes: 9,
            comments: [
                { id: 6, userId: 3, text: "I have Digital Camo in M! Interested?", date: "2024-01-15" }
            ],
            createdAt: "2024-01-14"
        },
        {
            id: 6,
            title: "Tactical Tech Cargo for Urban Operator",
            description: "Trading Tactical Tech cargo pants (L) for Urban Operator pants in L. Both are tactical style.",
            offeredCategory: "pants",
            offeredSize: "L",
            wantedCategory: "pants",
            wantedSize: "L",
            status: "pending",
            userId: 3,
            likes: 11,
            comments: [
                { id: 7, userId: 1, text: "I have Urban Operator pants! Let's discuss", date: "2024-01-13" }
            ],
            createdAt: "2024-01-12"
        }
    ];

    let filteredExchanges = [...exchanges];
    let currentUser = null;
    let isInitialized = false;
    let lastRenderTime = 0;
    const RENDER_THROTTLE = 100;

    // Initialize the page
    function init() {
        if (isInitialized) return;
        
        try {
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
            
            // Initialize with requestAnimationFrame for better performance
            requestAnimationFrame(() => {
                try {
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

    // Create exchange card with all interactions
    function createExchangeCard(exchange) {
        const user = users.find(u => u.id === exchange.userId);
        const card = document.createElement('div');
        card.className = 'exchange-card';
        card.dataset.exchangeId = exchange.id;
        
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
                <p class="card-description">${exchange.description}</p>
                <div class="exchange-items">
                    <div class="offering-section">
                        <h4>Offering</h4>
                        <div class="item-display">
                            ${exchange.offeredCategory} - Size ${exchange.offeredSize}
                        </div>
                    </div>
                    <div class="exchange-arrow">⇄</div>
                    <div class="wanted-section">
                        <h4>Wanting</h4>
                        <div class="item-display">
                            ${exchange.wantedCategory} - Size ${exchange.wantedSize}
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

        // Add event listeners only if elements exist
        if (elements.createExchangeBtn) {
            elements.createExchangeBtn.addEventListener('click', () => {
                const createModal = document.getElementById('createExchangeModal');
                createModal.classList.add('active');
                
                // Ensure modal is centered in viewport
                setTimeout(() => {
                    const modalRect = createModal.getBoundingClientRect();
                    const viewportHeight = window.innerHeight;
                    const viewportWidth = window.innerWidth;
                    
                    const isNotFullyVisible = 
                        modalRect.top < 0 || 
                        modalRect.bottom > viewportHeight ||
                        modalRect.left < 0 ||
                        modalRect.right > viewportWidth;
                    
                    if (isNotFullyVisible) {
                        createModal.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center',
                            inline: 'center'
                        });
                    }
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
                const matchesSearch = !searchTerm || 
                    exchange.title.toLowerCase().includes(searchTerm) ||
                    exchange.description.toLowerCase().includes(searchTerm);
                
                const matchesCategory = !category || 
                    exchange.offeredCategory === category || 
                    exchange.wantedCategory === category;
                
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
                offeredCategory: document.getElementById('offeredCategory').value,
                offeredSize: document.getElementById('offeredSize').value,
                wantedCategory: document.getElementById('wantedCategory').value,
                wantedSize: document.getElementById('wantedSize').value
            };

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
        
        // Populate modal
        document.getElementById('detailTitle').textContent = exchange.title;
        document.getElementById('detailDescription').textContent = exchange.description;
        document.getElementById('offeringDisplay').textContent = `${exchange.offeredCategory} - Size ${exchange.offeredSize}`;
        document.getElementById('wantedDisplay').textContent = `${exchange.wantedCategory} - Size ${exchange.wantedSize}`;
        document.getElementById('likeCount').textContent = exchange.likes;
        
        // Render comments
        renderComments(exchange.comments);
        
        // Show modal
        const detailModal = document.getElementById('exchangeDetailModal');
        detailModal.classList.add('active');
        
        // Ensure modal is centered in viewport
        setTimeout(() => {
            const modalRect = detailModal.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;
            
            // Check if modal is not fully visible
            const isNotFullyVisible = 
                modalRect.top < 0 || 
                modalRect.bottom > viewportHeight ||
                modalRect.left < 0 ||
                modalRect.right > viewportWidth;
            
            if (isNotFullyVisible) {
                detailModal.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'center'
                });
            }
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
        const exchange = exchanges.find(e => e.id === exchangeId);
        if (!exchange) return;

        // Close modal
        document.getElementById('closeDetailModal').addEventListener('click', () => {
            document.getElementById('exchangeDetailModal').classList.remove('active');
        }, { passive: true });

        // Like button
        document.getElementById('likeBtn').addEventListener('click', () => {
            toggleLike(exchangeId);
        }, { passive: true });

        // Add comment
        document.getElementById('addCommentBtn').addEventListener('click', () => {
            addComment(exchangeId);
        }, { passive: true });

        // Respond button
        document.getElementById('respondBtn').addEventListener('click', () => {
            respondToExchange(exchangeId);
        }, { passive: true });
    }

    // Toggle like
    function toggleLike(exchangeId) {
        const exchange = exchanges.find(e => e.id === exchangeId);
        if (!exchange) return;

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
        if (detailLikeBtn) {
            detailLikeBtn.classList.toggle('liked', exchange.liked);
            document.getElementById('likeCount').textContent = exchange.likes;
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
        console.log('Respond button clicked for exchange:', exchangeId);
        
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
            
            const isNotFullyVisible = 
                modalRect.top < 0 || 
                modalRect.bottom > viewportHeight ||
                modalRect.left < 0 ||
                modalRect.right > viewportWidth;
            
            if (isNotFullyVisible) {
                counterModal.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'center'
                });
            }
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