// Community Feed JavaScript
console.log('Community Feed script loaded');

document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    console.log('Community Feed DOM loaded, initializing...');

    // Sample data for community posts
    const communityPosts = [
        {
            id: 1,
            author: 'CyberVibes',
            avatar: '👨‍💻',
            color: '#00ffff',
            title: 'My New Neon Cyber Hoodie Look',
            content: 'Just got this amazing neon cyber hoodie and paired it with some tactical cargo pants. The color scheme is perfect for the cyberpunk aesthetic!',
            category: 'outfits',
            image: '/images/posts/cyber-hoodie-look.jpg',
            likes: 156,
            comments: 23,
            timestamp: '2 hours ago',
            tags: ['cyberpunk', 'neon', 'hoodie', 'streetwear']
        },
        {
            id: 2,
            author: 'NeonQueen',
            avatar: '👩‍🎨',
            color: '#ff00ff',
            title: 'Glitch Art Tee Review',
            content: 'This glitch art tee is absolutely stunning! The print quality is top-notch and it fits perfectly. Highly recommend for anyone into digital art aesthetics.',
            category: 'reviews',
            image: '/images/posts/glitch-art-tee.jpg',
            likes: 89,
            comments: 15,
            timestamp: '4 hours ago',
            tags: ['glitch', 'art', 'tee', 'review']
        },
        {
            id: 3,
            author: 'StreetTech',
            avatar: '🧑‍🔧',
            color: '#00ff00',
            title: 'Holographic Cargo Pants Styling Tips',
            content: 'Here are my top tips for styling holographic cargo pants: 1) Keep the top simple, 2) Add metallic accessories, 3) Go for chunky sneakers. The holographic effect really pops!',
            category: 'tips',
            image: '/images/posts/holographic-cargo.jpg',
            likes: 234,
            comments: 31,
            timestamp: '6 hours ago',
            tags: ['holographic', 'cargo', 'styling', 'tips']
        },
        {
            id: 4,
            author: 'DigitalNomad',
            avatar: '👨‍💼',
            color: '#ffff00',
            title: 'Cyberpunk Streetwear Collection',
            content: 'Just completed my cyberpunk streetwear collection! The neon accents and futuristic designs are absolutely perfect for the modern aesthetic.',
            category: 'outfits',
            image: '/images/posts/cyberpunk-collection.jpg',
            likes: 312,
            comments: 45,
            timestamp: '1 day ago',
            tags: ['cyberpunk', 'collection', 'neon', 'futuristic']
        },
        {
            id: 5,
            author: 'StyleGuru',
            avatar: '👩‍🎤',
            color: '#ff8800',
            title: 'How to Style Neon Accessories',
            content: 'Neon accessories can be tricky to style, but here\'s my guide: 1) Start with neutral base, 2) Add one neon piece, 3) Keep the rest minimal. Works every time!',
            category: 'tips',
            image: null,
            likes: 67,
            comments: 12,
            timestamp: '3 days ago',
            tags: ['neon', 'accessories', 'styling', 'tips']
        },
        {
            id: 6,
            author: 'FashionForward',
            avatar: '👨‍🎭',
            color: '#8800ff',
            title: 'Review: Zippy Neon Collection',
            content: 'The quality of these pieces is incredible. The neon accents really pop and the fit is perfect. Highly recommend for anyone into streetwear!',
            category: 'reviews',
            image: '/images/posts/zippy-neon-review.jpg',
            likes: 189,
            comments: 28,
            timestamp: '4 days ago',
            tags: ['review', 'neon', 'zippy', 'streetwear']
        }
    ];

    // Trending items data
    const trendingItems = [
        {
            id: 1,
            title: 'Neon Cyber Hoodie',
            category: 'hoodies',
            likes: 156,
            image: '/images/trending/neon-hoodie.jpg'
        },
        {
            id: 2,
            title: 'Glitch Art Tee',
            category: 't-shirts',
            likes: 89,
            image: '/images/trending/glitch-tee.jpg'
        },
        {
            id: 3,
            title: 'Holographic Cargo Pants',
            category: 'pants',
            likes: 234,
            image: '/images/trending/holographic-pants.jpg'
        },
        {
            id: 4,
            title: 'Digital Distortion Cap',
            category: 'accessories',
            likes: 67,
            image: '/images/trending/digital-cap.jpg'
        }
    ];

    let filteredPosts = [...communityPosts];
    let isInitialized = false;

    // Initialize the page
    function init() {
        try {
            console.log('Initializing Community Feed...');
            
            // Check if we're on the community page
            if (!document.querySelector('.community-page')) {
                console.log('Not on community page, skipping initialization');
                return;
            }
            
            // Setup event listeners
            setupEventListeners();
            
            // Load initial data
            loadCommunityData();
            
            // Update stats
            updateStats();
            
            console.log('Community Feed initialized successfully');
            isInitialized = true;
            
        } catch (error) {
            console.error('Error initializing Community Feed:', error);
        }
    }

    // Setup event listeners
    function setupEventListeners() {
        try {
            console.log('Setting up event listeners...');
            
            const elements = {
                createPostBtn: document.getElementById('createPostBtn'),
                uploadOutfitBtn: document.getElementById('uploadOutfitBtn'),
                closeCreatePostModal: document.getElementById('closeCreatePostModal'),
                closeUploadOutfitModal: document.getElementById('closeUploadOutfitModal'),
                createPostForm: document.getElementById('createPostForm'),
                uploadOutfitForm: document.getElementById('uploadOutfitForm'),
                communitySearch: document.getElementById('communitySearch'),
                categoryFilter: document.getElementById('categoryFilter'),
                sortFilter: document.getElementById('sortFilter'),
                cancelPost: document.getElementById('cancelPost'),
                cancelOutfit: document.getElementById('cancelOutfit')
            };

            // Add event listeners only if elements exist
            if (elements.createPostBtn) {
                elements.createPostBtn.addEventListener('click', () => {
                    const createPostModal = document.getElementById('createPostModal');
                    createPostModal.classList.add('active');
                    
                    // Scroll to modal and center it
                    setTimeout(() => {
                        createPostModal.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'center' 
                        });
                    }, 100);
                });
            }

            if (elements.uploadOutfitBtn) {
                elements.uploadOutfitBtn.addEventListener('click', () => {
                    const uploadOutfitModal = document.getElementById('uploadOutfitModal');
                    uploadOutfitModal.classList.add('active');
                    
                    // Scroll to modal and center it
                    setTimeout(() => {
                        uploadOutfitModal.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'center' 
                        });
                    }, 100);
                });
            }

            if (elements.closeCreatePostModal) {
                elements.closeCreatePostModal.addEventListener('click', () => {
                    document.getElementById('createPostModal').classList.remove('active');
                });
            }

            if (elements.closeUploadOutfitModal) {
                elements.closeUploadOutfitModal.addEventListener('click', () => {
                    document.getElementById('uploadOutfitModal').classList.remove('active');
                });
            }

            if (elements.createPostForm) {
                elements.createPostForm.addEventListener('submit', handleCreatePost);
            }

            if (elements.uploadOutfitForm) {
                elements.uploadOutfitForm.addEventListener('submit', handleUploadOutfit);
            }

            if (elements.cancelPost) {
                elements.cancelPost.addEventListener('click', () => {
                    document.getElementById('createPostModal').classList.remove('active');
                });
            }

            if (elements.cancelOutfit) {
                elements.cancelOutfit.addEventListener('click', () => {
                    document.getElementById('uploadOutfitModal').classList.remove('active');
                });
            }

            // Add filter listeners
            if (elements.communitySearch) {
                elements.communitySearch.addEventListener('input', debounce(filterPosts, 300));
            }

            if (elements.categoryFilter) {
                elements.categoryFilter.addEventListener('change', filterPosts);
            }

            if (elements.sortFilter) {
                elements.sortFilter.addEventListener('change', filterPosts);
            }

            // Close modals when clicking outside
            document.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal')) {
                    e.target.classList.remove('active');
                }
            });

        } catch (error) {
            console.error('Error setting up event listeners:', error);
        }
    }

    // Debounce function
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

    // Load community data
    function loadCommunityData() {
        try {
            console.log('Loading community data...');
            
            renderTrendingItems();
            renderCommunityPosts();
            
            console.log('Community data loaded successfully');
            
        } catch (error) {
            console.error('Error loading community data:', error);
        }
    }

    // Render trending items
    function renderTrendingItems() {
        try {
            const trendingGrid = document.getElementById('trendingGrid');
            if (!trendingGrid) {
                console.log('Trending grid not found');
                return;
            }

            const fragment = document.createDocumentFragment();
            
            trendingItems.forEach(item => {
                const itemElement = createTrendingItem(item);
                fragment.appendChild(itemElement);
            });

            trendingGrid.innerHTML = '';
            trendingGrid.appendChild(fragment);
            
        } catch (error) {
            console.error('Error rendering trending items:', error);
        }
    }

    // Create trending item element
    function createTrendingItem(item) {
        const div = document.createElement('div');
        div.className = 'trending-item';
        div.innerHTML = `
            <div class="trending-item-header">
                <span class="trending-item-title">${item.title}</span>
                <span class="trending-item-category">${item.category}</span>
            </div>
            <div class="trending-item-stats">
                <span class="trending-likes">❤️ ${item.likes}</span>
            </div>
        `;
        
        div.addEventListener('click', () => {
            console.log('Trending item clicked:', item.title);
        });
        
        return div;
    }

    // Render community posts
    function renderCommunityPosts() {
        try {
            const communityGrid = document.getElementById('communityGrid');
            if (!communityGrid) {
                console.log('Community grid not found');
                return;
            }

            if (filteredPosts.length === 0) {
                communityGrid.innerHTML = `
                    <div class="no-posts" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                        <h3 style="font-family: 'Space Grotesk', sans-serif; color: var(--text-gray); margin-bottom: 16px;">No posts found</h3>
                        <p style="font-family: 'Space Grotesk', sans-serif; color: var(--text-gray);">Try adjusting your filters or create a new post.</p>
                    </div>
                `;
                return;
            }

            const fragment = document.createDocumentFragment();
            
            filteredPosts.forEach(post => {
                const postElement = createPostCard(post);
                fragment.appendChild(postElement);
            });

            communityGrid.innerHTML = '';
            communityGrid.appendChild(fragment);
            
        } catch (error) {
            console.error('Error rendering community posts:', error);
        }
    }

    // Create post card
    function createPostCard(post) {
        const card = document.createElement('div');
        card.className = 'post-card';
        card.dataset.postId = post.id;
        
        card.innerHTML = `
            <div class="card-header">
                <div class="user-info">
                    <span class="user-avatar" style="color: ${post.color}">${post.avatar}</span>
                    <span class="user-name">${post.author}</span>
                </div>
                <span class="post-category">${post.category}</span>
            </div>
            <div class="card-body">
                <h3 class="card-title">${post.title}</h3>
                <p class="card-content">${post.content}</p>
                ${post.image ? `<div class="post-image"><img src="${post.image}" alt="Post image" onerror="this.style.display='none'"></div>` : ''}
                <div class="post-tags">
                    ${post.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                </div>
            </div>
            <div class="card-footer">
                <div class="card-actions">
                    <button class="action-btn view-btn" data-post-id="${post.id}">
                        <span>👁️</span> View
                    </button>
                    <button class="action-btn comment-btn" data-post-id="${post.id}">
                        <span>💬</span> Comment
                    </button>
                </div>
                <div class="card-stats">
                    <button class="like-btn ${post.liked ? 'liked' : ''}" data-post-id="${post.id}">
                        <span class="like-icon">❤️</span>
                        <span class="like-count">${post.likes}</span>
                    </button>
                    <span class="comment-count">💬 ${post.comments}</span>
                    <span class="post-time">${post.timestamp}</span>
                </div>
            </div>
        `;
        
        // Add event listeners
        card.querySelector('.view-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            viewPost(post.id);
        });
        
        card.querySelector('.comment-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            commentPost(post.id);
        });
        
        card.querySelector('.like-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            toggleLike(post.id);
        });
        
        return card;
    }

    // Update stats
    function updateStats() {
        try {
            console.log('Updating community stats...');
            
            const totalPosts = document.getElementById('totalPosts');
            const activeUsers = document.getElementById('activeUsers');
            const trendingItemsCount = document.getElementById('trendingItems');
            const totalComments = document.getElementById('totalComments');

            if (totalPosts) {
                totalPosts.textContent = communityPosts.length;
                console.log('Updated total posts:', communityPosts.length);
            }
            
            if (activeUsers) {
                activeUsers.textContent = '89';
                console.log('Updated active users: 89');
            }
            
            if (trendingItemsCount) {
                trendingItemsCount.textContent = trendingItems.length;
                console.log('Updated trending items:', trendingItems.length);
            }
            
            if (totalComments) {
                const totalCommentsCount = communityPosts.reduce((sum, post) => sum + post.comments, 0);
                totalComments.textContent = totalCommentsCount;
                console.log('Updated total comments:', totalCommentsCount);
            }
            
            console.log('Stats updated successfully');
            
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }

    // Filter posts
    function filterPosts() {
        try {
            const searchTerm = document.getElementById('communitySearch')?.value.toLowerCase() || '';
            const category = document.getElementById('categoryFilter')?.value || '';
            const sort = document.getElementById('sortFilter')?.value || 'latest';

            filteredPosts = communityPosts.filter(post => {
                const matchesSearch = !searchTerm || 
                    post.title.toLowerCase().includes(searchTerm) ||
                    post.content.toLowerCase().includes(searchTerm) ||
                    post.tags.some(tag => tag.toLowerCase().includes(searchTerm));
                
                const matchesCategory = !category || post.category === category;
                
                return matchesSearch && matchesCategory;
            });

            // Sort posts
            if (sort === 'popular') {
                filteredPosts.sort((a, b) => b.likes - a.likes);
            } else if (sort === 'trending') {
                filteredPosts.sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments));
            } else {
                // Latest (default)
                filteredPosts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            }

            renderCommunityPosts();
            
        } catch (error) {
            console.error('Error filtering posts:', error);
        }
    }

    // Handle create post
    function handleCreatePost(e) {
        e.preventDefault();
        
        try {
            const formData = {
                title: document.getElementById('postTitle').value,
                content: document.getElementById('postContent').value,
                category: document.getElementById('postCategory').value,
                tags: document.getElementById('postTags').value
            };

            // Create new post
            const newPost = {
                id: communityPosts.length + 1,
                author: 'You',
                avatar: '👤',
                color: '#00ffff',
                ...formData,
                likes: 0,
                comments: 0,
                timestamp: 'Just now',
                tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
            };

            communityPosts.unshift(newPost);
            filteredPosts = [...communityPosts];
            
            // Close modal and reset form
            document.getElementById('createPostModal').classList.remove('active');
            document.getElementById('createPostForm').reset();
            
            renderCommunityPosts();
            updateStats();
            
            console.log('Post created successfully');
            
        } catch (error) {
            console.error('Error creating post:', error);
        }
    }

    // Handle upload outfit
    function handleUploadOutfit(e) {
        e.preventDefault();
        
        try {
            const formData = {
                title: document.getElementById('outfitTitle').value,
                description: document.getElementById('outfitDescription').value,
                tags: document.getElementById('outfitTags').value
            };

            // Create new outfit post
            const newOutfitPost = {
                id: communityPosts.length + 1,
                author: 'You',
                avatar: '👤',
                color: '#ff00ff',
                title: `Outfit: ${formData.title}`,
                content: formData.description,
                category: 'outfits',
                likes: 0,
                comments: 0,
                timestamp: 'Just now',
                tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
            };

            communityPosts.unshift(newOutfitPost);
            filteredPosts = [...communityPosts];
            
            // Close modal and reset form
            document.getElementById('uploadOutfitModal').classList.remove('active');
            document.getElementById('uploadOutfitForm').reset();
            
            renderCommunityPosts();
            updateStats();
            
            console.log('Outfit uploaded successfully');
            
        } catch (error) {
            console.error('Error uploading outfit:', error);
        }
    }

    // View post
    function viewPost(postId) {
        console.log('Viewing post:', postId);
        // Implement post detail view
    }

    // Comment on post
    function commentPost(postId) {
        console.log('Commenting on post:', postId);
        // Implement comment functionality
    }

    // Toggle like
    function toggleLike(postId) {
        console.log('Toggling like for post:', postId);
        const post = communityPosts.find(p => p.id === postId);
        if (post) {
            post.liked = !post.liked;
            post.likes += post.liked ? 1 : -1;
            
            // Update UI
            const likeBtn = document.querySelector(`[data-post-id="${postId}"] .like-btn`);
            if (likeBtn) {
                likeBtn.classList.toggle('liked', post.liked);
                likeBtn.querySelector('.like-count').textContent = post.likes;
            }
            
            updateStats();
        }
    }

    // Initialize the page
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}); 