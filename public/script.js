const firebaseConfig = {
    apiKey: "AIzaSyDbLE9Disc3x-5jjjyjlyhfLC-stJO9Oq68",
    authDomain: "dynamicfr.firebaseapp.com",
    projectId: "dynamicfr",
    storageBucket: "dynamicfr.firebasestorage.app",
    messagingSenderId: "669407854261",
    appId: "1:669407854261:web:c4abdc9341ae9d532908fc",
    measurementId: "G-SCMB28SN1B"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

// Global variables
let clients = [];
let articles = [];
let documents = [];
let ventes = [];
let achats = [];
let paiements = [];
let companySettings = {
    name: "Dynamique Froid Systemes",
    address: "10 Rue Chrarda RDC Derb Loubila Bourgogne Centre D'Affaire Socojufi Casablanca Maroc",
    phone: "",
    email: "",
    logoUrl: "",
    cachetUrl: ""
};

// Variables for current document
let currentDocumentType = 'devis';
let documentCounter = {
    devis: 1,
    facture: 1,
    proforma: 1
};

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

// Helper function to diagnose navigation issues
function diagnoseNavigationIssues() {
    console.log('🔍 DIAGNOSTIC DE NAVIGATION');
    console.log('==========================');
    
    // Vérifier tous les boutons de navigation
    const navButtons = document.querySelectorAll('.nav-btn');
    console.log(`📱 Boutons de navigation trouvés: ${navButtons.length}`);
    navButtons.forEach((btn, index) => {
        console.log(`   ${index}: section="${btn.dataset.section}" text="${btn.textContent.trim()}"`);
    });
    
    // Vérifier toutes les sections
    const sections = document.querySelectorAll('.section');
    console.log(`📄 Sections trouvées: ${sections.length}`);
    sections.forEach((section, index) => {
        const isActive = section.classList.contains('active');
        const display = window.getComputedStyle(section).display;
        console.log(`   ${index}: id="${section.id}" active=${isActive} display="${display}"`);
    });
    
    // Vérifier les styles CSS de base
    const sampleSection = document.getElementById('ventes');
    if (sampleSection) {
        const styles = window.getComputedStyle(sampleSection);
        console.log('📐 Styles de la section ventes:');
        console.log(`   display: ${styles.display}`);
        console.log(`   visibility: ${styles.visibility}`);
        console.log(`   opacity: ${styles.opacity}`);
        console.log(`   position: ${styles.position}`);
        console.log(`   z-index: ${styles.zIndex}`);
    }
    
    console.log('==========================');
}

// Initialize app on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM Content Loaded - Initializing app');
    initializeApp();
    setupEventListeners();
    loadData();
    
    // Diagnostic après un délai pour s'assurer que tout est chargé
    setTimeout(() => {
        diagnoseNavigationIssues();
    }, 1000);
});

// Set up event listeners with optimized touch support
function setupEventListeners() {
    try {
        // Navigation buttons - Fix pour les clics sur les icônes
        const navButtons = document.querySelectorAll('.nav-btn');
        console.log('Found navigation buttons:', navButtons.length); // Debug log
        
        if (navButtons.length === 0) {
            console.warn('Aucun bouton de navigation (.nav-btn) trouvé dans le DOM');
        }
        
        navButtons.forEach((btn, index) => {
            const section = btn.dataset.section;
            console.log(`Button ${index}: section="${section}"`); // Debug log
            
            // Fonction de gestion universelle
            function handleNavigation(e) {
                console.log('Navigation event triggered:', e.type, 'on button:', btn); // Debug log
                e.preventDefault(); // Empêcher tout comportement par défaut
                e.stopPropagation(); // Empêcher la propagation
                
                // Utiliser currentTarget pour toujours pointer vers le bouton
                // ou remonter jusqu'au bouton si on clique sur l'icône
                let targetButton = e.currentTarget;
                console.log('currentTarget:', targetButton); // Debug log
                console.log('target:', e.target); // Debug log
                
                if (!targetButton.dataset.section) {
                    targetButton = e.target.closest('.nav-btn');
                    console.log('Found closest nav-btn:', targetButton); // Debug log
                }
                
                const section = targetButton?.dataset.section;
                console.log('Navigation detected, section:', section); // Debug log
                
                if (section) {
                    console.log('Calling showSection with:', section); // Debug log
                    showSection(section);
                } else {
                    console.warn('Section non définie pour le bouton de navigation', targetButton);
                    console.warn('Button dataset:', targetButton?.dataset);
                }
            }
            
            // Ajouter plusieurs types d'événements pour assurer la compatibilité
            btn.addEventListener('click', handleNavigation);
            btn.addEventListener('touchend', handleNavigation);
            btn.addEventListener('pointerup', handleNavigation);
            
            // Empêcher les comportements par défaut sur touch
            btn.addEventListener('touchstart', (e) => {
                console.log('Touch start detected on:', btn.dataset.section);
            }, { passive: true });
        });

        // Form submissions
        const forms = [
            { id: 'clientForm', handler: handleClientSubmit },
            { id: 'articleForm', handler: handleArticleSubmit },
            { id: 'documentForm', handler: handleDocumentSubmit },
            { id: 'achatForm', handler: handleAchatSubmit },
            { id: 'companyForm', handler: handleCompanySubmit },
            { id: 'venteForm', handler: handleVenteSubmit }
        ];

        forms.forEach(({ id, handler }) => {
            const form = document.getElementById(id);
            if (form) {
                form.addEventListener('submit', handler);
            } else {
                console.warn(`Formulaire avec l'ID ${id} non trouvé`);
            }
        });

        // Modal close on background click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
                // Réinitialiser les formulaires dans le modal
                const forms = e.target.querySelectorAll('form');
                forms.forEach(form => form.reset());
            }
        });

        // Initialize default document date
        initializeDocumentDate();

        // Setup optimized scrolling and touch support
        setupOptimizedScrolling();
        setupOptimizedTouchSupport();

        // Setup orientation change handling
        setupOrientationHandling();

    } catch (error) {
        console.error('Erreur lors de la configuration des écouteurs d\'événements:', error);
        showNotification('Erreur d\'initialisation de l\'interface', 'error');
    }
}

// Helper function to initialize document date
function initializeDocumentDate() {
    const documentDateInput = document.getElementById('documentDate');
    if (documentDateInput) {
        documentDateInput.value = new Date().toISOString().split('T')[0];
    } else {
        console.warn('Champ de date du document non trouvé');
    }
}

// Enhanced navigation with screen detection and debugging
function showSection(sectionName) {
    console.log('🔄 showSection called with:', sectionName); // Debug log
    
    // Vérifier que la section existe
    const targetSection = document.getElementById(sectionName);
    if (!targetSection) {
        console.error('❌ Section not found in DOM:', sectionName);
        console.log('Available sections:', [...document.querySelectorAll('.section')].map(s => s.id));
        return;
    }
    
    console.log('✅ Target section found:', targetSection); // Debug log
    
    // Hide all sections
    const allSections = document.querySelectorAll('.section');
    console.log('📄 Hiding all sections, found:', allSections.length); // Debug log
    
    allSections.forEach((section, index) => {
        console.log(`   Section ${index}: ${section.id} - removing active`);
        section.classList.remove('active');
    });
    
    // Remove active from all nav buttons
    const allNavButtons = document.querySelectorAll('.nav-btn');
    console.log('🔘 Deactivating all nav buttons, found:', allNavButtons.length); // Debug log
    
    allNavButtons.forEach((btn, index) => {
        console.log(`   Button ${index}: ${btn.dataset.section} - removing active`);
        btn.classList.remove('active');
    });
    
    // Show target section
    console.log('👁️ Activating target section:', sectionName);
    targetSection.classList.add('active');
    
    // Vérifier que la classe a été ajoutée
    const hasActive = targetSection.classList.contains('active');
    console.log('✅ Section has active class:', hasActive);
    
    // Vérifier les styles CSS appliqués
    const computedStyle = window.getComputedStyle(targetSection);
    console.log('📐 Section display style:', computedStyle.display);
    console.log('📐 Section visibility:', computedStyle.visibility);
    console.log('📐 Section opacity:', computedStyle.opacity);
    
    // Activate nav button
    const activeBtn = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeBtn) {
        console.log('🔘 Activating nav button for:', sectionName);
        activeBtn.classList.add('active');
        
        // Center button on mobile
        if (window.innerWidth < 768) {
            console.log('📱 Mobile detected, centering button');
            const navMenu = document.querySelector('.nav-menu');
            if (navMenu) {
                requestAnimationFrame(() => centerButtonInView(activeBtn, navMenu));
            }
        }
    } else {
        console.warn('❌ Navigation button not found for section:', sectionName);
    }
    
    // Update dashboard if needed
    if (sectionName === 'dashboard') {
        console.log('📊 Updating dashboard');
        updateDashboard();
    }
    
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    console.log('✅ showSection completed for:', sectionName);
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

// Center button in view smoothly
function centerButtonInView(button, container) {
    try {
        const buttonRect = button.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const scrollLeft = button.offsetLeft - (containerRect.width / 2) + (buttonRect.width / 2);

        container.scrollTo({
            left: Math.max(0, scrollLeft),
            behavior: 'smooth'
        });
    } catch (error) {
        console.error('Erreur centrage bouton:', error);
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

// Optimized touch support with minimal event listeners
function setupOptimizedTouchSupport() {
    // Add viewport meta if not present
    let viewport = document.querySelector('meta[name=viewport]');
    if (!viewport) {
        viewport = document.createElement('meta');
        viewport.name = 'viewport';
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        document.head.appendChild(viewport);
    }

    // Use event delegation for button touch effects
    document.body.addEventListener('touchstart', (e) => {
        if (e.target.classList.contains('btn') || e.target.closest('.btn')) {
            const button = e.target.classList.contains('btn') ? e.target : e.target.closest('.btn');
            button.style.transform = 'scale(0.95)';
            button.style.transition = 'transform 0.1s ease';
        }
    }, { passive: true });

    document.body.addEventListener('touchend', (e) => {
        if (e.target.classList.contains('btn') || e.target.closest('.btn')) {
            const button = e.target.classList.contains('btn') ? e.target : e.target.closest('.btn');
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

// Modal management functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        // Focus trap for accessibility
        const firstInput = modal.querySelector('input, select, textarea, button');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        const forms = modal.querySelectorAll('form');
        forms.forEach(form => form.reset());
    }
}

function showClientModal() {
    showModal('clientModal');
}

function showArticleModal() {
    showModal('articleModal');
}

function showDocumentModal(type) {
    currentDocumentType = type;
    const title = document.getElementById('documentModalTitle');
    if (title) {
        title.textContent = 
            type === 'devis' ? 'Nouveau Devis' :
            type === 'facture' ? 'Nouvelle Facture' : 'Facture Proforma';
    }
    
    populateClientSelect();
    populateArticleSelects();
    showModal('documentModal');
}

function showAchatModal() {
    const select = document.getElementById('achatArticle');
    if (select) {
        select.innerHTML = '<option value="">Sélectionner un article</option>';
        
        articles.forEach(article => {
            const option = document.createElement('option');
            option.value = article.id;
            option.textContent = `${article.reference} - ${article.designation}`;
            select.appendChild(option);
        });
    }
    
    const dateInput = document.getElementById('achatDate');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
    
    setupAchatCalculation();
    showModal('achatModal');
}

function showVenteModal() {
    const clientSelect = document.getElementById('venteClient');
    if (clientSelect) {
        clientSelect.innerHTML = '<option value="">Sélectionner un client</option>';
        
        clients.forEach(client => {
            const option = document.createElement('option');
            option.value = client.id;
            option.textContent = client.name;
            clientSelect.appendChild(option);
        });
    }
    
    const articleSelect = document.getElementById('venteArticle');
    if (articleSelect) {
        articleSelect.innerHTML = '<option value="">Sélectionner un article</option>';
        
        articles.forEach(article => {
            const option = document.createElement('option');
            option.value = article.id;
            option.textContent = `${article.reference} - ${article.designation}`;
            option.dataset.price = article.price;
            articleSelect.appendChild(option);
        });
    }
    
    const dateInput = document.getElementById('venteDate');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
    
    setupVenteCalculation();
    showModal('venteModal');
}

function setupAchatCalculation() {
    const quantityInput = document.getElementById('achatQuantity');
    const priceInput = document.getElementById('achatPrixUnitaire');
    const totalDisplay = document.getElementById('achatTotalDisplay');
    
    if (!quantityInput || !priceInput || !totalDisplay) return;
    
    function calculateAchatTotal() {
        const quantity = parseFloat(quantityInput.value) || 0;
        const price = parseFloat(priceInput.value) || 0;
        const subtotal = quantity * price;
        const tva = subtotal * 0.20;
        const total = subtotal + tva;
        
        totalDisplay.innerHTML = `
            <div>Sous-total HT: ${subtotal.toFixed(2)} MAD</div>
            <div>TVA (20%): ${tva.toFixed(2)} MAD</div>
            <div style="font-weight: bold; color: #2d3748;">Total TTC: ${total.toFixed(2)} MAD</div>
        `;
    }
    
    quantityInput.addEventListener('input', calculateAchatTotal);
    priceInput.addEventListener('input', calculateAchatTotal);
}

function setupVenteCalculation() {
    const articleSelect = document.getElementById('venteArticle');
    const quantityInput = document.getElementById('venteQuantity');
    const priceInput = document.getElementById('ventePrixUnitaire');
    const totalDisplay = document.getElementById('venteTotalDisplay');
    
    if (!articleSelect || !quantityInput || !priceInput || !totalDisplay) return;
    
    function calculateVenteTotal() {
        const quantity = parseFloat(quantityInput.value) || 0;
        const price = parseFloat(priceInput.value) || 0;
        const subtotal = quantity * price;
        const tva = subtotal * 0.20;
        const total = subtotal + tva;
        
        totalDisplay.innerHTML = `
            <div>Sous-total HT: ${subtotal.toFixed(2)} MAD</div>
            <div>TVA (20%): ${tva.toFixed(2)} MAD</div>
            <div style="font-weight: bold; color: #2d3748;">Total TTC: ${total.toFixed(2)} MAD</div>
        `;
    }
    
    articleSelect.addEventListener('change', () => {
        const selectedOption = articleSelect.options[articleSelect.selectedIndex];
        if (selectedOption.dataset.price) {
            priceInput.value = selectedOption.dataset.price;
            calculateVenteTotal();
        }
    });
    
    quantityInput.addEventListener('input', calculateVenteTotal);
    priceInput.addEventListener('input', calculateVenteTotal);
}

// Load data functions
async function loadData() {
    try {
        await Promise.all([
            loadClients(),
            loadArticles(),
            loadDocuments(),
            loadAchats(),
            loadVentes(),
            loadPaiements(),
            loadCompanySettings()
        ]);
        updateDashboard();
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
    }
}

async function loadClients() {
    try {
        const snapshot = await db.collection('clients').get();
        clients = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        displayClients();
    } catch (error) {
        console.error('Erreur chargement clients:', error);
    }
}

async function loadArticles() {
    try {
        const snapshot = await db.collection('articles').get();
        articles = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        displayArticles();
    } catch (error) {
        console.error('Erreur chargement articles:', error);
    }
}

async function loadDocuments() {
    try {
        const snapshot = await db.collection('documents').get();
        documents = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        displayDocuments();
    } catch (error) {
        console.error('Erreur chargement documents:', error);
    }
}

async function loadAchats() {
    try {
        const snapshot = await db.collection('achats').orderBy('createdAt', 'desc').get();
        achats = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        displayAchats();
    } catch (error) {
        console.error('Erreur chargement achats:', error);
    }
}

async function loadVentes() {
    try {
        const snapshot = await db.collection('ventes').orderBy('createdAt', 'desc').get();
        ventes = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        displayVentes();
    } catch (error) {
        console.error('Erreur chargement ventes:', error);
    }
}

async function loadPaiements() {
    try {
        const snapshot = await db.collection('paiements').orderBy('createdAt', 'desc').get();
        paiements = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        displayPaiements();
    } catch (error) {
        console.error('Erreur chargement paiements:', error);
    }
}

async function loadCompanySettings() {
    try {
        const doc = await db.collection('settings').doc('company').get();
        if (doc.exists) {
            companySettings = { ...companySettings, ...doc.data() };
            updateCompanyDisplay();
        }
    } catch (error) {
        console.error('Erreur chargement paramètres:', error);
    }
}

// Client management functions
async function handleClientSubmit(e) {
    e.preventDefault();
    
    const clientData = {
        name: document.getElementById('clientName').value,
        email: document.getElementById('clientEmail').value,
        phone: document.getElementById('clientPhone').value,
        address: document.getElementById('clientAddress').value,
        createdAt: new Date()
    };

    try {
        const docRef = await db.collection('clients').add(clientData);
        clients.push({ id: docRef.id, ...clientData });
        displayClients();
        closeModal('clientModal');
        showNotification('Client ajouté avec succès', 'success');
    } catch (error) {
        console.error('Erreur ajout client:', error);
        showNotification('Erreur lors de l\'ajout du client', 'error');
    }
}

function displayClients() {
    const tbody = document.querySelector('#clientsTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    clients.forEach(client => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${client.name}</td>
            <td>${client.email || '-'}</td>
            <td>${client.phone || '-'}</td>
            <td>${client.address || '-'}</td>
            <td>
                <button class="btn btn-info btn-small" onclick="editClient('${client.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-small" onclick="deleteClient('${client.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
    });
}

async function deleteClient(clientId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
        try {
            await db.collection('clients').doc(clientId).delete();
            clients = clients.filter(c => c.id !== clientId);
            displayClients();
            showNotification('Client supprimé avec succès', 'success');
        } catch (error) {
            console.error('Erreur suppression client:', error);
            showNotification('Erreur lors de la suppression', 'error');
        }
    }
}

// Article management functions
async function handleArticleSubmit(e) {
    e.preventDefault();
    
    const articleData = {
        reference: document.getElementById('articleRef').value,
        designation: document.getElementById('articleDesignation').value,
        price: parseFloat(document.getElementById('articlePrice').value),
        stock: parseInt(document.getElementById('articleStock').value),
        createdAt: new Date()
    };

    try {
        const docRef = await db.collection('articles').add(articleData);
        articles.push({ id: docRef.id, ...articleData });
        displayArticles();
        closeModal('articleModal');
        showNotification('Article ajouté avec succès', 'success');
    } catch (error) {
        console.error('Erreur ajout article:', error);
        showNotification('Erreur lors de l\'ajout de l\'article', 'error');
    }
}

function displayArticles() {
    const tbody = document.querySelector('#articlesTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    articles.forEach(article => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${article.reference}</td>
            <td>${article.designation}</td>
            <td>${article.price.toFixed(2)} MAD</td>
            <td>${article.stock}</td>
            <td>
                <button class="btn btn-info btn-small" onclick="editArticle('${article.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-small" onclick="deleteArticle('${article.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
    });
}

async function deleteArticle(articleId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
        try {
            await db.collection('articles').doc(articleId).delete();
            articles = articles.filter(a => a.id !== articleId);
            displayArticles();
            showNotification('Article supprimé avec succès', 'success');
        } catch (error) {
            console.error('Erreur suppression article:', error);
            showNotification('Erreur lors de la suppression', 'error');
        }
    }
}

// Document management functions
function populateClientSelect() {
    const select = document.getElementById('documentClient');
    if (!select) return;
    
    select.innerHTML = '<option value="">Sélectionner un client</option>';
    
    clients.forEach(client => {
        const option = document.createElement('option');
        option.value = client.id;
        option.textContent = client.name;
        select.appendChild(option);
    });
}

function populateArticleSelects() {
    const selects = document.querySelectorAll('.item-article');
    selects.forEach(select => {
        select.innerHTML = '<option value="">Sélectionner un article</option>';
        articles.forEach(article => {
            const option = document.createElement('option');
            option.value = article.id;
            option.textContent = `${article.reference} - ${article.designation}`;
            option.dataset.price = article.price;
            select.appendChild(option);
        });
    });
}

function addItem() {
    const itemsList = document.getElementById('itemsList');
    if (!itemsList) return;
    
    const itemRow = document.createElement('div');
    itemRow.className = 'item-row';
    itemRow.innerHTML = `
        <select class="item-article" required></select>
        <input type="number" class="item-quantity" placeholder="Qté" min="1" required>
        <input type="number" class="item-price" placeholder="Prix" step="0.01" required>
        <button type="button" class="btn btn-danger btn-small" onclick="removeItem(this)">Supprimer</button>
    `;
    itemsList.appendChild(itemRow);
    
    const newSelect = itemRow.querySelector('.item-article');
    newSelect.innerHTML = '<option value="">Sélectionner un article</option>';
    articles.forEach(article => {
        const option = document.createElement('option');
        option.value = article.id;
        option.textContent = `${article.reference} - ${article.designation}`;
        option.dataset.price = article.price;
        newSelect.appendChild(option);
    });

    setupItemEventListeners(itemRow);
}

function removeItem(button) {
    button.parentElement.remove();
    calculateTotal();
}

function setupItemEventListeners(itemRow) {
    const articleSelect = itemRow.querySelector('.item-article');
    const quantityInput = itemRow.querySelector('.item-quantity');
    const priceInput = itemRow.querySelector('.item-price');

    if (articleSelect) {
        articleSelect.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            if (selectedOption.dataset.price) {
                priceInput.value = selectedOption.dataset.price;
                calculateTotal();
            }
        });
    }

    if (quantityInput) {
        quantityInput.addEventListener('input', calculateTotal);
    }
    
    if (priceInput) {
        priceInput.addEventListener('input', calculateTotal);
    }
}

function calculateTotal() {
    let subtotal = 0;
    const itemRows = document.querySelectorAll('.item-row');
    
    itemRows.forEach(row => {
        const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        subtotal += quantity * price;
    });
    
    const tva = subtotal * 0.20;
    const total = subtotal + tva;
    
    const totalElement = document.getElementById('documentTotal');
    if (totalElement) {
        totalElement.innerHTML = `
            <div style="text-align: right;">
                <div>Sous-total HT: ${subtotal.toFixed(2)} MAD</div>
                <div>TVA (20%): ${tva.toFixed(2)} MAD</div>
                <div style="font-weight: bold; border-top: 1px solid #ddd; padding-top: 0.5rem;">
                    Total TTC: ${total.toFixed(2)} MAD
                </div>
            </div>
        `;
    }
    
    return { subtotal, tva, total };
}

async function handleDocumentSubmit(e) {
    e.preventDefault();
    
    const clientId = document.getElementById('documentClient').value;
    const date = document.getElementById('documentDate').value;
    const items = [];
    
    document.querySelectorAll('.item-row').forEach(row => {
        const articleId = row.querySelector('.item-article').value;
        const quantity = parseInt(row.querySelector('.item-quantity').value);
        const price = parseFloat(row.querySelector('.item-price').value);
        
        if (articleId && quantity && price) {
            const article = articles.find(a => a.id === articleId);
            items.push({
                articleId,
                article,
                quantity,
                price,
                total: quantity * price
            });
        }
    });

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tva = subtotal * 0.20;
    const total = subtotal + tva;
    
    const documentData = {
        type: currentDocumentType,
        number: generateDocumentNumber(currentDocumentType),
        clientId,
        client: clients.find(c => c.id === clientId),
        date,
        items,
        subtotal,
        tva,
        total,
        status: 'en-cours',
        createdAt: new Date()
    };

    try {
        const docRef = await db.collection('documents').add(documentData);
        documents.push({ id: docRef.id, ...documentData });
        
        if (currentDocumentType === 'facture') {
            await createSaleFromInvoice(documentData);
        }
        
        displayDocuments();
        closeModal('documentModal');
        showNotification(`${currentDocumentType} créé avec succès`, 'success');
    } catch (error) {
        console.error('Erreur création document:', error);
        showNotification('Erreur lors de la création du document', 'error');
    }
}

function generateDocumentNumber(type) {
    const year = new Date().getFullYear();
    const number = documentCounter[type].toString().padStart(4, '0');
    documentCounter[type]++;
    
    const prefix = type === 'devis' ? 'DEV' : type === 'facture' ? 'FACT' : 'PROF';
    return `${prefix}-${year}-${number}`;
}

function displayDocuments() {
    const tbody = document.querySelector('#documentsTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    documents.forEach(doc => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${doc.number}</td>
            <td>${doc.type.toUpperCase()}</td>
            <td>${doc.client ? doc.client.name : 'N/A'}</td>
            <td>${new Date(doc.date).toLocaleDateString('fr-FR')}</td>
            <td>
                <div style="font-size: 0.9em;">
                    <div>HT: ${(doc.subtotal || doc.total / 1.2).toFixed(2)} MAD</div>
                    <div><strong>TTC: ${doc.total.toFixed(2)} MAD</strong></div>
                </div>
            </td>
            <td><span class="status-badge ${doc.status}">${doc.status}</span></td>
            <td>
                <button class="btn btn-info btn-small" onclick="previewDocument('${doc.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-primary btn-small" onclick="printDocument('${doc.id}')">
                    <i class="fas fa-print"></i>
                </button>
                <button class="btn btn-danger btn-small" onclick="deleteDocument('${doc.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
    });
}

// Achat handling
async function handleAchatSubmit(e) {
    e.preventDefault();
    
    const fournisseur = document.getElementById('achatFournisseur').value;
    const date = document.getElementById('achatDate').value;
    const articleId = document.getElementById('achatArticle').value;
    const quantity = parseInt(document.getElementById('achatQuantity').value);
    const prixUnitaire = parseFloat(document.getElementById('achatPrixUnitaire').value);
    const modePaiement = document.getElementById('achatModePaiement').value;
    
    const article = articles.find(a => a.id === articleId);
    const subtotal = quantity * prixUnitaire;
    const tva = subtotal * 0.20;
    const total = subtotal + tva;
    
    const achatData = {
        fournisseur,
        date,
        articleId,
        article: {
            id: article.id,
            reference: article.reference,
            designation: article.designation
        },
        quantity,
        prixUnitaire,
        subtotal,
        tva,
        total,
        modePaiement,
        statut: modePaiement === 'credit' ? 'en-cours' : 'paye',
        createdAt: new Date()
    };

    try {
        const docRef = await db.collection('achats').add(achatData);
        achats.push({ id: docRef.id, ...achatData });
        
        const articleToUpdate = articles.find(a => a.id === articleId);
        if (articleToUpdate) {
            articleToUpdate.stock += quantity;
            await db.collection('articles').doc(articleId).update({
                stock: articleToUpdate.stock
            });
        }
        
        if (modePaiement !== 'credit') {
            await createPaiementFromAchat(achatData);
        }
        
        displayAchats();
        displayArticles();
        closeModal('achatModal');
        showNotification('Achat enregistré avec succès', 'success');
        updateDashboard();
        
    } catch (error) {
        console.error('Erreur enregistrement achat:', error);
        showNotification('Erreur lors de l\'enregistrement de l\'achat', 'error');
    }
}

// Vente handling
async function handleVenteSubmit(e) {
    e.preventDefault();
    
    const clientId = document.getElementById('venteClient').value;
    const date = document.getElementById('venteDate').value;
    const articleId = document.getElementById('venteArticle').value;
    const quantity = parseInt(document.getElementById('venteQuantity').value);
    const prixUnitaire = parseFloat(document.getElementById('ventePrixUnitaire').value);
    const modePaiement = document.getElementById('venteModePaiement').value;
    
    const client = clients.find(c => c.id === clientId);
    const article = articles.find(a => a.id === articleId);
    
    if (article.stock < quantity) {
        showNotification('Stock insuffisant pour cet article', 'error');
        return;
    }
    
    const subtotal = quantity * prixUnitaire;
    const tva = subtotal * 0.20;
    const total = subtotal + tva;
    
    const venteData = {
        type: 'vente-directe',
        clientId,
        clientName: client.name,
        date,
        items: [{
            articleId,
            article: {
                id: article.id,
                reference: article.reference,
                designation: article.designation
            },
            quantity,
            price: prixUnitaire,
            total: subtotal
        }],
        subtotal,
        tva,
        total,
        modePaiement,
        statut: modePaiement === 'credit' ? 'en-cours' : 'paye',
        createdAt: new Date()
    };

    try {
        const docRef = await db.collection('ventes').add(venteData);
        ventes.push({ id: docRef.id, ...venteData });
        
        const articleToUpdate = articles.find(a => a.id === articleId);
        if (articleToUpdate) {
            articleToUpdate.stock -= quantity;
            await db.collection('articles').doc(articleId).update({
                stock: articleToUpdate.stock
            });
        }
        
        if (modePaiement !== 'credit') {
            await createPaiementFromVente(venteData);
        }
        
        displayVentes();
        displayArticles();
        closeModal('venteModal');
        showNotification('Vente enregistrée avec succès', 'success');
        updateDashboard();
        
    } catch (error) {
        console.error('Erreur enregistrement vente:', error);
        showNotification('Erreur lors de l\'enregistrement de la vente', 'error');
    }
}

// Display functions
function displayAchats() {
    const tbody = document.querySelector('#achatsTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    achats.forEach(achat => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${new Date(achat.date).toLocaleDateString('fr-FR')}</td>
            <td>${achat.fournisseur}</td>
            <td>${achat.article.reference} - ${achat.article.designation}</td>
            <td>${achat.quantity}</td>
            <td>${achat.total.toFixed(2)} MAD</td>
            <td><span class="status-badge ${achat.statut}">${achat.statut}</span></td>
            <td>
                <button class="btn btn-info btn-small" onclick="viewAchatDetails('${achat.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-danger btn-small" onclick="deleteAchat('${achat.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
    });
}

function displayVentes() {
    const tbody = document.querySelector('#ventesTable tbody');
    if (!tbody) {
        console.warn('Tableau des ventes (#ventesTable tbody) non trouvé dans le DOM');
        return;
    }

    tbody.innerHTML = '';
    
    ventes.forEach(vente => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${new Date(vente.date).toLocaleDateString('fr-FR')}</td>
            <td>${vente.clientName}</td>
            <td>${vente.total.toFixed(2)} MAD</td>
            <td>${vente.modePaiement || 'Facture'}</td>
            <td><span class="status-badge ${vente.statut}">${vente.statut}</span></td>
            <td>
                <button class="btn btn-info btn-small" onclick="viewVenteDetails('${vente.id}')">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
    });
}

function displayPaiements() {
    const tbody = document.querySelector('#paiementsTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    paiements.forEach(paiement => {
        const row = tbody.insertRow();
        const typeLabel = paiement.type === 'entree' ? 'Entrée' : 'Sortie';
        const typeClass = paiement.type === 'entree' ? 'success' : 'danger';
        
        row.innerHTML = `
            <td>${new Date(paiement.date).toLocaleDateString('fr-FR')}</td>
            <td><span class="status-badge ${typeClass}">${typeLabel}</span></td>
            <td>${paiement.fournisseur || paiement.clientName || paiement.description}</td>
            <td>${paiement.montant.toFixed(2)} MAD</td>
            <td>${paiement.modePaiement || '-'}</td>
            <td><span class="status-badge ${paiement.statut}">${paiement.statut}</span></td>
        `;
    });
}

// Company settings
async function handleCompanySubmit(e) {
    e.preventDefault();
    
    const companyData = {
        name: document.getElementById('companyName').value,
        address: document.getElementById('companyAddress').value,
        phone: document.getElementById('companyPhone').value,
        email: document.getElementById('companyEmail').value
    };

    try {
        await db.collection('settings').doc('company').set({
            ...companySettings,
            ...companyData
        });
        
        companySettings = { ...companySettings, ...companyData };
        updateCompanyDisplay();
        showNotification('Paramètres sauvegardés avec succès', 'success');
    } catch (error) {
        console.error('Erreur sauvegarde paramètres:', error);
        showNotification('Erreur lors de la sauvegarde', 'error');
    }
}

function updateCompanyDisplay() {
    if (companySettings.logoUrl) {
        const logoImg = document.getElementById('companyLogo');
        if (logoImg) {
            logoImg.src = companySettings.logoUrl;
            logoImg.style.display = 'block';
        }
    }
    
    const fields = ['companyName', 'companyAddress', 'companyPhone', 'companyEmail'];
    const values = [companySettings.name, companySettings.address, companySettings.phone || '', companySettings.email || ''];
    
    fields.forEach((fieldId, index) => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.value = values[index];
        }
    });
}

// Dashboard functions
function calculateBenefices() {
    const totalVentes = ventes
        .filter(v => v.statut === 'paye' || v.statut === 'valide')
        .reduce((sum, vente) => sum + vente.total, 0);
    
    const totalAchats = achats
        .reduce((sum, achat) => sum + achat.total, 0);
    
    const benefice = totalVentes - totalAchats;
    const margePercent = totalVentes > 0 ? ((benefice / totalVentes) * 100) : 0;
    
    return {
        totalVentes,
        totalAchats,
        benefice,
        margePercent
    };
}

function updateDashboard() {
    const elements = {
        totalClients: document.getElementById('totalClients'),
        totalFactures: document.getElementById('totalFactures'),
        totalArticles: document.getElementById('totalArticles'),
        totalVentes: document.getElementById('totalVentes')
    };
    
    if (elements.totalClients) elements.totalClients.textContent = clients.length;
    if (elements.totalFactures) elements.totalFactures.textContent = documents.filter(d => d.type === 'facture').length;
    if (elements.totalArticles) elements.totalArticles.textContent = articles.length;
    
    const stats = calculateBenefices();
    if (elements.totalVentes) elements.totalVentes.textContent = `${stats.totalVentes.toFixed(2)} MAD`;
    
    // Add additional stats if not present
    const statsGrid = document.querySelector('.stats-grid');
    if (statsGrid && !document.getElementById('totalAchats')) {
        addAdditionalStats(statsGrid, stats);
    } else {
        updateAdditionalStats(stats);
    }
}

function addAdditionalStats(statsGrid, stats) {
    const additionalStats = [
        {
            id: 'totalAchats',
            value: `${stats.totalAchats.toFixed(2)} MAD`,
            label: 'Total Achats',
            icon: 'fas fa-shopping-bag',
            color: '#f56565'
        },
        {
            id: 'totalBenefice',
            value: `${stats.benefice.toFixed(2)} MAD`,
            label: `Bénéfice (${stats.margePercent.toFixed(1)}%)`,
            icon: 'fas fa-chart-line',
            color: stats.benefice >= 0 ? '#48bb78' : '#f56565'
        },
        {
            id: 'totalMarge',
            value: `${stats.margePercent.toFixed(1)}%`,
            label: 'Marge Bénéficiaire',
            icon: 'fas fa-percentage',
            color: '#9f7aea'
        }
    ];
    
    additionalStats.forEach(stat => {
        const card = document.createElement('div');
        card.className = 'stat-card';
        card.innerHTML = `
            <div class="stat-icon" style="background: linear-gradient(135deg, ${stat.color}, ${stat.color});">
                <i class="${stat.icon}"></i>
            </div>
            <div class="stat-info">
                <h3 id="${stat.id}">${stat.value}</h3>
                <p>${stat.label}</p>
            </div>
        `;
        statsGrid.appendChild(card);
    });
}

function updateAdditionalStats(stats) {
    const elements = {
        totalAchats: document.getElementById('totalAchats'),
        totalBenefice: document.getElementById('totalBenefice'),
        totalMarge: document.getElementById('totalMarge')
    };
    
    if (elements.totalAchats) elements.totalAchats.textContent = `${stats.totalAchats.toFixed(2)} MAD`;
    if (elements.totalBenefice) elements.totalBenefice.textContent = `${stats.benefice.toFixed(2)} MAD`;
    if (elements.totalMarge) elements.totalMarge.textContent = `${stats.margePercent.toFixed(1)}%`;
    
    // Update benefice color
    const beneficeIcon = elements.totalBenefice?.closest('.stat-card')?.querySelector('.stat-icon');
    if (beneficeIcon) {
        const color = stats.benefice >= 0 ? '#48bb78' : '#f56565';
        beneficeIcon.style.background = `linear-gradient(135deg, ${color}, ${color})`;
    }
}

// Utility functions
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
        font-weight: 500;
        z-index: 3000;
        animation: slideInRight 0.3s ease-out;
        background: ${type === 'success' ? '#48bb78' : type === 'error' ? '#f56565' : '#4299e1'};
        max-width: 400px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Placeholder functions for missing implementations
function editClient(clientId) {
    console.log('Édition client:', clientId);
    showNotification('Fonctionnalité en développement', 'info');
}

function editArticle(articleId) {
    console.log('Édition article:', articleId);
    showNotification('Fonctionnalité en développement', 'info');
}

function viewAchatDetails(achatId) {
    const achat = achats.find(a => a.id === achatId);
    if (achat) {
        alert(`Détails de l'achat:
Fournisseur: ${achat.fournisseur}
Article: ${achat.article.designation}
Quantité: ${achat.quantity}
Prix unitaire HT: ${achat.prixUnitaire.toFixed(2)} MAD
Total TTC: ${achat.total.toFixed(2)} MAD
Mode de paiement: ${achat.modePaiement}
Statut: ${achat.statut}`);
    }
}

function viewVenteDetails(venteId) {
    const vente = ventes.find(v => v.id === venteId);
    if (vente) {
        let itemsText = vente.items.map(item => 
            `- ${item.article.designation}: ${item.quantity} x ${item.price.toFixed(2)} MAD`
        ).join('\n');
        
        alert(`Détails de la vente:
Client: ${vente.clientName}
Document: ${vente.documentNumber || 'Vente directe'}
Articles:
${itemsText}
Total TTC: ${vente.total.toFixed(2)} MAD
Statut: ${vente.statut}`);
    }
}

async function deleteAchat(achatId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet achat ?')) {
        try {
            const achat = achats.find(a => a.id === achatId);
            
            if (achat) {
                const article = articles.find(a => a.id === achat.articleId);
                if (article && article.stock >= achat.quantity) {
                    article.stock -= achat.quantity;
                    await db.collection('articles').doc(achat.articleId).update({
                        stock: article.stock
                    });
                }
            }
            
            await db.collection('achats').doc(achatId).delete();
            achats = achats.filter(a => a.id !== achatId);
            displayAchats();
            displayArticles();
            updateDashboard();
            showNotification('Achat supprimé avec succès', 'success');
        } catch (error) {
            console.error('Erreur suppression achat:', error);
            showNotification('Erreur lors de la suppression', 'error');
        }
    }
}

async function deleteDocument(documentId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
        try {
            await db.collection('documents').doc(documentId).delete();
            documents = documents.filter(d => d.id !== documentId);
            displayDocuments();
            showNotification('Document supprimé avec succès', 'success');
        } catch (error) {
            console.error('Erreur suppression document:', error);
            showNotification('Erreur lors de la suppression', 'error');
        }
    }
}

// Document preview and printing functions [SUITE...]
function previewDocument(documentId = null) {
    let doc;
    
    if (documentId) {
        doc = documents.find(d => d.id === documentId);
        
        if (doc && !doc.subtotal) {
            doc.subtotal = doc.total / 1.2;
            doc.tva = doc.total - doc.subtotal;
        }
    } else {
        const clientId = document.getElementById('documentClient').value;
        const date = document.getElementById('documentDate').value;
        const items = [];
        
        document.querySelectorAll('.item-row').forEach(row => {
            const articleId = row.querySelector('.item-article').value;
            const quantity = parseInt(row.querySelector('.item-quantity').value);
            const price = parseFloat(row.querySelector('.item-price').value);
            
            if (articleId && quantity && price) {
                const article = articles.find(a => a.id === articleId);
                items.push({
                    articleId,
                    article,
                    quantity,
                    price,
                    total: quantity * price
                });
            }
        });

        const subtotal = items.reduce((sum, item) => sum + item.total, 0);
        const tva = subtotal * 0.20;
        const total = subtotal + tva;
        
        doc = {
            type: currentDocumentType,
            number: generateDocumentNumber(currentDocumentType),
            clientId,
            client: clients.find(c => c.id === clientId),
            date,
            items,
            subtotal,
            tva,
            total
        };
    }

    if (!doc || !doc.client) {
        showNotification('Données de document incomplètes', 'error');
        return;
    }

    const previewContent = generateDocumentHTML(doc);
    const previewElement = document.getElementById('previewContent');
    if (previewElement) {
        previewElement.innerHTML = previewContent;
    }
    showModal('previewModal');
}

function generateDocumentHTML(doc) {
    const documentTitle = doc.type === 'devis' ? 'DEVIS' : 
                         doc.type === 'facture' ? 'FACTURE' : 'FACTURE PROFORMA';
    
    let itemsHTML = '';
    doc.items.forEach(item => {
        itemsHTML += `
            <tr>
                <td>${item.article.reference}</td>
                <td>${item.article.designation}</td>
                <td style="text-align: center;">${item.quantity}</td>
                <td style="text-align: right;">${item.price.toFixed(2)} MAD</td>
                <td style="text-align: right;">${item.total.toFixed(2)} MAD</td>
            </tr>
        `;
    });

    return `
        <div class="document-preview">
            <div class="document-header">
                <div class="company-info">
                    ${companySettings.logoUrl ? `<img src="${companySettings.logoUrl}" alt="Logo" class="company-logo">` : ''}
                    <h2>${companySettings.name}</h2>
                    <p>${companySettings.address}</p>
                    ${companySettings.phone ? `<p>Tél: ${companySettings.phone}</p>` : ''}
                    ${companySettings.email ? `<p>Email: ${companySettings.email}</p>` : ''}
                </div>
            </div>
            
            <div class="document-title">
                <h1>${documentTitle}</h1>
                <p>N° ${doc.number}</p>
            </div>
            
            <div class="document-details">
                <div>
                    <h3>Client:</h3>
                    <p><strong>${doc.client.name}</strong></p>
                    ${doc.client.address ? `<p>${doc.client.address}</p>` : ''}
                    ${doc.client.phone ? `<p>Tél: ${doc.client.phone}</p>` : ''}
                    ${doc.client.email ? `<p>Email: ${doc.client.email}</p>` : ''}
                </div>
                <div>
                    <h3>Date:</h3>
                    <p>${new Date(doc.date).toLocaleDateString('fr-FR')}</p>
                </div>
            </div>
            
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Référence</th>
                        <th>Désignation</th>
                        <th style="text-align: center;">Quantité</th>
                        <th style="text-align: right;">Prix Unitaire HT</th>
                        <th style="text-align: right;">Total HT</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHTML}
                </tbody>
                <tfoot>
                    <tr style="border-top: 2px solid #ddd;">
                        <td colspan="4" style="text-align: right; font-weight: bold;">Sous-total HT:</td>
                        <td style="text-align: right; font-weight: bold;">${doc.subtotal.toFixed(2)} MAD</td>
                    </tr>
                    <tr>
                        <td colspan="4" style="text-align: right; font-weight: bold;">TVA (20%):</td>
                        <td style="text-align: right; font-weight: bold;">${doc.tva.toFixed(2)} MAD</td>
                    </tr>
                    <tr style="background-color: #f8f9fa; font-size: 1.1em;">
                        <td colspan="4" style="text-align: right; font-weight: bold;">Total TTC:</td>
                        <td style="text-align: right; font-weight: bold; color: #2d3748;">${doc.total.toFixed(2)} MAD</td>
                    </tr>
                </tfoot>
            </table>
            
            <div class="document-footer">
                <div class="cachet-section">
                    ${companySettings.cachetUrl ? `<img src="${companySettings.cachetUrl}" alt="Cachet">` : ''}
                </div>
                <div class="total-section">
                    <h2>Net à payer: ${doc.total.toFixed(2)} MAD</h2>
                </div>
            </div>
        </div>
    `;
}

function printDocument(documentId = null) {
    if (documentId) {
        previewDocument(documentId);
    }
    
    setTimeout(() => {
        const previewContent = document.getElementById('previewContent');
        if (!previewContent) return;
        
        const printContent = previewContent.innerHTML;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Document</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .document-preview { max-width: 800px; margin: 0 auto; }
                        .document-header { display: flex; justify-content: space-between; margin-bottom: 30px; }
                        .document-title { text-align: center; margin: 30px 0; }
                        .document-details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
                        .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        .items-table th, .items-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                        .items-table th { background-color: #f5f5f5; }
                        .document-footer { display: flex; justify-content: space-between; margin-top: 40px; }
                        .company-logo { max-height: 80px; }
                        .cachet-section img { max-height: 100px; }
                        @media print { .no-print { display: none; } }
                    </style>
                </head>
                <body>
                    ${printContent}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }, 500);
}

// Helper functions for sales and payments
async function createSaleFromInvoice(invoiceData) {
    const venteData = {
        type: 'facture',
        documentId: invoiceData.id,
        documentNumber: invoiceData.number,
        clientId: invoiceData.clientId,
        clientName: invoiceData.client.name,
        date: invoiceData.date,
        items: invoiceData.items,
        subtotal: invoiceData.subtotal,
        tva: invoiceData.tva,
        total: invoiceData.total,
        modePaiement: 'facture',
        statut: 'en-cours',
        createdAt: new Date()
    };

    try {
        const docRef = await db.collection('ventes').add(venteData);
        ventes.push({ id: docRef.id, ...venteData });
        
        for (const item of invoiceData.items) {
            const article = articles.find(a => a.id === item.articleId);
            if (article && article.stock >= item.quantity) {
                article.stock -= item.quantity;
                await db.collection('articles').doc(item.articleId).update({
                    stock: article.stock
                });
            }
        }
        
        displayVentes();
        displayArticles();
        
    } catch (error) {
        console.error('Erreur création vente:', error);
    }
}

async function createPaiementFromAchat(achatData) {
    const paiementData = {
        type: 'sortie',
        reference: `ACH-${Date.now()}`,
        description: `Achat - ${achatData.article.designation}`,
        fournisseur: achatData.fournisseur,
        montant: achatData.total,
        modePaiement: achatData.modePaiement,
        date: achatData.date,
        statut: 'valide',
        createdAt: new Date()
    };

    try {
        const docRef = await db.collection('paiements').add(paiementData);
        paiements.push({ id: docRef.id, ...paiementData });
        displayPaiements();
    } catch (error) {
        console.error('Erreur création paiement achat:', error);
    }
}

async function createPaiementFromVente(venteData) {
    const paiementData = {
        type: 'entree',
        reference: `VENT-${Date.now()}`,
        description: `Vente - ${venteData.items[0].article.designation}`,
        client: venteData.clientId,
        clientName: venteData.clientName,
        montant: venteData.total,
        modePaiement: venteData.modePaiement,
        date: venteData.date,
        statut: 'valide',
        createdAt: new Date()
    };

    try {
        const docRef = await db.collection('paiements').add(paiementData);
        paiements.push({ id: docRef.id, ...paiementData });
        displayPaiements();
    } catch (error) {
        console.error('Erreur création paiement vente:', error);
    }
}

// File upload functions
async function smartUploadLogo() {
    const fileInput = document.getElementById('logoUpload');
    const file = fileInput.files[0];
    
    if (!file) {
        showNotification('Veuillez sélectionner un fichier', 'error');
        return;
    }

    try {
        const testRef = storage.ref('test/permission_test.txt');
        await testRef.putString('test');
        await testRef.delete();
        
        await uploadLogo();
        
    } catch (error) {
        if (error.code === 'storage/unauthorized') {
            showNotification('Règles Firebase Storage à configurer - Mode local activé', 'info');
        } else {
            showNotification('Firebase Storage indisponible - Mode local activé', 'info');
        }
        
        uploadLogoLocal();
    }
}

async function smartUploadCachet() {
    const fileInput = document.getElementById('cachetUpload');
    const file = fileInput.files[0];
    
    if (!file) {
        showNotification('Veuillez sélectionner un fichier', 'error');
        return;
    }

    try {
        const testRef = storage.ref('test/permission_test.txt');
        await testRef.putString('test');
        await testRef.delete();
        
        await uploadCachet();
        
    } catch (error) {
        if (error.code === 'storage/unauthorized') {
            showNotification('Règles Firebase Storage à configurer - Mode local activé', 'info');
        } else {
            showNotification('Firebase Storage indisponible - Mode local activé', 'info');
        }
        
        uploadCachetLocal();
    }
}

async function uploadLogo() {
    const fileInput = document.getElementById('logoUpload');
    const file = fileInput.files[0];
    
    if (!file) {
        showNotification('Veuillez sélectionner un fichier', 'error');
        return;
    }

    if (!file.type.startsWith('image/')) {
        showNotification('Veuillez sélectionner un fichier image', 'error');
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        showNotification('Le fichier est trop volumineux (max 5MB)', 'error');
        return;
    }

    try {
        showNotification('Upload en cours...', 'info');
        
        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop();
        const fileName = `logo_${timestamp}.${fileExtension}`;
        
        const storageRef = storage.ref(`images/${fileName}`);
        
        const metadata = {
            contentType: file.type,
            customMetadata: {
                'uploadedBy': 'admin',
                'uploadDate': new Date().toISOString()
            }
        };
        
        const snapshot = await storageRef.put(file, metadata);
        const downloadURL = await snapshot.ref.getDownloadURL();
        
        companySettings.logoUrl = downloadURL;
        await db.collection('settings').doc('company').set(companySettings, { merge: true });
        
        updateCompanyDisplay();
        showNotification('Logo téléchargé avec succès', 'success');
        
        fileInput.value = '';
        
    } catch (error) {
        console.error('Erreur upload logo:', error);
        
        if (error.code === 'storage/unauthorized') {
            showNotification('Erreur d\'autorisation. Vérifiez les règles Firebase Storage.', 'error');
        } else if (error.code === 'storage/retry-limit-exceeded') {
            showNotification('Connexion instable. Réessayez dans quelques minutes.', 'error');
        } else if (error.code === 'storage/invalid-format') {
            showNotification('Format de fichier non supporté.', 'error');
        } else {
            showNotification('Erreur lors du téléchargement: ' + error.message, 'error');
        }
    }
}

async function uploadCachet() {
    const fileInput = document.getElementById('cachetUpload');
    const file = fileInput.files[0];
    
    if (!file) {
        showNotification('Veuillez sélectionner un fichier', 'error');
        return;
    }

    if (!file.type.startsWith('image/')) {
        showNotification('Veuillez sélectionner un fichier image', 'error');
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        showNotification('Le fichier est trop volumineux (max 5MB)', 'error');
        return;
    }

    try {
        showNotification('Upload en cours...', 'info');
        
        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop();
        const fileName = `cachet_${timestamp}.${fileExtension}`;
        
        const storageRef = storage.ref(`images/${fileName}`);
        
        const metadata = {
            contentType: file.type,
            customMetadata: {
                'uploadedBy': 'admin',
                'uploadDate': new Date().toISOString()
            }
        };
        
        const snapshot = await storageRef.put(file, metadata);
        const downloadURL = await snapshot.ref.getDownloadURL();
        
        companySettings.cachetUrl = downloadURL;
        await db.collection('settings').doc('company').set(companySettings, { merge: true });
        
        showNotification('Cachet téléchargé avec succès', 'success');
        
        fileInput.value = '';
        
    } catch (error) {
        console.error('Erreur upload cachet:', error);
        
        if (error.code === 'storage/unauthorized') {
            showNotification('Erreur d\'autorisation. Vérifiez les règles Firebase Storage.', 'error');
        } else if (error.code === 'storage/retry-limit-exceeded') {
            showNotification('Connexion instable. Réessayez dans quelques minutes.', 'error');
        } else if (error.code === 'storage/invalid-format') {
            showNotification('Format de fichier non supporté.', 'error');
        } else {
            showNotification('Erreur lors du téléchargement: ' + error.message, 'error');
        }
    }
}

function uploadLogoLocal() {
    const fileInput = document.getElementById('logoUpload');
    const file = fileInput.files[0];
    
    if (!file) {
        showNotification('Veuillez sélectionner un fichier', 'error');
        return;
    }

    if (!file.type.startsWith('image/')) {
        showNotification('Veuillez sélectionner un fichier image', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const base64Data = e.target.result;
            companySettings.logoUrl = base64Data;
            
            const settingsToSave = { ...companySettings };
            delete settingsToSave.logoUrl;
            
            db.collection('settings').doc('company').set(settingsToSave, { merge: true });
            
            updateCompanyDisplay();
            showNotification('Logo chargé localement avec succès', 'success');
            fileInput.value = '';
        } catch (error) {
            console.error('Erreur lecture fichier:', error);
            showNotification('Erreur lors de la lecture du fichier', 'error');
        }
    };
    
    reader.readAsDataURL(file);
}

function uploadCachetLocal() {
    const fileInput = document.getElementById('cachetUpload');
    const file = fileInput.files[0];
    
    if (!file) {
        showNotification('Veuillez sélectionner un fichier', 'error');
        return;
    }

    if (!file.type.startsWith('image/')) {
        showNotification('Veuillez sélectionner un fichier image', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const base64Data = e.target.result;
            companySettings.cachetUrl = base64Data;
            
            const settingsToSave = { ...companySettings };
            delete settingsToSave.cachetUrl;
            
            db.collection('settings').doc('company').set(settingsToSave, { merge: true });
            
            showNotification('Cachet chargé localement avec succès', 'success');
            fileInput.value = '';
        } catch (error) {
            console.error('Erreur lecture fichier:', error);
            showNotification('Erreur lors de la lecture du fichier', 'error');
        }
    };
    
    reader.readAsDataURL(file);
}

// Firebase Storage connectivity test
async function testFirebaseStorage() {
    try {
        const testRef = storage.ref('test/connectivity_test.txt');
        const testData = `Test ${Date.now()}`;
        
        await testRef.putString(testData, 'raw');
        const downloadURL = await testRef.getDownloadURL();
        await testRef.delete();
        
        console.log('✅ Firebase Storage accessible');
        return true;
        
    } catch (error) {
        console.error('❌ Firebase Storage test échoué:', error.code, error.message);
        return false;
    }
}

// App initialization with connectivity test
async function initializeApp() {
    if (!firebase.apps.length) {
        showNotification('Configuration Firebase manquante', 'error');
        return;
    }

    try {
        await db.collection('test').doc('connectivity').set({ test: true });
        await db.collection('test').doc('connectivity').delete();
        console.log('✅ Firestore accessible');
    } catch (error) {
        console.error('❌ Firestore inaccessible:', error);
        showNotification('Problème de connexion Firestore', 'error');
    }

    try {
        const storageAvailable = await testFirebaseStorage();
        if (!storageAvailable) {
            showNotification('Mode local activé pour les images', 'info');
        }
    } catch (error) {
        console.error('❌ Erreur test Firebase Storage:', error);
        showNotification('Mode local activé pour les images', 'info');
    }
    
    // Setup document item event listeners
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('item-article') || 
            e.target.classList.contains('item-quantity') || 
            e.target.classList.contains('item-price')) {
            calculateTotal();
        }
    });

    const firstRow = document.querySelector('.item-row');
    if (firstRow) {
        setupItemEventListeners(firstRow);
    }
}

// Add diagnostic function to window for manual testing
window.diagnoseNav = diagnoseNavigationIssues;

// Manual test function to force show section
window.testShowSection = function(sectionName) {
    console.log(`🧪 TESTING: Attempting to show section "${sectionName}"`);
    
    // Force remove all active classes
    document.querySelectorAll('.section').forEach(s => {
        s.classList.remove('active');
        s.style.display = 'none'; // Force hide
    });
    
    // Force show target section
    const target = document.getElementById(sectionName);
    if (target) {
        target.classList.add('active');
        target.style.display = 'block'; // Force show
        console.log(`✅ Forced section "${sectionName}" to display`);
        
        // Check final state
        setTimeout(() => {
            const finalDisplay = window.getComputedStyle(target).display;
            console.log(`📐 Final display state: ${finalDisplay}`);
        }, 100);
    } else {
        console.error(`❌ Section "${sectionName}" not found`);
    }
};

// Quick test all sections function
window.testAllSections = function() {
    const sectionNames = ['dashboard', 'clients', 'articles', 'documents', 'ventes', 'achats', 'paiements', 'settings'];
    sectionNames.forEach((name, index) => {
        setTimeout(() => {
            console.log(`🧪 Testing section ${index + 1}/${sectionNames.length}: ${name}`);
            window.testShowSection(name);
        }, index * 1000);
    });
};

// Final initialization message
console.log('Application de Gestion Commerciale - DYNAMIQUE FROID SYSTEMES initialisée avec optimisations de performance');