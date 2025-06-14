// utils.js - Fonctions utilitaires
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

// Document number generation
function generateDocumentNumber(type) {
    const year = new Date().getFullYear();
    const number = documentCounter[type].toString().padStart(4, '0');
    documentCounter[type]++;
    
    const prefix = type === 'devis' ? 'DEV' : type === 'facture' ? 'FACT' : 'PROF';
    return `${prefix}-${year}-${number}`;
}

// Date initialization
function initializeDocumentDate() {
    const documentDateInput = document.getElementById('documentDate');
    if (documentDateInput) {
        documentDateInput.value = new Date().toISOString().split('T')[0];
    } else {
        console.warn('Champ de date du document non trouvé');
    }
}

// Dashboard calculations
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
    
    if (elements.totalAchats) elements.totalAchats.textContent = `${stats.totalAchats.toFixed(2)} `;
    if (elements.totalBenefice) elements.totalBenefice.textContent = `${stats.benefice.toFixed(2)} `;
    if (elements.totalMarge) elements.totalMarge.textContent = `${stats.margePercent.toFixed(1)}%`;
    
    // Update benefice color
    const beneficeIcon = elements.totalBenefice?.closest('.stat-card')?.querySelector('.stat-icon');
    if (beneficeIcon) {
        const color = stats.benefice >= 0 ? '#48bb78' : '#f56565';
        beneficeIcon.style.background = `linear-gradient(135deg, ${color}, ${color})`;
    }
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