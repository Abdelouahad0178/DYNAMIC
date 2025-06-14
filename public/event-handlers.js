// event-handlers.js - Gestionnaires d'événements et initialisation

// Set up event listeners with optimized touch support
function setupEventListeners() {
    try {
        // Navigation buttons - Fix pour les clics sur les icônes
        const navButtons = document.querySelectorAll('.nav-btn');
        console.log('Found navigation buttons:', navButtons.length);
        
        if (navButtons.length === 0) {
            console.warn('Aucun bouton de navigation (.nav-btn) trouvé dans le DOM');
        }
        
        navButtons.forEach((btn, index) => {
            const section = btn.dataset.section;
            console.log(`Button ${index}: section="${section}"`);
            
            // Fonction de gestion universelle
            function handleNavigation(e) {
                console.log('Navigation event triggered:', e.type, 'on button:', btn);
                e.preventDefault();
                e.stopPropagation();
                
                let targetButton = e.currentTarget;
                console.log('currentTarget:', targetButton);
                console.log('target:', e.target);
                
                if (!targetButton.dataset.section) {
                    targetButton = e.target.closest('.nav-btn');
                    console.log('Found closest nav-btn:', targetButton);
                }
                
                const section = targetButton?.dataset.section;
                console.log('Navigation detected, section:', section);
                
                if (section) {
                    console.log('Calling showSection with:', section);
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

// Expose all modal functions globally for HTML onclick compatibility
function exposeGlobalFunctions() {
    // Make sure all onclick functions are available globally
    window.showClientModal = showClientModal;
    window.showArticleModal = showArticleModal;
    window.showDocumentModal = showDocumentModal;
    window.showAchatModal = showAchatModal;
    window.showVenteModal = showVenteModal;
    window.closeModal = closeModal;
    window.addItem = addItem;
    window.removeItem = removeItem;
    window.previewDocument = previewDocument;
    window.printDocument = printDocument;
    window.editClient = editClient;
    window.editArticle = editArticle;
    window.deleteClient = deleteClient;
    window.deleteArticle = deleteArticle;
    window.deleteAchat = deleteAchat;
    window.deleteDocument = deleteDocument;
    window.viewAchatDetails = viewAchatDetails;
    window.viewVenteDetails = viewVenteDetails;
    window.smartUploadLogo = smartUploadLogo;
    window.smartUploadCachet = smartUploadCachet;
    window.testFirebaseStorage = testFirebaseStorage;
    window.showSection = showSection;
    
    // Filter functions
    window.filterClients = filterClients;
    window.filterArticles = filterArticles;
    window.filterDocuments = filterDocuments;
    window.filterVentes = filterVentes;
    window.filterAchats = filterAchats;
    window.filterPaiements = filterPaiements;
    window.resetDocumentFilters = resetDocumentFilters;
    window.resetVenteFilters = resetVenteFilters;
    window.resetAchatFilters = resetAchatFilters;
    window.resetPaiementFilters = resetPaiementFilters;
    
    // Debug functions
    window.diagnoseNav = diagnoseNavigationIssues;
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
    
    window.testAllSections = function() {
        const sectionNames = ['dashboard', 'clients', 'articles', 'documents', 'ventes', 'achats', 'paiements', 'settings'];
        sectionNames.forEach((name, index) => {
            setTimeout(() => {
                console.log(`🧪 Testing section ${index + 1}/${sectionNames.length}: ${name}`);
                window.testShowSection(name);
            }, index * 1000);
        });
    };
    
    console.log('✅ All modal functions exposed globally');
}

// Initialize app on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM Content Loaded - Initializing app');
    
    // Expose all functions globally first
    exposeGlobalFunctions();
    
    initializeApp();
    setupEventListeners();
    loadData();
    
    // Diagnostic après un délai pour s'assurer que tout est chargé
    setTimeout(() => {
        diagnoseNavigationIssues();
    }, 1000);
});

console.log('Application de Gestion Commerciale - DYNAMIQUE FROID SYSTEMES initialisée avec optimisations de performance');