// Search functionality
document.addEventListener('DOMContentLoaded', function() {
    initSearch();
    
    // Setup admin access checks
    setTimeout(() => {
        if (typeof setupAdminAccessChecks === 'function') {
            setupAdminAccessChecks();
        }
    }, 1000);
});

function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchSuggestions = document.getElementById('searchSuggestions');
    
    if (!searchInput) return;
    
    // Add event listeners for search input
    searchInput.addEventListener('input', debounce(handleSearchInput, 300));
    searchInput.addEventListener('focus', handleSearchFocus);
    searchInput.addEventListener('blur', handleSearchBlur);
    
    // Add keyboard navigation
    searchInput.addEventListener('keydown', handleSearchKeydown);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

async function handleSearchInput(e) {
    const query = e.target.value.trim();
    const suggestionsContainer = document.getElementById('searchSuggestions');
    
    if (query.length < 2) {
        suggestionsContainer.innerHTML = '';
        return;
    }
    
    try {
        const response = await fetch(`/api/products/search/suggestions?q=${encodeURIComponent(query)}&limit=10&page=1`);
        const data = await response.json();
        
        renderSearchSuggestions(data.suggestions);
    } catch (error) {
        console.error('Search error:', error);
        suggestionsContainer.innerHTML = '<p style="padding: 1rem; color: var(--text-gray);">Search failed</p>';
    }
}

function renderSearchSuggestions(suggestions) {
    const container = document.getElementById('searchSuggestions');
    if (!container) return;
    
    if (suggestions.length === 0) {
        container.innerHTML = '<p style="padding: 1rem; color: var(--text-gray);">No products found</p>';
        return;
    }
    
    container.innerHTML = suggestions.map((product, index) => `
        <div class="search-suggestion" 
             data-index="${index}"
             onclick="selectSearchResult('${product.id}')" 
             onmouseenter="highlightSearchSuggestion(${index})"
             style="padding: 1rem; border-bottom: 1px solid var(--text-gray); cursor: pointer; transition: background 0.3s ease;">
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="width: 40px; height: 40px; background: var(--secondary-dark); border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                    ${product.image ? 
                        `<img src="${product.image}" alt="${product.title}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;">` :
                        '👕'
                    }
                </div>
                <div>
                    <h4 style="margin: 0; color: var(--accent-neon-cyan);">${product.title}</h4>
                    <p style="margin: 0; color: var(--text-gray);">${product.brand} - $${product.price.toFixed(2)}</p>
                </div>
            </div>
        </div>
    `).join('');
}

function handleSearchFocus() {
    const suggestionsContainer = document.getElementById('searchSuggestions');
    if (suggestionsContainer.children.length > 0) {
        suggestionsContainer.style.display = 'block';
    }
}

function handleSearchBlur() {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
        const suggestionsContainer = document.getElementById('searchSuggestions');
        suggestionsContainer.style.display = 'none';
    }, 200);
}

function handleSearchKeydown(e) {
    const suggestionsContainer = document.getElementById('searchSuggestions');
    const suggestions = suggestionsContainer.querySelectorAll('.search-suggestion');
    
    if (suggestions.length === 0) return;
    
    const currentHighlighted = suggestionsContainer.querySelector('.search-suggestion.highlighted');
    let currentIndex = currentHighlighted ? parseInt(currentHighlighted.dataset.index) : -1;
    
    switch (e.key) {
        case 'ArrowDown':
            e.preventDefault();
            if (currentIndex < suggestions.length - 1) {
                if (currentHighlighted) currentHighlighted.classList.remove('highlighted');
                suggestions[currentIndex + 1].classList.add('highlighted');
            }
            break;
            
        case 'ArrowUp':
            e.preventDefault();
            if (currentIndex > 0) {
                if (currentHighlighted) currentHighlighted.classList.remove('highlighted');
                suggestions[currentIndex - 1].classList.add('highlighted');
            }
            break;
            
        case 'Enter':
            e.preventDefault();
            if (currentHighlighted) {
                const productId = currentHighlighted.onclick.toString().match(/'([^']+)'/)[1];
                selectSearchResult(productId);
            }
            break;
            
        case 'Escape':
            e.preventDefault();
            document.getElementById('searchModal').style.display = 'none';
            break;
    }
}

function highlightSearchSuggestion(index) {
    const suggestionsContainer = document.getElementById('searchSuggestions');
    const suggestions = suggestionsContainer.querySelectorAll('.search-suggestion');
    
    suggestions.forEach(suggestion => suggestion.classList.remove('highlighted'));
    suggestions[index].classList.add('highlighted');
}

function selectSearchResult(productId) {
    // Close search modal
    document.getElementById('searchModal').style.display = 'none';
    
    // Navigate to product page
    window.location.href = `/product/${productId}`;
}

// Advanced search functionality
function initAdvancedSearch() {
    const searchForm = document.getElementById('advancedSearchForm');
    if (!searchForm) return;
    
    searchForm.addEventListener('submit', handleAdvancedSearch);
}

async function handleAdvancedSearch(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const searchParams = new URLSearchParams();
    
    // Add search parameters
    const search = formData.get('search');
    const category = formData.get('category');
    const brand = formData.get('brand');
    const minPrice = formData.get('minPrice');
    const maxPrice = formData.get('maxPrice');
    const size = formData.get('size');
    const condition = formData.get('condition');
    
    if (search) searchParams.append('search', search);
    if (category) searchParams.append('category', category);
    if (brand) searchParams.append('brand', brand);
    if (minPrice) searchParams.append('minPrice', minPrice);
    if (maxPrice) searchParams.append('maxPrice', maxPrice);
    if (size) searchParams.append('size', size);
    if (condition) searchParams.append('condition', condition);
    
    // Navigate to products page with search parameters
    window.location.href = `/products?${searchParams.toString()}`;
}

// Search filters
function initSearchFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const filterType = btn.dataset.filter;
            const filterValue = btn.dataset.value;
            
            applySearchFilter(filterType, filterValue);
        });
    });
    
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearAllFilters);
    }
}

function applySearchFilter(filterType, filterValue) {
    const url = new URL(window.location);
    
    if (filterValue === 'all') {
        url.searchParams.delete(filterType);
    } else {
        url.searchParams.set(filterType, filterValue);
    }
    
    window.location.href = url.toString();
}

function clearAllFilters() {
    const url = new URL(window.location);
    url.search = '';
    window.location.href = url.toString();
}

// Search history
function addToSearchHistory(query) {
    let searchHistory = JSON.parse(localStorage.getItem('zippySearchHistory') || '[]');
    
    // Remove if already exists
    searchHistory = searchHistory.filter(item => item !== query);
    
    // Add to beginning
    searchHistory.unshift(query);
    
    // Keep only last 10 searches
    searchHistory = searchHistory.slice(0, 10);
    
    localStorage.setItem('zippySearchHistory', JSON.stringify(searchHistory));
}

function getSearchHistory() {
    return JSON.parse(localStorage.getItem('zippySearchHistory') || '[]');
}

function renderSearchHistory() {
    const history = getSearchHistory();
    const container = document.getElementById('searchHistory');
    
    if (!container || history.length === 0) return;
    
    container.innerHTML = history.map(query => `
        <div class="search-history-item" onclick="performSearch('${query}')">
            <span>🔍</span>
            <span>${query}</span>
        </div>
    `).join('');
}

function performSearch(query) {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = query;
        searchInput.dispatchEvent(new Event('input'));
    }
}

// Export functions
window.SearchModule = {
    handleSearchInput,
    selectSearchResult,
    handleAdvancedSearch,
    applySearchFilter,
    clearAllFilters,
    addToSearchHistory,
    getSearchHistory,
    renderSearchHistory,
    performSearch
}; 