// purchase-manager.js - Gestion des achats

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
            <div>Sous-total HT: ${subtotal.toFixed(2)} </div>
            <div>TVA (20%): ${tva.toFixed(2)} </div>
            <div style="font-weight: bold; color: #2d3748;">Total TTC: ${total.toFixed(2)} </div>
        `;
    }
    
    quantityInput.addEventListener('input', calculateAchatTotal);
    priceInput.addEventListener('input', calculateAchatTotal);
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

function displayAchats() {
    displayFilteredAchats(achats);
}

function displayFilteredAchats(filteredAchats) {
    const tbody = document.querySelector('#achatsTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    filteredAchats.forEach(achat => {
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

function viewAchatDetails(achatId) {
    const achat = achats.find(a => a.id === achatId);
    if (achat) {
        alert(`Détails de l'achat:
Fournisseur: ${achat.fournisseur}
Article: ${achat.article.designation}
Quantité: ${achat.quantity}
Prix unitaire HT: ${achat.prixUnitaire.toFixed(2)} 
Total TTC: ${achat.total.toFixed(2)} 
Mode de paiement: ${achat.modePaiement}
Statut: ${achat.statut}`);
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

// Achat filtering
function filterAchats() {
    const nameFilter = document.getElementById('achatFilterName').value.toLowerCase();
    const startDate = document.getElementById('achatFilterDateStart').value;
    const endDate = document.getElementById('achatFilterDateEnd').value;
    
    let filteredAchats = achats;
    
    if (nameFilter) {
        filteredAchats = filteredAchats.filter(achat => 
            achat.fournisseur.toLowerCase().includes(nameFilter) ||
            achat.article.designation.toLowerCase().includes(nameFilter)
        );
    }
    
    if (startDate) {
        filteredAchats = filteredAchats.filter(achat => 
            new Date(achat.date) >= new Date(startDate)
        );
    }
    
    if (endDate) {
        filteredAchats = filteredAchats.filter(achat => 
            new Date(achat.date) <= new Date(endDate)
        );
    }
    
    displayFilteredAchats(filteredAchats);
}

function resetAchatFilters() {
    document.getElementById('achatFilterName').value = '';
    document.getElementById('achatFilterDateStart').value = '';
    document.getElementById('achatFilterDateEnd').value = '';
    displayAchats();
}