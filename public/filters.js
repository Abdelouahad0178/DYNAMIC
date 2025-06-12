// Système de filtrage avancé pour toutes les tables
class TableFilter {
    constructor(tableId, data, displayFunction) {
        this.tableId = tableId;
        this.originalData = data;
        this.filteredData = [...data];
        this.displayFunction = displayFunction;
        this.isUpdating = false; // Protection contre la récursion
        this.filters = {
            search: '',
            dateFrom: '',
            dateTo: '',
            status: '',
            type: ''
        };
        
        this.initializeFilters();
    }

    initializeFilters() {
        this.createFilterHTML();
        this.bindFilterEvents();
    }

    createFilterHTML() {
        const table = document.getElementById(this.tableId);
        const container = table.closest('.table-container');
        
        // Vérifier si la barre de filtres existe déjà
        if (container.querySelector('.filter-bar')) {
            return;
        }
        
        // Créer la barre de filtres
        const filterBar = document.createElement('div');
        filterBar.className = 'filter-bar';
        filterBar.innerHTML = `
            <div class="filter-row">
                <div class="filter-group">
                    <label>🔍 Recherche</label>
                    <input type="text" class="filter-search" placeholder="Nom, référence, client...">
                </div>
                <div class="filter-group">
                    <label>📅 Date début</label>
                    <input type="date" class="filter-date-from">
                </div>
                <div class="filter-group">
                    <label>📅 Date fin</label>
                    <input type="date" class="filter-date-to">
                </div>
                <div class="filter-group" id="statusFilter-${this.tableId}" style="display: none;">
                    <label>📊 Statut</label>
                    <select class="filter-status">
                        <option value="">Tous les statuts</option>
                        <option value="en-cours">En cours</option>
                        <option value="valide">Validé</option>
                        <option value="paye">Payé</option>
                    </select>
                </div>
                <div class="filter-group" id="typeFilter-${this.tableId}" style="display: none;">
                    <label>📄 Type</label>
                    <select class="filter-type">
                        <option value="">Tous les types</option>
                        <option value="devis">Devis</option>
                        <option value="facture">Facture</option>
                        <option value="proforma">Proforma</option>
                    </select>
                </div>
                <div class="filter-actions">
                    <button type="button" class="btn btn-info btn-small filter-apply">
                        <i class="fas fa-filter"></i> Filtrer
                    </button>
                    <button type="button" class="btn btn-secondary btn-small filter-reset">
                        <i class="fas fa-times"></i> Reset
                    </button>
                </div>
            </div>
            <div class="filter-stats">
                <span class="filter-count">0 résultats</span>
                <span class="filter-total">sur 0 total</span>
            </div>
        `;
        
        container.insertBefore(filterBar, container.querySelector('.table-wrapper'));
        
        // Afficher les filtres spécifiques selon la table
        this.showRelevantFilters();
    }

    showRelevantFilters() {
        const statusFilter = document.getElementById(`statusFilter-${this.tableId}`);
        const typeFilter = document.getElementById(`typeFilter-${this.tableId}`);
        
        // Afficher le filtre statut pour certaines tables
        if (['documentsTable', 'ventesTable', 'achatsTable', 'paiementsTable'].includes(this.tableId)) {
            statusFilter.style.display = 'block';
        }
        
        // Afficher le filtre type pour les documents
        if (this.tableId === 'documentsTable') {
            typeFilter.style.display = 'block';
        }
        
        // Filtre type pour paiements (entrée/sortie)
        if (this.tableId === 'paiementsTable') {
            const typeSelect = typeFilter.querySelector('.filter-type');
            typeSelect.innerHTML = `
                <option value="">Tous les types</option>
                <option value="entree">Entrée</option>
                <option value="sortie">Sortie</option>
            `;
            typeFilter.style.display = 'block';
        }
    }

    bindFilterEvents() {
        const container = document.getElementById(this.tableId).closest('.table-container');
        const searchInput = container.querySelector('.filter-search');
        const dateFromInput = container.querySelector('.filter-date-from');
        const dateToInput = container.querySelector('.filter-date-to');
        const statusSelect = container.querySelector('.filter-status');
        const typeSelect = container.querySelector('.filter-type');
        const applyBtn = container.querySelector('.filter-apply');
        const resetBtn = container.querySelector('.filter-reset');

        // Recherche en temps réel
        searchInput.addEventListener('input', () => {
            this.filters.search = searchInput.value.toLowerCase();
            this.applyFilters();
        });

        // Filtres de date
        dateFromInput.addEventListener('change', () => {
            this.filters.dateFrom = dateFromInput.value;
            this.applyFilters();
        });

        dateToInput.addEventListener('change', () => {
            this.filters.dateTo = dateToInput.value;
            this.applyFilters();
        });

        // Filtre statut
        if (statusSelect) {
            statusSelect.addEventListener('change', () => {
                this.filters.status = statusSelect.value;
                this.applyFilters();
            });
        }

        // Filtre type
        if (typeSelect) {
            typeSelect.addEventListener('change', () => {
                this.filters.type = typeSelect.value;
                this.applyFilters();
            });
        }

        // Bouton Reset
        resetBtn.addEventListener('click', () => {
            this.resetFilters();
        });
    }

    applyFilters() {
        // Protection contre la récursion
        if (this.isUpdating) {
            return;
        }

        this.filteredData = this.originalData.filter(item => {
            // Filtre de recherche textuelle
            if (this.filters.search) {
                const searchFields = this.getSearchFields(item);
                const searchMatch = searchFields.some(field => 
                    field && field.toString().toLowerCase().includes(this.filters.search)
                );
                if (!searchMatch) return false;
            }

            // Filtre de date
            if (this.filters.dateFrom || this.filters.dateTo) {
                const itemDate = this.getItemDate(item);
                if (itemDate) {
                    if (this.filters.dateFrom && itemDate < this.filters.dateFrom) return false;
                    if (this.filters.dateTo && itemDate > this.filters.dateTo) return false;
                } else {
                    return false;
                }
            }

            // Filtre statut
            if (this.filters.status && item.statut !== this.filters.status) {
                return false;
            }

            // Filtre type
            if (this.filters.type && item.type !== this.filters.type) {
                return false;
            }

            return true;
        });

        this.updateDisplay();
        this.updateStats();
    }

    getSearchFields(item) {
        // Retourner les champs à rechercher selon le type de table
        switch (this.tableId) {
            case 'clientsTable':
                return [item.name, item.email, item.phone, item.address];
            case 'articlesTable':
                return [item.reference, item.designation];
            case 'documentsTable':
                return [item.number, item.client?.name, item.type];
            case 'ventesTable':
                return [item.clientName, item.documentNumber];
            case 'achatsTable':
                return [item.fournisseur, item.article?.designation, item.article?.reference];
            case 'paiementsTable':
                return [item.fournisseur, item.client, item.description, item.reference];
            default:
                return [];
        }
    }

    getItemDate(item) {
        // Retourner la date de l'item selon le type
        const date = item.date || item.createdAt;
        if (!date) return null;
        
        // Protection contre les objets cycliques
        try {
            if (date instanceof Date) {
                return date.toISOString().split('T')[0];
            }
            
            if (typeof date === 'string') {
                return date.split('T')[0];
            }
            
            if (date.toDate && typeof date.toDate === 'function') {
                return date.toDate().toISOString().split('T')[0];
            }
        } catch (error) {
            console.warn('Erreur lors du traitement de la date:', error);
        }
        
        return null;
    }

    updateDisplay() {
        // Protection contre la récursion
        if (this.isUpdating) {
            return;
        }

        this.isUpdating = true;
        
        try {
            // Afficher directement dans le tableau sans modifier les variables globales
            this.renderFilteredData();
        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'affichage:', error);
        } finally {
            this.isUpdating = false;
        }
    }

    renderFilteredData() {
        const tbody = document.querySelector(`#${this.tableId} tbody`);
        if (!tbody) return;

        tbody.innerHTML = '';
        
        this.filteredData.forEach(item => {
            const row = tbody.insertRow();
            row.innerHTML = this.generateRowHTML(item);
        });
    }

    generateRowHTML(item) {
        switch (this.tableId) {
            case 'clientsTable':
                return `
                    <td>${item.name}</td>
                    <td>${item.email || '-'}</td>
                    <td>${item.phone || '-'}</td>
                    <td>${item.address || '-'}</td>
                    <td>
                        <button class="btn btn-info btn-small" onclick="editClient('${item.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-small" onclick="deleteClient('${item.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
            case 'articlesTable':
                return `
                    <td>${item.reference}</td>
                    <td>${item.designation}</td>
                    <td>${item.price.toFixed(2)} MAD HT</td>
                    <td>${item.stock}</td>
                    <td>
                        <button class="btn btn-info btn-small" onclick="editArticle('${item.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-small" onclick="deleteArticle('${item.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
            case 'documentsTable':
                return `
                    <td>${item.number}</td>
                    <td>${item.type.toUpperCase()}</td>
                    <td>${item.client ? item.client.name : 'N/A'}</td>
                    <td>${new Date(item.date).toLocaleDateString('fr-FR')}</td>
                    <td>
                        <div style="font-size: 0.9em;">
                            <div>HT: ${(item.subtotal || item.total / 1.2).toFixed(2)} MAD</div>
                            <div><strong>TTC: ${item.total.toFixed(2)} MAD</strong></div>
                        </div>
                    </td>
                    <td><span class="status-badge ${item.status}">${item.status}</span></td>
                    <td>
                        <button class="btn btn-info btn-small" onclick="previewDocument('${item.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-primary btn-small" onclick="printDocument('${item.id}')">
                            <i class="fas fa-print"></i>
                        </button>
                        <button class="btn btn-danger btn-small" onclick="deleteDocument('${item.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
            case 'ventesTable':
                return `
                    <td>${new Date(item.date).toLocaleDateString('fr-FR')}</td>
                    <td>${item.clientName}</td>
                    <td>
                        <div style="font-size: 0.9em;">
                            <div>HT: ${(item.subtotal || item.total / 1.2).toFixed(2)} MAD</div>
                            <div><strong>TTC: ${item.total.toFixed(2)} MAD</strong></div>
                        </div>
                    </td>
                    <td>${item.modePaiement || 'Facture'}</td>
                    <td><span class="status-badge ${item.statut}">${item.statut}</span></td>
                    <td>
                        <button class="btn btn-info btn-small" onclick="viewVenteDetails('${item.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-success btn-small" onclick="markVentePaid('${item.id}')">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn btn-primary btn-small" onclick="createPaymentFromVente('${item.id}')">
                            <i class="fas fa-money-bill"></i>
                        </button>
                    </td>
                `;
            case 'achatsTable':
                return `
                    <td>${new Date(item.date).toLocaleDateString('fr-FR')}</td>
                    <td>${item.fournisseur}</td>
                    <td>${item.article.reference} - ${item.article.designation}</td>
                    <td>${item.quantity}</td>
                    <td>
                        <div style="font-size: 0.9em;">
                            <div>HT: ${item.subtotal.toFixed(2)} MAD</div>
                            <div><strong>TTC: ${item.total.toFixed(2)} MAD</strong></div>
                        </div>
                    </td>
                    <td><span class="status-badge ${item.statut}">${item.statut}</span></td>
                    <td>
                        <button class="btn btn-info btn-small" onclick="viewAchatDetails('${item.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-danger btn-small" onclick="deleteAchat('${item.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
            case 'paiementsTable':
                const typeLabel = item.type === 'entree' ? 'Entrée' : 'Sortie';
                const typeClass = item.type === 'entree' ? 'success' : 'danger';
                return `
                    <td>${new Date(item.date).toLocaleDateString('fr-FR')}</td>
                    <td><span class="status-badge ${typeClass}">${typeLabel}</span></td>
                    <td>${item.fournisseur || item.client || item.description}</td>
                    <td>${item.montant.toFixed(2)} MAD</td>
                    <td>${item.modePaiement || '-'}</td>
                    <td><span class="status-badge ${item.statut}">${item.statut}</span></td>
                `;
            default:
                return '';
        }
    }

    updateStats() {
        const container = document.getElementById(this.tableId).closest('.table-container');
        const countElement = container.querySelector('.filter-count');
        const totalElement = container.querySelector('.filter-total');
        
        if (countElement && totalElement) {
            countElement.textContent = `${this.filteredData.length} résultat${this.filteredData.length > 1 ? 's' : ''}`;
            totalElement.textContent = `sur ${this.originalData.length} total`;
        }
    }

    resetFilters() {
        const container = document.getElementById(this.tableId).closest('.table-container');
        
        // Reset tous les champs
        container.querySelector('.filter-search').value = '';
        container.querySelector('.filter-date-from').value = '';
        container.querySelector('.filter-date-to').value = '';
        
        const statusSelect = container.querySelector('.filter-status');
        const typeSelect = container.querySelector('.filter-type');
        
        if (statusSelect) statusSelect.value = '';
        if (typeSelect) typeSelect.value = '';

        // Reset les filtres
        this.filters = {
            search: '',
            dateFrom: '',
            dateTo: '',
            status: '',
            type: ''
        };

        this.filteredData = [...this.originalData];
        this.updateDisplay();
        this.updateStats();
    }

    updateData(newData) {
        // Protection contre la récursion
        if (this.isUpdating) {
            return;
        }

        this.originalData = newData;
        this.applyFilters(); // Réappliquer les filtres existants
    }
}

// Manager global des filtres
class FilterManager {
    constructor() {
        this.filters = {};
    }

    createFilter(tableId, data, displayFunction) {
        this.filters[tableId] = new TableFilter(tableId, data, displayFunction);
        return this.filters[tableId];
    }

    updateFilter(tableId, newData) {
        if (this.filters[tableId]) {
            this.filters[tableId].updateData(newData);
        }
    }

    getFilter(tableId) {
        return this.filters[tableId];
    }
}

// Instance globale du gestionnaire de filtres
window.filterManager = new FilterManager();

// Fonctions utilitaires pour l'export/import
function exportFilteredData(tableId) {
    const filter = window.filterManager.getFilter(tableId);
    if (!filter) return;

    const data = filter.filteredData;
    const filename = `${tableId}_filtered_${new Date().toISOString().split('T')[0]}.json`;
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    
    URL.revokeObjectURL(url);
}

// Fonction pour exporter en CSV
function exportToCSV(tableId) {
    const filter = window.filterManager.getFilter(tableId);
    if (!filter) return;

    const data = filter.filteredData;
    if (data.length === 0) {
        showNotification('Aucune donnée à exporter', 'error');
        return;
    }

    // Obtenir les en-têtes selon le type de table
    const headers = getCSVHeaders(tableId);
    const rows = data.map(item => getCSVRow(item, tableId));
    
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tableId}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    URL.revokeObjectURL(url);
}

function getCSVHeaders(tableId) {
    const headerMap = {
        'clientsTable': ['Nom', 'Email', 'Téléphone', 'Adresse'],
        'articlesTable': ['Référence', 'Désignation', 'Prix', 'Stock'],
        'documentsTable': ['Numéro', 'Type', 'Client', 'Date', 'Montant', 'Statut'],
        'ventesTable': ['Date', 'Client', 'Montant', 'Mode Paiement', 'Statut'],
        'achatsTable': ['Date', 'Fournisseur', 'Article', 'Quantité', 'Montant', 'Statut'],
        'paiementsTable': ['Date', 'Type', 'Destinataire', 'Montant', 'Mode', 'Statut']
    };
    return headerMap[tableId] || [];
}

function getCSVRow(item, tableId) {
    switch (tableId) {
        case 'clientsTable':
            return [item.name, item.email || '', item.phone || '', item.address || ''];
        case 'articlesTable':
            return [item.reference, item.designation, item.price, item.stock];
        case 'documentsTable':
            return [item.number, item.type, item.client?.name || '', item.date, item.total, item.status];
        case 'ventesTable':
            return [item.date, item.clientName, item.total, item.modePaiement || '', item.statut];
        case 'achatsTable':
            return [item.date, item.fournisseur, item.article?.designation || '', item.quantity, item.total, item.statut];
        case 'paiementsTable':
            return [item.date, item.type, item.fournisseur || item.client || '', item.montant, item.modePaiement || '', item.statut];
        default:
            return [];
    }
}

// Fonction pour ajouter les boutons d'export
function addExportButtons(tableId) {
    const container = document.getElementById(tableId).closest('.table-container');
    const filterBar = container.querySelector('.filter-bar');
    
    if (!filterBar) return;
    
    const exportButtons = document.createElement('div');
    exportButtons.className = 'export-buttons';
    exportButtons.innerHTML = `
        <button type="button" class="btn btn-success btn-small" onclick="exportToCSV('${tableId}')">
            <i class="fas fa-file-csv"></i> CSV
        </button>
        <button type="button" class="btn btn-info btn-small" onclick="exportFilteredData('${tableId}')">
            <i class="fas fa-download"></i> JSON
        </button>
    `;
    
    filterBar.querySelector('.filter-actions').appendChild(exportButtons);
}

console.log('Système de filtrage avancé initialisé ✅');