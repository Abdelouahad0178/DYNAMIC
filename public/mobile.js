// mobile.js - Optimisations mobiles et tactiles

// Utility function for passive/active event listeners
function addEventListenerSafe(element, event, handler, options = {}) {
    try {
        // Test if passive option is supported
        let passiveSupported = false;
        const testOptions = Object.defineProperty({}, "passive", {
            get: function() {
                passiveSupported = true;
            }
        });
        window.addEventListener("test", null, testOptions);
        window.removeEventListener("test", null, testOptions);
        
        // Apply options based on support and requirements
        if (passiveSupported) {
            element.addEventListener(event, handler, options);
        } else {
            element.addEventListener(event, handler, false);
        }
    } catch (error) {
        console.warn('Event listener fallback:', error);
        element.addEventListener(event, handler, false);
    }
}

// Optimized scrolling setup with proper passive listeners
function setupOptimizedScrolling() {
    try {
        const navMenu = document.querySelector('.nav-menu');
        if (!navMenu) {
            console.warn('Menu de navigation (.nav-menu) non trouvé');
            return;
        }

        const buttons = document.querySelectorAll('.nav-btn');
        if (buttons.length === 0) {
            console.warn('Aucun bouton de navigation (.nav-btn) trouvé');
        }

        // Variables for touch scrolling
        let touchState = {
            isScrolling: false,
            startX: 0,
            scrollLeft: 0,
            lastX: 0,
            velocity: 0,
            animationFrame: null
        };

        // Button click handling with smooth centering
        buttons.forEach((button) => {
            button.addEventListener('click', () => {
                if (window.innerWidth < 768) {
                    requestAnimationFrame(() => centerButtonInView(button, navMenu));
                }
            });
        });

        // Optimized touch handlers
        addEventListenerSafe(navMenu, 'touchstart', (e) => {
            const touch = e.touches[0];
            touchState.isScrolling = true;
            touchState.startX = touch.pageX - navMenu.offsetLeft;
            touchState.scrollLeft = navMenu.scrollLeft;
            touchState.lastX = touch.pageX;
            touchState.velocity = 0;
            
            if (touchState.animationFrame) {
                cancelAnimationFrame(touchState.animationFrame);
            }
        }, { passive: true });

        addEventListenerSafe(navMenu, 'touchmove', (e) => {
            if (!touchState.isScrolling) return;
            
            const touch = e.touches[0];
            const currentX = touch.pageX - navMenu.offsetLeft;
            const deltaX = currentX - touchState.startX;
            touchState.velocity = touch.pageX - touchState.lastX;
            touchState.lastX = touch.pageX;
            
            navMenu.scrollLeft = touchState.scrollLeft - deltaX;
        }, { passive: true });

        addEventListenerSafe(navMenu, 'touchend', () => {
            touchState.isScrolling = false;
            
            // Apply momentum scrolling if velocity is significant
            if (Math.abs(touchState.velocity) > 1) {
                applyMomentumScrolling(navMenu, touchState.velocity);
            }
        }, { passive: true });

        // Mouse wheel with passive listener where possible
        addEventListenerSafe(navMenu, 'wheel', (e) => {
            navMenu.scrollLeft += e.deltaY * 0.5;
        }, { passive: true });

        // Setup table scrolling
        setupTableScrolling();

    } catch (error) {
        console.error('Erreur lors de la configuration du défilement:', error);
    }
}

// Apply momentum scrolling animation
function applyMomentumScrolling(element, velocity) {
    let currentVelocity = velocity * 0.5; // Initial momentum
    const friction = 0.95; // Friction factor
    const minVelocity = 0.1;

    function animate() {
        if (Math.abs(currentVelocity) < minVelocity) return;
        
        element.scrollLeft -= currentVelocity;
        currentVelocity *= friction;
        
        requestAnimationFrame(animate);
    }
    
    requestAnimationFrame(animate);
}

// Optimized table scrolling
function setupTableScrolling() {
    const tableWrappers = document.querySelectorAll('.table-wrapper');
    if (!tableWrappers.length) {
        console.warn('Aucun conteneur de table (.table-wrapper) trouvé');
        return;
    }

    tableWrappers.forEach(wrapper => {
        // Touch state for this wrapper
        let touchState = {
            isScrolling: false,
            startX: 0,
            scrollLeft: 0,
            lastX: 0,
            velocity: 0
        };

        // Ensure wrapper is keyboard accessible
        if (!wrapper.hasAttribute('tabindex')) {
            wrapper.setAttribute('tabindex', '0');
        }

        // Optimized touch events for tables
        addEventListenerSafe(wrapper, 'touchstart', (e) => {
            const touch = e.touches[0];
            touchState.isScrolling = true;
            touchState.startX = touch.pageX - wrapper.offsetLeft;
            touchState.scrollLeft = wrapper.scrollLeft;
            touchState.lastX = touch.pageX;
        }, { passive: true });

        addEventListenerSafe(wrapper, 'touchmove', (e) => {
            if (!touchState.isScrolling) return;
            
            const touch = e.touches[0];
            const currentX = touch.pageX - wrapper.offsetLeft;
            const deltaX = currentX - touchState.startX;
            touchState.velocity = touch.pageX - touchState.lastX;
            touchState.lastX = touch.pageX;
            
            wrapper.scrollLeft = touchState.scrollLeft - deltaX;
        }, { passive: true });

        addEventListenerSafe(wrapper, 'touchend', () => {
            touchState.isScrolling = false;
            
            if (Math.abs(touchState.velocity) > 1) {
                applyMomentumScrolling(wrapper, touchState.velocity);
            }
        }, { passive: true });

        // Scroll indicators with passive listener
        addEventListenerSafe(wrapper, 'scroll', () => {
            requestAnimationFrame(() => updateScrollIndicators(wrapper));
        }, { passive: true });

        // Keyboard navigation
        wrapper.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                wrapper.scrollBy({ left: -100, behavior: 'smooth' });
                e.preventDefault();
            } else if (e.key === 'ArrowRight') {
                wrapper.scrollBy({ left: 100, behavior: 'smooth' });
                e.preventDefault();
            }
        });

        // Mouse wheel with throttling
        let wheelTimeout;
        addEventListenerSafe(wrapper, 'wheel', (e) => {
            clearTimeout(wheelTimeout);
            wheelTimeout = setTimeout(() => {
                wrapper.scrollLeft += e.deltaY * 0.5;
            }, 10);
        }, { passive: true });

        // Initial scroll indicators
        updateScrollIndicators(wrapper);
    });
}

// Update scroll indicators efficiently
function updateScrollIndicators(wrapper) {
    const container = wrapper.closest('.table-container');
    if (!container) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = wrapper;
    
    // Use class toggling for better performance
    container.classList.toggle('scroll-start', scrollLeft <= 0);
    container.classList.toggle('scroll-end', scrollLeft >= scrollWidth - clientWidth - 1);
}

// Optimized touch support with universal button handling
function setupOptimizedTouchSupport() {
    // Add viewport meta if not present
    let viewport = document.querySelector('meta[name=viewport]');
    if (!viewport) {
        viewport = document.createElement('meta');
        viewport.name = 'viewport';
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        document.head.appendChild(viewport);
    }

    // Universal button touch handler - Works for ALL buttons
    document.body.addEventListener('touchend', (e) => {
        console.log('🔍 Touch detected on:', e.target.tagName, e.target.className);
        
        // Find the button element (could be the target or a parent)
        let button = e.target;
        if (!button.classList.contains('btn') && !button.classList.contains('nav-btn')) {
            button = e.target.closest('.btn, .nav-btn, button');
        }
        
        if (button) {
            console.log('✅ Button found:', button);
            e.preventDefault();
            e.stopPropagation();
            
            // Simulate click for buttons with onclick attributes
            if (button.onclick) {
                console.log('🔄 Executing onclick for:', button);
                button.onclick.call(button, e);
                return;
            }
            
            // Handle navigation buttons
            if (button.classList.contains('nav-btn') && button.dataset.section) {
                console.log('🔄 Navigation button:', button.dataset.section);
                showSection(button.dataset.section);
                return;
            }
            
            // Dispatch a click event for other buttons
            console.log('🔄 Dispatching click event for:', button);
            const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            button.dispatchEvent(clickEvent);
        }
    }, { passive: false });

    // Visual feedback for touch
    document.body.addEventListener('touchstart', (e) => {
        const button = e.target.closest('.btn, .nav-btn, button');
        if (button) {
            button.style.transform = 'scale(0.95)';
            button.style.transition = 'transform 0.1s ease';
        }
    }, { passive: true });

    document.body.addEventListener('touchend', (e) => {
        const button = e.target.closest('.btn, .nav-btn, button');
        if (button) {
            setTimeout(() => {
                button.style.transform = '';
                button.style.transition = '';
            }, 150);
        }
    }, { passive: true });

    // Prevent zoom on double tap for specific elements
    const preventZoom = document.querySelectorAll('.nav-btn, .btn, .stat-card');
    preventZoom.forEach(element => {
        element.addEventListener('touchend', (e) => {
            e.preventDefault();
        });
    });

    // Add touch-friendly styles
    const style = document.createElement('style');
    style.textContent = `
        .btn, .nav-btn, button {
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
        }
        
        .btn:active, .nav-btn:active, button:active {
            transform: scale(0.95);
        }
        
        @media (max-width: 768px) {
            .btn, .nav-btn, button {
                min-height: 44px;
                min-width: 44px;
            }
        }
    `;
    document.head.appendChild(style);
}

// Setup orientation and resize handling
function setupOrientationHandling() {
    let resizeTimeout;
    
    const handleResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            handleOrientationChange();
            adjustModalForMobile();
            optimizeForMobile();
        }, 100);
    };

    window.addEventListener('orientationchange', handleResize);
    window.addEventListener('resize', handleResize);
    
    // Initial setup
    adjustModalForMobile();
    optimizeForMobile();
}

// Orientation change handler
function handleOrientationChange() {
    setTimeout(() => {
        // Update scroll indicators for all tables
        const tableWrappers = document.querySelectorAll('.table-wrapper');
        tableWrappers.forEach(wrapper => {
            updateScrollIndicators(wrapper);
        });
        
        // Re-center active navigation button
        const activeBtn = document.querySelector('.nav-btn.active');
        if (activeBtn && window.innerWidth < 768) {
            const navMenu = document.querySelector('.nav-menu');
            if (navMenu) {
                centerButtonInView(activeBtn, navMenu);
            }
        }
    }, 100);
}

// Responsive modal management
function adjustModalForMobile() {
    const modals = document.querySelectorAll('.modal-content');
    
    modals.forEach(modal => {
        if (window.innerWidth < 768) {
            modal.style.margin = '5% auto';
            modal.style.width = '95%';
            modal.style.maxHeight = '90vh';
        } else {
            modal.style.margin = '5% auto';
            modal.style.width = '90%';
            modal.style.maxHeight = '95vh';
        }
    });
}

// Mobile performance optimization
function optimizeForMobile() {
    if (window.innerWidth < 768) {
        document.body.classList.add('mobile-optimized');
        
        // Lazy load images
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (img.loading !== 'lazy') {
                img.loading = 'lazy';
            }
        });
    } else {
        document.body.classList.remove('mobile-optimized');
    }
}