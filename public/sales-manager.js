// sales-manager.js - Gestion des ventes

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

function displayVentes() {
    displayFilteredVentes(ventes);
}

function displayFilteredVentes(filteredVentes) {
    const tbody = document.querySelector('#ventesTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    filteredVentes.forEach(vente => {
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

function viewVenteDetails(venteId) {
    const vente = ventes.find(v => v.id === venteId);
    if (vente) {
        let itemsText = vente.items.map(item => 
            `- ${item.article.designation}: ${item.quantity} x ${item.price.toFixed(2)} `
        ).join('\n');
        
        alert(`Détails de la vente:
Client: ${vente.clientName}
Document: ${vente.documentNumber || 'Vente directe'}
Articles:
${itemsText}
Total TTC: ${vente.total.toFixed(2)} 
Statut: ${vente.statut}`);
    }
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

// Vente filtering
function filterVentes() {
    const nameFilter = document.getElementById('venteFilterName').value.toLowerCase();
    const startDate = document.getElementById('venteFilterDateStart').value;
    const endDate = document.getElementById('venteFilterDateEnd').value;
    
    let filteredVentes = ventes;
    
    if (nameFilter) {
        filteredVentes = filteredVentes.filter(vente => 
            vente.clientName.toLowerCase().includes(nameFilter)
        );
    }
    
    if (startDate) {
        filteredVentes = filteredVentes.filter(vente => 
            new Date(vente.date) >= new Date(startDate)
        );
    }
    
    if (endDate) {
        filteredVentes = filteredVentes.filter(vente => 
            new Date(vente.date) <= new Date(endDate)
        );
    }
    
    displayFilteredVentes(filteredVentes);
}

function resetVenteFilters() {
    document.getElementById('venteFilterName').value = '';
    document.getElementById('venteFilterDateStart').value = '';
    document.getElementById('venteFilterDateEnd').value = '';
    displayVentes();
}