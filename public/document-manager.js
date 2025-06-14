// document-manager.js - Gestion des documents

function showDocumentModal(type) {
    currentDocumentType = type;
    const title = document.getElementById('documentModalTitle');
    if (title) {
        title.textContent = 
            type === 'devis' ? 'Nouveau Devis' :
            type === 'facture' ? 'Nouvelle Facture' : 'Facture Proforma';
    }
    
    populateClientSelect();
    populateArticleSelects();
    showModal('documentModal');
}

// Document management functions
function populateClientSelect() {
    const select = document.getElementById('documentClient');
    if (!select) return;
    
    select.innerHTML = '<option value="">Sélectionner un client</option>';
    
    clients.forEach(client => {
        const option = document.createElement('option');
        option.value = client.id;
        option.textContent = client.name;
        select.appendChild(option);
    });
}

function populateArticleSelects() {
    const selects = document.querySelectorAll('.item-article');
    selects.forEach(select => {
        select.innerHTML = '<option value="">Sélectionner un article</option>';
        articles.forEach(article => {
            const option = document.createElement('option');
            option.value = article.id;
            option.textContent = `${article.reference} - ${article.designation}`;
            option.dataset.price = article.price;
            select.appendChild(option);
        });
    });
}

function addItem() {
    const itemsList = document.getElementById('itemsList');
    if (!itemsList) return;
    
    const itemRow = document.createElement('div');
    itemRow.className = 'item-row';
    itemRow.innerHTML = `
        <select class="item-article" required></select>
        <input type="number" class="item-quantity" placeholder="Qté" min="1" required>
        <input type="number" class="item-price" placeholder="Prix" step="0.01" required>
        <button type="button" class="btn btn-danger btn-small" onclick="removeItem(this)">Supprimer</button>
    `;
    itemsList.appendChild(itemRow);
    
    const newSelect = itemRow.querySelector('.item-article');
    newSelect.innerHTML = '<option value="">Sélectionner un article</option>';
    articles.forEach(article => {
        const option = document.createElement('option');
        option.value = article.id;
        option.textContent = `${article.reference} - ${article.designation}`;
        option.dataset.price = article.price;
        newSelect.appendChild(option);
    });

    setupItemEventListeners(itemRow);
}

function removeItem(button) {
    button.parentElement.remove();
    calculateTotal();
}

function setupItemEventListeners(itemRow) {
    const articleSelect = itemRow.querySelector('.item-article');
    const quantityInput = itemRow.querySelector('.item-quantity');
    const priceInput = itemRow.querySelector('.item-price');

    if (articleSelect) {
        articleSelect.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            if (selectedOption.dataset.price) {
                priceInput.value = selectedOption.dataset.price;
                calculateTotal();
            }
        });
    }

    if (quantityInput) {
        quantityInput.addEventListener('input', calculateTotal);
    }
    
    if (priceInput) {
        priceInput.addEventListener('input', calculateTotal);
    }
}

function calculateTotal() {
    let subtotal = 0;
    const itemRows = document.querySelectorAll('.item-row');
    
    itemRows.forEach(row => {
        const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        subtotal += quantity * price;
    });
    
    const tva = subtotal * 0.20;
    const total = subtotal + tva;
    
    const totalElement = document.getElementById('documentTotal');
    if (totalElement) {
        totalElement.innerHTML = `
            <div style="text-align: right;">
                <div>Sous-total HT: ${subtotal.toFixed(2)} MAD</div>
                <div>TVA (20%): ${tva.toFixed(2)} MAD</div>
                <div style="font-weight: bold; border-top: 1px solid #ddd; padding-top: 0.5rem;">
                    Total TTC: ${total.toFixed(2)} MAD
                </div>
            </div>
        `;
    }
    
    return { subtotal, tva, total };
}

async function handleDocumentSubmit(e) {
    e.preventDefault();
    
    const clientId = document.getElementById('documentClient').value;
    const date = document.getElementById('documentDate').value;
    const items = [];
    
    document.querySelectorAll('.item-row').forEach(row => {
        const articleId = row.querySelector('.item-article').value;
        const quantity = parseInt(row.querySelector('.item-quantity').value);
        const price = parseFloat(row.querySelector('.item-price').value);
        
        if (articleId && quantity && price) {
            const article = articles.find(a => a.id === articleId);
            items.push({
                articleId,
                article,
                quantity,
                price,
                total: quantity * price
            });
        }
    });

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tva = subtotal * 0.20;
    const total = subtotal + tva;
    
    const documentData = {
        type: currentDocumentType,
        number: generateDocumentNumber(currentDocumentType),
        clientId,
        client: clients.find(c => c.id === clientId),
        date,
        items,
        subtotal,
        tva,
        total,
        status: 'en-cours',
        createdAt: new Date()
    };

    try {
        const docRef = await db.collection('documents').add(documentData);
        documents.push({ id: docRef.id, ...documentData });
        
        if (currentDocumentType === 'facture') {
            await createSaleFromInvoice(documentData);
        }
        
        displayDocuments();
        closeModal('documentModal');
        showNotification(`${currentDocumentType} créé avec succès`, 'success');
    } catch (error) {
        console.error('Erreur création document:', error);
        showNotification('Erreur lors de la création du document', 'error');
    }
}

function displayDocuments() {
    displayFilteredDocuments(documents);
}

function displayFilteredDocuments(filteredDocuments) {
    const tbody = document.querySelector('#documentsTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    filteredDocuments.forEach(doc => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${doc.number}</td>
            <td>${doc.type.toUpperCase()}</td>
            <td>${doc.client ? doc.client.name : 'N/A'}</td>
            <td>${new Date(doc.date).toLocaleDateString('fr-FR')}</td>
            <td>
                <div style="font-size: 0.9em;">
                    <div>HT: ${(doc.subtotal || doc.total / 1.2).toFixed(2)} MAD</div>
                    <div><strong>TTC: ${doc.total.toFixed(2)} MAD</strong></div>
                </div>
            </td>
            <td><span class="status-badge ${doc.status}">${doc.status}</span></td>
            <td>
                <button class="btn btn-info btn-small" onclick="previewDocument('${doc.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-primary btn-small" onclick="printDocument('${doc.id}')">
                    <i class="fas fa-print"></i>
                </button>
                <button class="btn btn-danger btn-small" onclick="deleteDocument('${doc.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
    });
}

async function deleteDocument(documentId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
        try {
            await db.collection('documents').doc(documentId).delete();
            documents = documents.filter(d => d.id !== documentId);
            displayDocuments();
            showNotification('Document supprimé avec succès', 'success');
        } catch (error) {
            console.error('Erreur suppression document:', error);
            showNotification('Erreur lors de la suppression', 'error');
        }
    }
}

// Document filtering
function filterDocuments() {
    const nameFilter = document.getElementById('documentFilterName').value.toLowerCase();
    const startDate = document.getElementById('documentFilterDateStart').value;
    const endDate = document.getElementById('documentFilterDateEnd').value;
    
    let filteredDocuments = documents;
    
    if (nameFilter) {
        filteredDocuments = filteredDocuments.filter(doc => 
            doc.client && doc.client.name.toLowerCase().includes(nameFilter)
        );
    }
    
    if (startDate) {
        filteredDocuments = filteredDocuments.filter(doc => 
            new Date(doc.date) >= new Date(startDate)
        );
    }
    
    if (endDate) {
        filteredDocuments = filteredDocuments.filter(doc => 
            new Date(doc.date) <= new Date(endDate)
        );
    }
    
    displayFilteredDocuments(filteredDocuments);
}

function resetDocumentFilters() {
    document.getElementById('documentFilterName').value = '';
    document.getElementById('documentFilterDateStart').value = '';
    document.getElementById('documentFilterDateEnd').value = '';
    displayDocuments();
}