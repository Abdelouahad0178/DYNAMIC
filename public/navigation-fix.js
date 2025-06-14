// navigation-fix.js - Correction du problème d'affichage des sections

// Fix pour le problème d'opacité des sections
function showSection(sectionName) {
    console.log('🔄 showSection called with:', sectionName);
    
    // Vérifier que la section existe
    const targetSection = document.getElementById(sectionName);
    if (!targetSection) {
        console.error('❌ Section not found in DOM:', sectionName);
        return;
    }
    
    console.log('✅ Target section found:', targetSection);
    
    // Hide all sections - avec force reset des styles
    const allSections = document.querySelectorAll('.section');
    console.log('📄 Hiding all sections, found:', allSections.length);
    
    allSections.forEach((section, index) => {
        console.log(`   Section ${index}: ${section.id} - removing active`);
        section.classList.remove('active');
        // Force reset des styles inline pour éviter les conflits
        section.style.display = 'none';
        section.style.opacity = '0';
        section.style.visibility = 'hidden';
        section.style.transform = 'translateY(20px)';
    });
    
    // Remove active from all nav buttons
    const allNavButtons = document.querySelectorAll('.nav-btn');
    console.log('🔘 Deactivating all nav buttons, found:', allNavButtons.length);
    
    allNavButtons.forEach((btn, index) => {
        console.log(`   Button ${index}: ${btn.dataset.section} - removing active`);
        btn.classList.remove('active');
    });
    
    // Show target section with force styles
    console.log('👁️ Activating target section:', sectionName);
    targetSection.classList.add('active');
    
    // Force les styles inline pour surpasser le CSS
    targetSection.style.display = 'block';
    targetSection.style.visibility = 'visible';
    targetSection.style.opacity = '1';
    targetSection.style.transform = 'translateY(0)';
    
    // Animation d'entrée fluide
    targetSection.style.transition = 'all 0.3s ease-out';
    
    // Vérifier l'état final
    setTimeout(() => {
        const computedStyle = window.getComputedStyle(targetSection);
        console.log('📐 Section final state:');
        console.log(`   display: ${computedStyle.display}`);
        console.log(`   visibility: ${computedStyle.visibility}`);
        console.log(`   opacity: ${computedStyle.opacity}`);
        console.log(`   transform: ${computedStyle.transform}`);
    }, 100);
    
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

// Fonction pour center les boutons sur mobile
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

// Fonction de diagnostic améliorée
function diagnoseNavigationIssues() {
    console.log('🔍 DIAGNOSTIC DE NAVIGATION - VERSION CORRIGÉE');
    console.log('===============================================');
    
    // Vérifier tous les boutons de navigation
    const navButtons = document.querySelectorAll('.nav-btn');
    console.log(`📱 Boutons de navigation trouvés: ${navButtons.length}`);
    navButtons.forEach((btn, index) => {
        console.log(`   ${index}: section="${btn.dataset.section}" text="${btn.textContent.trim()}"`);
    });
    
    // Vérifier toutes les sections avec styles détaillés
    const sections = document.querySelectorAll('.section');
    console.log(`📄 Sections trouvées: ${sections.length}`);
    sections.forEach((section, index) => {
        const isActive = section.classList.contains('active');
        const styles = window.getComputedStyle(section);
        console.log(`   ${index}: id="${section.id}"`);
        console.log(`      active=${isActive}`);
        console.log(`      display="${styles.display}"`);
        console.log(`      visibility="${styles.visibility}"`);
        console.log(`      opacity="${styles.opacity}"`);
        console.log(`      transform="${styles.transform}"`);
        console.log(`      transition="${styles.transition}"`);
    });
    
    console.log('===============================================');
    
    // Proposer des solutions
    console.log('🔧 SOLUTIONS SUGGÉRÉES:');
    console.log('1. Les sections ont opacity: 0 - utilisation de styles inline forcés');
    console.log('2. Vérifiez les règles CSS qui peuvent surcharger .section.active');
    console.log('3. Testez avec: window.showSection("clients") pour forcer l\'affichage');
}

// Test automatique de toutes les sections
function testAllSections() {
    const sectionNames = ['dashboard', 'clients', 'articles', 'documents', 'ventes', 'achats', 'paiements', 'settings'];
    console.log('🧪 Test automatique de toutes les sections...');
    
    sectionNames.forEach((name, index) => {
        setTimeout(() => {
            console.log(`🔄 Test ${index + 1}/${sectionNames.length}: ${name}`);
            showSection(name);
            
            // Vérifier l'état après changement
            setTimeout(() => {
                const section = document.getElementById(name);
                const isVisible = window.getComputedStyle(section).opacity === '1';
                console.log(`   ${name}: ${isVisible ? '✅ VISIBLE' : '❌ INVISIBLE'}`);
            }, 200);
        }, index * 1500);
    });
}

// Fix CSS via JavaScript pour surpasser les conflits
function applyCSSFix() {
    const style = document.createElement('style');
    style.textContent = `
        /* Fix urgent pour l'affichage des sections */
        .section.active {
            display: block !important;
            opacity: 1 !important;
            visibility: visible !important;
            transform: translateY(0) !important;
            transition: all 0.3s ease-out !important;
        }
        
        .section:not(.active) {
            display: none !important;
            opacity: 0 !important;
            visibility: hidden !important;
            transform: translateY(20px) !important;
        }
        
        /* Animation d'entrée */
        @keyframes sectionFadeIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .section.active {
            animation: sectionFadeIn 0.4s ease-out;
        }
    `;
    
    document.head.appendChild(style);
    console.log('🔧 CSS Fix appliqué pour forcer l\'affichage des sections');
}

// Auto-application du fix au chargement
document.addEventListener('DOMContentLoaded', function() {
    // Appliquer le fix CSS immédiatement
    applyCSSFix();
    
    // Surcharger la fonction showSection globale
    window.showSection = showSection;
    window.diagnoseNavigationIssues = diagnoseNavigationIssues;
    window.testAllSections = testAllSections;
    
    console.log('🔧 Navigation fix appliqué avec succès');
    console.log('💡 Testez avec: testAllSections() ou showSection("clients")');
    
    // Test automatique après 2 secondes
    setTimeout(() => {
        console.log('🧪 Test automatique de la navigation...');
        showSection('dashboard'); // S'assurer que le dashboard est visible
    }, 2000);
});

// Export des fonctions pour debug
window.navigationDebug = {
    showSection,
    diagnoseNavigationIssues,
    testAllSections,
    applyCSSFix
};