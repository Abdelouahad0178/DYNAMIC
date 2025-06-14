// debug-visibility.js - Diagnostic complet du problème d'affichage

function fullVisibilityDiagnostic() {
    console.log('🔍 DIAGNOSTIC COMPLET DE VISIBILITÉ');
    console.log('=====================================');
    
    // 1. Vérifier toutes les sections et leur contenu
    const sections = document.querySelectorAll('.section');
    console.log(`📄 Total sections trouvées: ${sections.length}`);
    
    sections.forEach((section, index) => {
        const styles = window.getComputedStyle(section);
        const hasContent = section.innerHTML.trim().length > 0;
        const hasChildren = section.children.length > 0;
        const rect = section.getBoundingClientRect();
        
        console.log(`\n📍 SECTION ${index}: ${section.id}`);
        console.log(`   Classes: ${section.className}`);
        console.log(`   Display: ${styles.display}`);
        console.log(`   Opacity: ${styles.opacity}`);
        console.log(`   Visibility: ${styles.visibility}`);
        console.log(`   Z-Index: ${styles.zIndex}`);
        console.log(`   Position: ${styles.position}`);
        console.log(`   Width: ${rect.width}px`);
        console.log(`   Height: ${rect.height}px`);
        console.log(`   Top: ${rect.top}px`);
        console.log(`   Left: ${rect.left}px`);
        console.log(`   Contenu HTML: ${hasContent ? 'OUI' : 'NON'}`);
        console.log(`   Enfants: ${hasChildren ? hasChildren : 'AUCUN'}`);
        console.log(`   Texte visible: "${section.textContent.slice(0, 100)}..."`);
        
        // Vérifier si la section est réellement dans le viewport
        const inViewport = rect.top >= 0 && rect.left >= 0 && 
                          rect.bottom <= window.innerHeight && 
                          rect.right <= window.innerWidth;
        console.log(`   Dans viewport: ${inViewport ? 'OUI' : 'NON'}`);
    });
    
    // 2. Vérifier le conteneur principal
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        const mainStyles = window.getComputedStyle(mainContent);
        const mainRect = mainContent.getBoundingClientRect();
        console.log(`\n📦 CONTENEUR PRINCIPAL (.main-content):`);
        console.log(`   Display: ${mainStyles.display}`);
        console.log(`   Opacity: ${mainStyles.opacity}`);
        console.log(`   Visibility: ${mainStyles.visibility}`);
        console.log(`   Width: ${mainRect.width}px`);
        console.log(`   Height: ${mainRect.height}px`);
        console.log(`   Margin-top: ${mainStyles.marginTop}`);
        console.log(`   Padding: ${mainStyles.padding}`);
    }
    
    // 3. Vérifier la navbar
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        const navStyles = window.getComputedStyle(navbar);
        const navRect = navbar.getBoundingClientRect();
        console.log(`\n🧭 NAVBAR:`);
        console.log(`   Position: ${navStyles.position}`);
        console.log(`   Z-Index: ${navStyles.zIndex}`);
        console.log(`   Height: ${navRect.height}px`);
        console.log(`   Top: ${navRect.top}px`);
    }
    
    // 4. Vérifier les conflits CSS potentiels
    console.log(`\n⚠️ CONFLITS CSS POTENTIELS:`);
    const body = document.body;
    const bodyStyles = window.getComputedStyle(body);
    console.log(`   Body overflow: ${bodyStyles.overflow}`);
    console.log(`   Body height: ${bodyStyles.height}`);
    console.log(`   Body position: ${bodyStyles.position}`);
    
    // 5. Vérifier les styles inline qui peuvent poser problème
    sections.forEach((section, index) => {
        if (section.style.cssText) {
            console.log(`\n🎨 STYLES INLINE section ${section.id}:`);
            console.log(`   ${section.style.cssText}`);
        }
    });
    
    console.log('\n=====================================');
    return {
        sections: sections.length,
        visibleSections: [...sections].filter(s => window.getComputedStyle(s).opacity === '1').length,
        activeSection: document.querySelector('.section.active')?.id || 'AUCUNE'
    };
}

function forceShowAllSections() {
    console.log('🔧 FORÇAGE D\'AFFICHAGE DE TOUTES LES SECTIONS');
    
    // Supprimer tous les styles qui pourraient cacher les sections
    const sections = document.querySelectorAll('.section');
    
    sections.forEach((section, index) => {
        console.log(`🔄 Forçage section ${index}: ${section.id}`);
        
        // Supprimer les classes qui cachent
        section.classList.remove('hide', 'hidden', 'invisible');
        
        // Forcer les styles inline
        section.style.cssText = `
            display: block !important;
            opacity: 1 !important;
            visibility: visible !important;
            position: relative !important;
            z-index: 1 !important;
            transform: none !important;
            height: auto !important;
            width: 100% !important;
            overflow: visible !important;
            background: rgba(255, 0, 0, 0.1) !important;
            border: 2px solid red !important;
            padding: 20px !important;
            margin: 10px 0 !important;
        `;
        
        // Ajouter du contenu de test si vide
        if (section.innerHTML.trim().length < 50) {
            section.innerHTML = `
                <div style="background: yellow; padding: 20px; margin: 10px; border: 2px solid black;">
                    <h1>SECTION DE TEST: ${section.id.toUpperCase()}</h1>
                    <p>Cette section est maintenant visible de force.</p>
                    <p>Contenu original: ${section.innerHTML.slice(0, 100)}...</p>
                </div>
            `;
        }
    });
    
    // Forcer le conteneur principal aussi
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.style.cssText = `
            display: block !important;
            opacity: 1 !important;
            visibility: visible !important;
            margin-top: 100px !important;
            padding: 20px !important;
            background: rgba(0, 255, 0, 0.1) !important;
            border: 3px solid green !important;
            min-height: 80vh !important;
        `;
    }
    
    console.log('✅ Forçage terminé - toutes les sections devraient être visibles avec des bordures colorées');
}

function testSectionContent() {
    console.log('📝 TEST DU CONTENU DES SECTIONS');
    console.log('===============================');
    
    const sections = document.querySelectorAll('.section');
    
    sections.forEach((section, index) => {
        console.log(`\n📄 SECTION ${section.id}:`);
        console.log(`   Contenu HTML (longueur): ${section.innerHTML.length} caractères`);
        console.log(`   Nombre d'éléments enfants: ${section.children.length}`);
        console.log(`   Texte visible: "${section.textContent.slice(0, 200)}..."`);
        
        // Vérifier les éléments spécifiques
        const header = section.querySelector('.section-header');
        const tables = section.querySelectorAll('table');
        const buttons = section.querySelectorAll('.btn');
        
        console.log(`   Header trouvé: ${header ? 'OUI' : 'NON'}`);
        console.log(`   Tables trouvées: ${tables.length}`);
        console.log(`   Boutons trouvés: ${buttons.length}`);
        
        // Si la section semble vide, ajouter du contenu de test
        if (section.children.length < 2) {
            console.log(`   ⚠️ Section semble vide - ajout de contenu de test`);
            
            const testContent = document.createElement('div');
            testContent.innerHTML = `
                <div style="background: #f0f0f0; padding: 20px; margin: 10px; border: 1px solid #ccc; border-radius: 8px;">
                    <h2>Section ${section.id.toUpperCase()}</h2>
                    <p>Cette section fonctionne maintenant !</p>
                    <button class="btn btn-primary" onclick="alert('Bouton ${section.id} cliqué!')">
                        Test ${section.id}
                    </button>
                </div>
            `;
            section.appendChild(testContent);
        }
    });
}

function addVisibilityStyles() {
    console.log('🎨 AJOUT DE STYLES DE VISIBILITÉ FORCÉE');
    
    const style = document.createElement('style');
    style.id = 'force-visibility-styles';
    style.textContent = `
        /* STYLES DE DEBUG - FORÇAGE TOTAL */
        body {
            overflow-x: auto !important;
            overflow-y: auto !important;
        }
        
        .main-content {
            display: block !important;
            opacity: 1 !important;
            visibility: visible !important;
            position: relative !important;
            z-index: 1 !important;
            background: rgba(0, 255, 0, 0.05) !important;
            border: 2px dashed green !important;
            min-height: 80vh !important;
        }
        
        .section {
            display: block !important;
            opacity: 1 !important;
            visibility: visible !important;
            position: relative !important;
            z-index: 1 !important;
            background: rgba(255, 255, 0, 0.05) !important;
            border: 1px solid orange !important;
            margin: 10px 0 !important;
            padding: 20px !important;
            min-height: 200px !important;
        }
        
        .section.active {
            display: block !important;
            opacity: 1 !important;
            visibility: visible !important;
            background: rgba(0, 255, 0, 0.1) !important;
            border: 3px solid green !important;
        }
        
        .section:not(.active) {
            display: none !important;
        }
        
        /* Assurer que les en-têtes sont visibles */
        .section-header {
            display: flex !important;
            opacity: 1 !important;
            visibility: visible !important;
            background: rgba(0, 0, 255, 0.05) !important;
            border: 1px solid blue !important;
            padding: 10px !important;
            margin-bottom: 20px !important;
        }
        
        .section-header h1 {
            color: #333 !important;
            font-size: 24px !important;
            margin: 0 !important;
        }
        
        /* Boutons de navigation visibles */
        .nav-btn.active {
            background: rgba(255, 255, 255, 0.3) !important;
            border: 2px solid white !important;
            color: white !important;
        }
    `;
    
    // Supprimer l'ancien style s'il existe
    const oldStyle = document.getElementById('force-visibility-styles');
    if (oldStyle) {
        oldStyle.remove();
    }
    
    document.head.appendChild(style);
    console.log('✅ Styles de visibilité forcée ajoutés');
}

function completeVisibilityFix() {
    console.log('🚀 CORRECTION COMPLÈTE DE VISIBILITÉ');
    console.log('===================================');
    
    // 1. Diagnostic complet
    const diagnostic = fullVisibilityDiagnostic();
    
    // 2. Ajouter styles de forçage
    addVisibilityStyles();
    
    // 3. Tester le contenu
    testSectionContent();
    
    // 4. Forcer l'affichage si nécessaire
    if (diagnostic.visibleSections === 0) {
        console.log('⚠️ Aucune section visible - forçage d\'affichage');
        forceShowAllSections();
    }
    
    // 5. Naviguer vers dashboard pour test
    setTimeout(() => {
        console.log('🔄 Test de navigation vers dashboard');
        if (window.showSection) {
            window.showSection('dashboard');
        }
        
        // Vérifier après navigation
        setTimeout(() => {
            const newDiagnostic = fullVisibilityDiagnostic();
            console.log('📊 RÉSULTAT FINAL:');
            console.log(`   Sections visibles: ${newDiagnostic.visibleSections}/${newDiagnostic.sections}`);
            console.log(`   Section active: ${newDiagnostic.activeSection}`);
            
            if (newDiagnostic.visibleSections > 0) {
                console.log('✅ SUCCÈS - Sections maintenant visibles !');
            } else {
                console.log('❌ ÉCHEC - Problème plus profond, voir diagnostic ci-dessus');
            }
        }, 500);
    }, 1000);
}

// Auto-exécution après chargement complet
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        console.log('🔍 Lancement du diagnostic de visibilité...');
        completeVisibilityFix();
    }, 3000); // Attendre 3 secondes pour que tout soit chargé
});

// Export des fonctions pour utilisation manuelle
window.visibilityDebug = {
    fullVisibilityDiagnostic,
    forceShowAllSections,
    testSectionContent,
    addVisibilityStyles,
    completeVisibilityFix
};

console.log('🔧 Debug de visibilité chargé - utilisez window.visibilityDebug.completeVisibilityFix()');