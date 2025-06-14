// emergency-fix.js - Solution d'urgence pour affichage immédiat

console.log('🚨 SOLUTION D\'URGENCE ACTIVÉE');

// SOLUTION 1: Supprimer TOUS les CSS qui cachent et forcer l'affichage
function emergencyShowSections() {
    console.log('🔧 FORÇAGE D\'URGENCE EN COURS...');
    
    // Supprimer tous les styles CSS existants qui pourraient cacher
    const allStyles = document.querySelectorAll('style, link[rel="stylesheet"]');
    let hiddenStylesRemoved = 0;
    
    allStyles.forEach(style => {
        if (style.textContent && (
            style.textContent.includes('display: none') ||
            style.textContent.includes('opacity: 0') ||
            style.textContent.includes('visibility: hidden')
        )) {
            console.log('🗑️ Suppression style problématique:', style);
            // Ne pas supprimer complètement, juste commenter les règles problématiques
            hiddenStylesRemoved++;
        }
    });
    
    // Créer un style d'urgence TRÈS puissant
    const emergencyStyle = document.createElement('style');
    emergencyStyle.id = 'emergency-visibility-fix';
    emergencyStyle.textContent = `
        /* SOLUTION D'URGENCE - PRIORITÉ MAXIMALE */
        * {
            visibility: visible !important;
        }
        
        body {
            display: block !important;
            opacity: 1 !important;
            visibility: visible !important;
            overflow: visible !important;
            height: auto !important;
            background: white !important;
        }
        
        .main-content {
            display: block !important;
            opacity: 1 !important;
            visibility: visible !important;
            margin-top: 120px !important;
            padding: 20px !important;
            background: #f9f9f9 !important;
            border: 3px solid #00ff00 !important;
            min-height: calc(100vh - 140px) !important;
            position: relative !important;
            z-index: 999 !important;
            overflow: visible !important;
        }
        
        .section {
            display: block !important;
            opacity: 1 !important;
            visibility: visible !important;
            position: relative !important;
            z-index: 1000 !important;
            background: white !important;
            border: 2px solid #ff0000 !important;
            margin: 20px 0 !important;
            padding: 30px !important;
            border-radius: 10px !important;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1) !important;
            transform: none !important;
            animation: none !important;
            transition: none !important;
            height: auto !important;
            width: 100% !important;
            max-width: none !important;
            min-height: 300px !important;
            overflow: visible !important;
        }
        
        .section.active {
            display: block !important;
            opacity: 1 !important;
            visibility: visible !important;
            border-color: #00ff00 !important;
            background: #f0fff0 !important;
        }
        
        .section:not(.active) {
            display: none !important;
        }
        
        .section-header {
            display: block !important;
            opacity: 1 !important;
            visibility: visible !important;
            margin-bottom: 20px !important;
            padding: 15px !important;
            background: #e6f3ff !important;
            border: 2px solid #0066cc !important;
            border-radius: 5px !important;
        }
        
        .section-header h1 {
            display: block !important;
            opacity: 1 !important;
            visibility: visible !important;
            color: #333 !important;
            font-size: 28px !important;
            font-weight: bold !important;
            margin: 0 !important;
            text-align: center !important;
        }
        
        .stats-grid,
        .table-container,
        .settings-grid {
            display: block !important;
            opacity: 1 !important;
            visibility: visible !important;
            background: #fff !important;
            padding: 15px !important;
            border: 1px solid #ddd !important;
            border-radius: 5px !important;
            margin: 15px 0 !important;
        }
        
        .btn {
            display: inline-block !important;
            opacity: 1 !important;
            visibility: visible !important;
            background: #007bff !important;
            color: white !important;
            padding: 10px 20px !important;
            border: none !important;
            border-radius: 5px !important;
            cursor: pointer !important;
            margin: 5px !important;
        }
        
        table {
            display: table !important;
            opacity: 1 !important;
            visibility: visible !important;
            width: 100% !important;
            border-collapse: collapse !important;
            margin: 10px 0 !important;
        }
        
        th, td {
            display: table-cell !important;
            opacity: 1 !important;
            visibility: visible !important;
            padding: 8px !important;
            border: 1px solid #ddd !important;
        }
        
        /* Navigation visible */
        .navbar {
            display: block !important;
            opacity: 1 !important;
            visibility: visible !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            z-index: 9999 !important;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            padding: 15px !important;
        }
        
        .nav-btn {
            display: inline-block !important;
            opacity: 1 !important;
            visibility: visible !important;
            color: white !important;
            padding: 8px 16px !important;
            margin: 2px !important;
            background: rgba(255,255,255,0.2) !important;
            border: 1px solid rgba(255,255,255,0.3) !important;
            border-radius: 5px !important;
            cursor: pointer !important;
        }
        
        .nav-btn.active {
            background: rgba(255,255,255,0.4) !important;
            border-color: rgba(255,255,255,0.6) !important;
        }
    `;
    
    document.head.appendChild(emergencyStyle);
    
    // Forcer chaque section individuellement
    const sections = document.querySelectorAll('.section');
    console.log(`🔄 Traitement de ${sections.length} sections...`);
    
    sections.forEach((section, index) => {
        console.log(`📄 Section ${index}: ${section.id}`);
        
        // Supprimer toutes les classes CSS
        section.className = 'section';
        
        // Forcer les styles inline
        section.style.cssText = `
            display: block !important;
            opacity: 1 !important;
            visibility: visible !important;
            position: relative !important;
            z-index: 1000 !important;
            background: white !important;
            border: 3px solid #ff6600 !important;
            margin: 20px 0 !important;
            padding: 30px !important;
            border-radius: 10px !important;
            min-height: 300px !important;
            width: 100% !important;
            box-sizing: border-box !important;
        `;
        
        // Ajouter du contenu visible si section vide
        if (section.innerHTML.trim().length < 100) {
            section.innerHTML = `
                <div style="text-align: center; padding: 40px; background: #ffffcc; border: 2px solid #ffcc00; border-radius: 8px;">
                    <h1 style="color: #333; font-size: 32px; margin-bottom: 20px;">
                        SECTION ${section.id.toUpperCase()}
                    </h1>
                    <p style="font-size: 18px; color: #666; margin-bottom: 20px;">
                        Cette section est maintenant visible !
                    </p>
                    <button onclick="alert('Section ${section.id} fonctionne!')" 
                            style="background: #28a745; color: white; padding: 12px 24px; border: none; border-radius: 5px; font-size: 16px; cursor: pointer;">
                        Tester ${section.id}
                    </button>
                </div>
                ${section.innerHTML}
            `;
        }
        
        // S'assurer que la première section est active
        if (index === 0) {
            section.classList.add('active');
            section.style.borderColor = '#00ff00';
            section.style.background = '#f0fff0';
        }
    });
    
    // Forcer le main-content
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.style.cssText = `
            display: block !important;
            opacity: 1 !important;
            visibility: visible !important;
            margin-top: 120px !important;
            padding: 20px !important;
            background: #f8f9fa !important;
            border: 3px solid #28a745 !important;
            min-height: calc(100vh - 140px) !important;
            position: relative !important;
            z-index: 999 !important;
        `;
    }
    
    console.log('✅ FORÇAGE D\'URGENCE TERMINÉ');
    console.log('🔍 Toutes les sections devraient maintenant être visibles avec des bordures colorées');
    console.log('📱 Si vous ne voyez toujours rien, faites F12 et regardez l\'onglet Elements');
    
    return sections.length;
}

// SOLUTION 2: Navigation d'urgence simple
function createEmergencyNavigation() {
    console.log('🧭 Création navigation d\'urgence...');
    
    const emergencyNav = document.createElement('div');
    emergencyNav.id = 'emergency-nav';
    emergencyNav.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; right: 0; z-index: 99999; background: #dc3545; color: white; padding: 10px; text-align: center; border-bottom: 3px solid #fff;">
            <h3 style="margin: 0 0 10px 0;">🚨 NAVIGATION D'URGENCE ACTIVÉE</h3>
            <div style="display: flex; justify-content: center; flex-wrap: wrap; gap: 10px;">
                <button onclick="emergencyShowSection('dashboard')" style="background: #fff; color: #dc3545; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Dashboard</button>
                <button onclick="emergencyShowSection('clients')" style="background: #fff; color: #dc3545; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Clients</button>
                <button onclick="emergencyShowSection('articles')" style="background: #fff; color: #dc3545; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Articles</button>
                <button onclick="emergencyShowSection('documents')" style="background: #fff; color: #dc3545; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Documents</button>
                <button onclick="emergencyShowSection('ventes')" style="background: #fff; color: #dc3545; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Ventes</button>
                <button onclick="emergencyShowSection('achats')" style="background: #fff; color: #dc3545; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Achats</button>
                <button onclick="emergencyShowSection('paiements')" style="background: #fff; color: #dc3545; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Paiements</button>
                <button onclick="emergencyShowSection('settings')" style="background: #fff; color: #dc3545; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Paramètres</button>
            </div>
        </div>
    `;
    
    document.body.insertBefore(emergencyNav, document.body.firstChild);
    
    // Ajuster le margin-top du main-content
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.style.marginTop = '160px';
    }
}

// Fonction de navigation d'urgence
function emergencyShowSection(sectionName) {
    console.log(`🚨 Navigation d'urgence vers: ${sectionName}`);
    
    // Cacher toutes les sections
    const allSections = document.querySelectorAll('.section');
    allSections.forEach(section => {
        section.style.display = 'none';
        section.classList.remove('active');
    });
    
    // Afficher la section demandée
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.style.cssText = `
            display: block !important;
            opacity: 1 !important;
            visibility: visible !important;
            position: relative !important;
            z-index: 1000 !important;
            background: white !important;
            border: 3px solid #28a745 !important;
            margin: 20px 0 !important;
            padding: 30px !important;
            border-radius: 10px !important;
            min-height: 400px !important;
        `;
        targetSection.classList.add('active');
        
        console.log(`✅ Section ${sectionName} affichée en mode d'urgence`);
    } else {
        console.error(`❌ Section ${sectionName} introuvable`);
    }
}

// Activation automatique d'urgence
function activateEmergencyMode() {
    console.log('🚨🚨🚨 MODE D\'URGENCE ACTIVÉ 🚨🚨🚨');
    
    // 1. Forcer l'affichage
    const sectionsCount = emergencyShowSections();
    
    // 2. Créer navigation d'urgence
    createEmergencyNavigation();
    
    // 3. Exposer la fonction globalement
    window.emergencyShowSection = emergencyShowSection;
    
    // 4. Message d'état
    console.log(`✅ Mode d'urgence activé avec ${sectionsCount} sections`);
    console.log('🔧 Utilisez: emergencyShowSection("dashboard") pour naviguer');
    console.log('📱 Navigation d\'urgence visible en haut de page');
    
    // 5. Afficher le dashboard par défaut
    setTimeout(() => {
        emergencyShowSection('dashboard');
    }, 500);
}

// Activation automatique après 2 secondes
setTimeout(() => {
    console.log('⚡ Activation automatique du mode d\'urgence...');
    activateEmergencyMode();
}, 2000);

// Export des fonctions d'urgence
window.emergencyFix = {
    activateEmergencyMode,
    emergencyShowSections,
    createEmergencyNavigation,
    emergencyShowSection
};

console.log('🚨 SOLUTION D\'URGENCE CHARGÉE - Activation dans 2 secondes...');