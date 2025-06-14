
// navigation.js - Navigation et interface utilisateur

function showSection(sectionName) {
    console.log('🔄 showSection called with:', sectionName);
    
    // Vérifier que la section existe
    const targetSection = document.getElementById(sectionName);
    if (!targetSection) {
        console.error('❌ Section not found in DOM:', sectionName);
        console.log('Available sections:', [...document.querySelectorAll('.section')].map(s => s.id));
        return;
    }
    
    console.log('✅ Target section found:', targetSection);
    
    // Hide all sections
    const allSections = document.querySelectorAll('.section');
    console.log('📄 Hiding all sections, found:', allSections.length);
    
    allSections.forEach((section, index) => {
        console.log(`   Section ${index}: ${section.id} - removing active`);
        section.classList.remove('active');
    });
    
    // Remove active from all nav buttons
    const allNavButtons = document.querySelectorAll('.nav-btn');
    console.log('🔘 Deactivating all nav buttons, found:', allNavButtons.length);
    
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
        
        // Fermer le menu mobile après sélection
        if (window.innerWidth < 768) {
            console.log('📱 Mobile detected, closing mobile menu');
            toggleMobileMenu();
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

// Toggle le menu mobile
function toggleMobileMenu() {
    const navMobile = document.getElementById('navMobile');
    if (navMobile) {
        navMobile.classList.toggle('active');
        console.log(`📱 Mobile menu toggled: ${navMobile.classList.contains('active') ? 'visible' : 'hidden'}`);
    } else {
        console.error('Mobile menu (#navMobile) not found');
    }
}

// Modal management functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        modal.classList.add('active');
        console.log(`✅ Modal ${modalId} opened`);
        // Focus trap for accessibility
        const firstInput = modal.querySelector('input, select, textarea, button');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    } else {
        console.error(`❌ Modal ${modalId} not found`);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
        console.log(`✅ Modal ${modalId} closed`);
        const forms = modal.querySelectorAll('form');
        forms.forEach(form => form.reset());
    } else {
        console.error(`❌ Modal ${modalId} not found`);
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

// Initialiser les événements au chargement
document.addEventListener('DOMContentLoaded', () => {
    console.log('🛠️ Initializing navigation');
    
    // Ajouter les écouteurs pour les boutons de navigation
    const buttons = document.querySelectorAll('.nav-btn');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const sectionName = button.dataset.section;
            showSection(sectionName);
        });
    });

    // Gérer les clics à l'extérieur du menu mobile
    document.addEventListener('click', (event) => {
        const navMobile = document.getElementById('navMobile');
        const hamburger = document.querySelector('.hamburger');
        
        if (!navMobile || !hamburger) {
            console.error('navMobile or hamburger not found');
            return;
        }

        // Vérifier si le menu mobile est ouvert
        if (navMobile.classList.contains('active')) {
            // Vérifier si le clic est en dehors du menu et du bouton hamburger
            if (!navMobile.contains(event.target) && !hamburger.contains(event.target)) {
                console.log('📱 Click outside mobile menu, closing it');
                toggleMobileMenu();
            }
        }
    });
});
