// payment-manager.js - Gestion des paiements

function displayPaiements() {
    displayFilteredPaiements(paiements);
}

function displayFilteredPaiements(filteredPaiements) {
    const tbody = document.querySelector('#paiementsTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    filteredPaiements.forEach(paiement => {
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

// Payment filtering
function filterPaiements() {
    const nameFilter = document.getElementById('paiementFilterName').value.toLowerCase();
    const startDate = document.getElementById('paiementFilterDateStart').value;
    const endDate = document.getElementById('paiementFilterDateEnd').value;
    
    let filteredPaiements = paiements;
    
    if (nameFilter) {
        filteredPaiements = filteredPaiements.filter(paiement => {
            const searchText = (paiement.fournisseur || paiement.clientName || paiement.description || '').toLowerCase();
            return searchText.includes(nameFilter);
        });
    }
    
    if (startDate) {
        filteredPaiements = filteredPaiements.filter(paiement => 
            new Date(paiement.date) >= new Date(startDate)
        );
    }
    
    if (endDate) {
        filteredPaiements = filteredPaiements.filter(paiement => 
            new Date(paiement.date) <= new Date(endDate)
        );
    }
    
    displayFilteredPaiements(filteredPaiements);
}

function resetPaiementFilters() {
    document.getElementById('paiementFilterName').value = '';
    document.getElementById('paiementFilterDateStart').value = '';
    document.getElementById('paiementFilterDateEnd').value = '';
    displayPaiements();
}