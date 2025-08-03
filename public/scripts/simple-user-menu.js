// פתרון פשוט ונקי לתפריט המשתמש
// ללא קונפליקטים עם קוד קיים

(function() {
    'use strict';
    
    // מונה לחיצות לבדיקה
    let clickCount = 0;
    
    // חכה לטעינת הדף ולכל הסקריפטים האחרים
    document.addEventListener('DOMContentLoaded', function() {
        // המתן קצת שכל הסקריפטים יסתיימו
        setTimeout(initUserMenu, 500);
    });
    
    function initUserMenu() {
        console.log('🚀 Initializing simple user menu...');
        
        // ביטול כל event listeners קיימים על הכפתור כדי למנוע קונפליקטים
        const existingToggle = document.getElementById('userMenuToggle');
        if (existingToggle) {
            // שכפול הכפתור כדי להסיר כל listeners קיימים
            const newToggle = existingToggle.cloneNode(true);
            existingToggle.parentNode.replaceChild(newToggle, existingToggle);
            console.log('🔄 Cleared all existing event listeners from user menu toggle');
        }
        
        const authBtn = document.getElementById('authBtn');
        const userMenu = document.getElementById('userMenu'); 
        const userMenuToggle = document.getElementById('userMenuToggle');
        const userDropdown = document.getElementById('userDropdown');
        const usernameDisplay = document.getElementById('usernameDisplay');
        
        // בדיקה אם יש משתמש מחובר
        const savedUser = localStorage.getItem('currentUser');
        let isLoggedIn = false;
        let username = '';
        
        if (savedUser) {
            try {
                const user = JSON.parse(savedUser);
                isLoggedIn = true;
                username = user.profile?.displayName || user.username || 'User';
                console.log('✅ User is logged in:', username);
            } catch (e) {
                console.log('❌ Error parsing user data');
                localStorage.removeItem('currentUser');
            }
        }
        
        // הגדרת תצוגה בהתאם למצב
        if (isLoggedIn) {
            // משתמש מחובר - הצג תפריט משתמש
            authBtn.style.display = 'none';
            userMenu.style.display = 'block';
            usernameDisplay.textContent = username;
            
            // הוסף לחיצה לכפתור המשתמש עם עדיפות גבוהה
            userMenuToggle.addEventListener('click', function(e) {
                clickCount++;
                console.log(`🔢 CLICK COUNT: ${clickCount}`);
                console.log('🎯 Simple user menu click handler triggered');
                console.log('📍 Event details:', {
                    type: e.type,
                    target: e.target.id,
                    phase: e.eventPhase,
                    bubbles: e.bubbles
                });
                
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation(); // מונע מ-listeners אחרים לרוץ
                
                toggleDropdown();
            }, true); // capture phase - רץ לפני כל האחרים
            
            console.log('✅ User menu setup completed');
        } else {
            // משתמש לא מחובר - הצג LOGIN
            authBtn.style.display = 'inline-block';
            userMenu.style.display = 'none';
            console.log('✅ Login button setup completed');
        }
        
        // סגירת תפריט בלחיצה מחוץ לו
        document.addEventListener('click', function(e) {
            if (userDropdown && !userMenu.contains(e.target)) {
                userDropdown.style.display = 'none';
            }
        });
        
        // עדכון מיקום תפריט בשינוי גודל חלון
        window.addEventListener('resize', function() {
            const userDropdown = document.getElementById('userDropdown');
            if (userDropdown && getComputedStyle(userDropdown).display === 'block') {
                positionDropdownBelowButton();
                console.log('📱 Repositioned dropdown on window resize');
            }
        });
        
        // עדכון מיקום תפריט בגלילה
        window.addEventListener('scroll', function() {
            const userDropdown = document.getElementById('userDropdown');
            if (userDropdown && getComputedStyle(userDropdown).display === 'block') {
                positionDropdownBelowButton();
            }
        });
    }
    
    function positionDropdownBelowButton() {
        const userMenuToggle = document.getElementById('userMenuToggle');
        const userDropdown = document.getElementById('userDropdown');
        
        if (userMenuToggle && userDropdown) {
            const buttonRect = userMenuToggle.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
            
            // חישוב מיקום מתחת לכפתור
            const top = buttonRect.bottom + scrollTop + 5; // 5px מרווח
            const left = buttonRect.right + scrollLeft - 220; // יישור לצד ימין של הכפתור
            
            console.log('📍 Positioning dropdown:', {
                buttonRect: buttonRect,
                calculatedTop: top,
                calculatedLeft: left,
                scrollTop: scrollTop,
                scrollLeft: scrollLeft
            });
            
            // עדכון מיקום התפריט
            userDropdown.style.setProperty('position', 'absolute', 'important');
            userDropdown.style.setProperty('top', top + 'px', 'important');
            userDropdown.style.setProperty('left', left + 'px', 'important');
            userDropdown.style.setProperty('right', 'auto', 'important');
        }
    }

    function toggleDropdown() {
        const userDropdown = document.getElementById('userDropdown');
        
        console.log('🔄 toggleDropdown called');
        console.log('📋 Dropdown element:', userDropdown);
        
        if (userDropdown) {
            const currentDisplay = userDropdown.style.display;
            const currentVisibility = getComputedStyle(userDropdown).visibility;
            const currentOpacity = getComputedStyle(userDropdown).opacity;
            
            console.log('📊 Current state:', {
                display: currentDisplay,
                visibility: currentVisibility,
                opacity: currentOpacity,
                computedDisplay: getComputedStyle(userDropdown).display
            });
            
            // השתמש ב-computedDisplay במקום style.display כי CSS עלול לדרוס
            const computedDisplay = getComputedStyle(userDropdown).display;
            const isVisible = computedDisplay === 'block';
            
            if (isVisible) {
                userDropdown.style.setProperty('display', 'none', 'important');
                console.log('🔒 Dropdown closed - set display: none !important');
            } else {
                // מקם את התפריט מתחת לכפתור
                positionDropdownBelowButton();
                
                // פתח את התפריט
                userDropdown.style.setProperty('display', 'block', 'important');
                userDropdown.style.setProperty('visibility', 'visible', 'important');
                userDropdown.style.setProperty('opacity', '1', 'important');
                userDropdown.style.setProperty('z-index', '999999', 'important');
                console.log('🔓 Dropdown opened and positioned below button');
            }
            
            // בדיקה אחרי השינוי
            setTimeout(() => {
                console.log('📊 State after change:', {
                    display: userDropdown.style.display,
                    visibility: getComputedStyle(userDropdown).visibility,
                    opacity: getComputedStyle(userDropdown).opacity,
                    computedDisplay: getComputedStyle(userDropdown).display,
                    position: userDropdown.style.position,
                    top: userDropdown.style.top,
                    left: userDropdown.style.left
                });
            }, 10);
        } else {
            console.log('❌ Dropdown element not found!');
        }
    }
    
    // עדכון התפריט אחרי התחברות/התנתקות
    window.updateUserMenu = function() {
        console.log('🔄 Updating user menu...');
        initUserMenu();
    };
    
    // חסימת global.js מלטפל בכפתור המשתמש
    window.blockGlobalUserMenu = true;
    
})();