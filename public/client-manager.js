// client-manager.js - Gestion des clients

function showClientModal() {
    showModal('clientModal');
}

// Client management functions
async function handleClientSubmit(e) {
    e.preventDefault();
    
    const clientData = {
        name: document.getElementById('clientName').value,
        email: document.getElementById('clientEmail').value,
        phone: document.getElementById('clientPhone').value,
        address: document.getElementById('clientAddress').value,
        createdAt: new Date()
    };

    try {
        const docRef = await db.collection('clients').add(clientData);
        clients.push({ id: docRef.id, ...clientData });
        displayClients();
        closeModal('clientModal');
        showNotification('Client ajouté avec succès', 'success');
    } catch (error) {
        console.error('Erreur ajout client:', error);
        showNotification('Erreur lors de l\'ajout du client', 'error');
    }
}

function displayClients() {
    displayFilteredClients(clients);
}

function displayFilteredClients(filteredClients) {
    const tbody = document.querySelector('#clientsTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    filteredClients.forEach(client => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${client.name}</td>
            <td>${client.email || '-'}</td>
            <td>${client.phone || '-'}</td>
            <td>${client.address || '-'}</td>
            <td>
                <button class="btn btn-info btn-small" onclick="editClient('${client.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-small" onclick="deleteClient('${client.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
    });
}

async function deleteClient(clientId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
        try {
            await db.collection('clients').doc(clientId).delete();
            clients = clients.filter(c => c.id !== clientId);
            displayClients();
            showNotification('Client supprimé avec succès', 'success');
        } catch (error) {
            console.error('Erreur suppression client:', error);
            showNotification('Erreur lors de la suppression', 'error');
        }
    }
}

function editClient(clientId) {
    console.log('Édition client:', clientId);
    showNotification('Fonctionnalité en développement', 'info');
}

// Client filtering
function filterClients() {
    const filterValue = document.getElementById('clientFilterName').value.toLowerCase();
    const filteredClients = clients.filter(client => 
        client.name.toLowerCase().includes(filterValue) ||
        (client.email && client.email.toLowerCase().includes(filterValue)) ||
        (client.phone && client.phone.includes(filterValue))
    );
    displayFilteredClients(filteredClients);
}