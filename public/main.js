// main.js - Fichier principal pour charger tous les modules

// Import des scripts de façon modulaire via les balises script dans index.html
// Cet ordre d'importation doit être respecté dans index.html :

/*
1. config.js - Configuration Firebase et variables globales
2. utils.js - Fonctions utilitaires générales
3. navigation.js - Gestion de la navigation et interface
4. mobile.js - Optimisations mobiles et tactiles
5. data-loader.js - Chargement des données Firebase
6. client-manager.js - Gestion des clients
7. article-manager.js - Gestion des articles  
8. document-manager.js - Gestion des documents
9. sales-manager.js - Gestion des ventes
10. purchase-manager.js - Gestion des achats
11. payment-manager.js - Gestion des paiements
12. document-preview.js - Aperçu et impression
13. settings-manager.js - Gestion des paramètres
14. filters.js - Système de filtrage avancé (optionnel)
15. event-handlers.js - Gestionnaires d'événements et initialisation
16. main.js - Ce fichier (optionnel pour vérifications finales)
*/

// Vérifications finales et initialisation
document.addEventListener('DOMContentLoaded', function() {
    console.log('📋 Vérification des modules chargés...');
    
    // Vérifier que tous les modules critiques sont chargés
    const criticalFunctions = [
        'showSection',
        'showClientModal', 
        'showArticleModal',
        'showDocumentModal',
        'loadData',
        'updateDashboard'
    ];
    
    const missingFunctions = criticalFunctions.filter(func => typeof window[func] !== 'function');
    
    if (missingFunctions.length > 0) {
        console.error('❌ Fonctions manquantes:', missingFunctions);
        showNotification('Erreur de chargement des modules', 'error');
    } else {
        console.log('✅ Tous les modules critiques sont chargés');
    }
    
    // Vérifier Firebase
    if (typeof firebase === 'undefined') {
        console.error('❌ Firebase non chargé');
        showNotification('Firebase non disponible', 'error');
    } else {
        console.log('✅ Firebase chargé');
    }
    
    // Vérifier les variables globales
    const globalVars = ['clients', 'articles', 'documents', 'ventes', 'achats', 'paiements'];
    const missingVars = globalVars.filter(variable => typeof window[variable] === 'undefined');
    
    if (missingVars.length > 0) {
        console.warn('⚠️ Variables globales manquantes:', missingVars);
    } else {
        console.log('✅ Variables globales initialisées');
    }
    
    console.log('🎉 Application prête !');
});

// Export des fonctions utilitaires pour debug
window.debugApp = {
    testNavigation: () => {
        const sections = ['dashboard', 'clients', 'articles', 'documents', 'ventes', 'achats', 'paiements', 'settings'];
        sections.forEach((section, index) => {
            setTimeout(() => {
                console.log(`Testing ${section}...`);
                showSection(section);
            }, index * 1000);
        });
    },
    
    checkModules: () => {
        const modules = {
            config: typeof firebase !== 'undefined',
            utils: typeof showNotification === 'function',
            navigation: typeof showSection === 'function',
            mobile: typeof setupOptimizedTouchSupport === 'function',
            dataLoader: typeof loadData === 'function',
            clientManager: typeof showClientModal === 'function',
            articleManager: typeof showArticleModal === 'function',
            documentManager: typeof showDocumentModal === 'function',
            salesManager: typeof showVenteModal === 'function',
            purchaseManager: typeof showAchatModal === 'function',
            paymentManager: typeof displayPaiements === 'function',
            documentPreview: typeof previewDocument === 'function',
            settingsManager: typeof smartUploadLogo === 'function'
        };
        
        console.table(modules);
        return modules;
    },
    
    reloadData: async () => {
        console.log('🔄 Rechargement des données...');
        await loadData();
        updateDashboard();
        console.log('✅ Données rechargées');
    }
};

console.log('🔧 Debug disponible via window.debugApp');