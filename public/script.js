// Configuration Firebase
const firebaseConfig = {
    // Remplacez par votre configuration Firebase
     apiKey: "AIzaSyDbLE9Disc3x-5jjyjlyhfLC-stJO9Oq68",
  authDomain: "dynamicfr.firebaseapp.com",
  projectId: "dynamicfr",
  storageBucket: "dynamicfr.firebasestorage.app",
  messagingSenderId: "669407854261",
  appId: "1:669407854261:web:c4abdc9341ae9d532908fc",
  measurementId: "G-SCMB28SN1B"
};

// Initialisation Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

// Variables globales
let clients = [];
let articles = [];
let documents = [];
let ventes = [];
let achats = [];
let paiements = [];
let companySettings = {
    name: "DYNAMIQUE FROID SYSTEMES",
    address: "10 RUE CHRARDA RDC DERB LOUBILA BOURGONE CENTRE D'AFFAIRE SOCOJUFI CASABLANCA MAROC",
    phone: "",
    email: "",
    logoUrl: "",
    cachetUrl: ""
};

// Variables pour le document en cours
let currentDocumentType = 'devis';
let documentCounter = {
    devis: 1,
    facture: 1,
    proforma: 1
};

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadData();
});

// Configuration des écouteurs d'événements avec support tactile
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const section = e.target.dataset.section;
            showSection(section);
        });
    });

    // Formulaires
    document.getElementById('clientForm').addEventListener('submit', handleClientSubmit);
    document.getElementById('articleForm').addEventListener('submit', handleArticleSubmit);
    document.getElementById('documentForm').addEventListener('submit', handleDocumentSubmit);
    document.getElementById('achatForm').addEventListener('submit', handleAchatSubmit);
    document.getElementById('companyForm').addEventListener('submit', handleCompanySubmit);

    // Gestion des modals
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    // Date par défaut pour les documents
    document.getElementById('documentDate').value = new Date().toISOString().split('T')[0];
    
    // Configuration du défilement horizontal pour navigation
    setupHorizontalScrolling();
    
    // Configuration du défilement des tables
    setupTableScrolling();
    
    // Support tactile pour mobile
    setupTouchSupport();
}

// Défilement horizontal intelligent pour la navigation
function setupHorizontalScrolling() {
    const navMenu = document.querySelector('.nav-menu');
    let isScrolling = false;
    
    // Défilement avec les boutons de navigation si nécessaire
    const buttons = document.querySelectorAll('.nav-btn');
    
    buttons.forEach((button, index) => {
        button.addEventListener('click', () => {
            // Centrer le bouton actif sur mobile
            if (window.innerWidth < 768) {
                const buttonRect = button.getBoundingClientRect();
                const menuRect = navMenu.getBoundingClientRect();
                const scrollLeft = button.offsetLeft - (menuRect.width / 2) + (buttonRect.width / 2);
                
                navMenu.scrollTo({
                    left: scrollLeft,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Défilement au swipe sur mobile
    let startX = 0;
    let scrollLeft = 0;
    
    navMenu.addEventListener('touchstart', (e) => {
        startX = e.touches[0].pageX - navMenu.offsetLeft;
        scrollLeft = navMenu.scrollLeft;
    });
    
    navMenu.addEventListener('touchmove', (e) => {
        if (!startX) return;
        e.preventDefault();
        const x = e.touches[0].pageX - navMenu.offsetLeft;
        const walk = (x - startX) * 2;
        navMenu.scrollLeft = scrollLeft - walk;
    });
    
    navMenu.addEventListener('touchend', () => {
        startX = 0;
    });
}

// Configuration du défilement des tables
function setupTableScrolling() {
    const tableWrappers = document.querySelectorAll('.table-wrapper');
    
    tableWrappers.forEach(wrapper => {
        // Défilement tactile amélioré
        let startX = 0;
        let scrollLeft = 0;
        let isScrolling = false;
        
        wrapper.addEventListener('touchstart', (e) => {
            startX = e.touches[0].pageX - wrapper.offsetLeft;
            scrollLeft = wrapper.scrollLeft;
            isScrolling = true;
        });
        
        wrapper.addEventListener('touchmove', (e) => {
            if (!isScrolling) return;
            e.preventDefault();
            const x = e.touches[0].pageX - wrapper.offsetLeft;
            const walk = (x - startX) * 1.5;
            wrapper.scrollLeft = scrollLeft - walk;
        });
        
        wrapper.addEventListener('touchend', () => {
            isScrolling = false;
        });
        
        // Indicateurs de défilement visuels
        wrapper.addEventListener('scroll', () => {
            updateScrollIndicators(wrapper);
        });
        
        // Défilement avec les flèches du clavier
        wrapper.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                wrapper.scrollLeft -= 100;
                e.preventDefault();
            } else if (e.key === 'ArrowRight') {
                wrapper.scrollLeft += 100;
                e.preventDefault();
            }
        });
    });
}

// Mise à jour des indicateurs de défilement
function updateScrollIndicators(wrapper) {
    const container = wrapper.closest('.table-container');
    const { scrollLeft, scrollWidth, clientWidth } = wrapper;
    
    // Masquer/afficher les indicateurs de début et fin
    if (scrollLeft <= 0) {
        container.classList.add('scroll-start');
    } else {
        container.classList.remove('scroll-start');
    }
    
    if (scrollLeft >= scrollWidth - clientWidth - 1) {
        container.classList.add('scroll-end');
    } else {
        container.classList.remove('scroll-end');
    }
}

// Support tactile général
function setupTouchSupport() {
    // Améliorer les interactions tactiles pour tous les boutons
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('touchstart', () => {
            button.style.transform = 'scale(0.95)';
        });
        
        button.addEventListener('touchend', () => {
            setTimeout(() => {
                button.style.transform = '';
            }, 150);
        });
    });
    
    // Gestion du viewport pour éviter le zoom sur les inputs
    const viewport = document.querySelector('meta[name=viewport]');
    if (!viewport) {
        const meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        document.head.appendChild(meta);
    }
    
    // Empêcher le zoom sur double-tap pour certains éléments
    const preventZoom = document.querySelectorAll('.nav-btn, .btn, .stat-card');
    preventZoom.forEach(element => {
        element.addEventListener('touchend', (e) => {
            e.preventDefault();
        });
    });
}

// Navigation améliorée avec détection d'écran
function showSection(sectionName) {
    // Masquer toutes les sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Désactiver tous les boutons de navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Afficher la section demandée
    document.getElementById(sectionName).classList.add('active');
    
    // Activer le bouton correspondant
    const activeBtn = document.querySelector(`[data-section="${sectionName}"]`);
    activeBtn.classList.add('active');
    
    // Centrer le bouton actif sur mobile
    if (window.innerWidth < 768) {
        const navMenu = document.querySelector('.nav-menu');
        const buttonRect = activeBtn.getBoundingClientRect();
        const menuRect = navMenu.getBoundingClientRect();
        const scrollLeft = activeBtn.offsetLeft - (menuRect.width / 2) + (buttonRect.width / 2);
        
        navMenu.scrollTo({
            left: scrollLeft,
            behavior: 'smooth'
        });
    }
    
    // Rafraîchir les données si nécessaire
    if (sectionName === 'dashboard') {
        updateDashboard();
    }
    
    // Scroll vers le haut de la section
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Détection de l'orientation pour optimiser l'affichage
function handleOrientationChange() {
    setTimeout(() => {
        // Recalculer les dimensions des tables
        const tableWrappers = document.querySelectorAll('.table-wrapper');
        tableWrappers.forEach(wrapper => {
            updateScrollIndicators(wrapper);
        });
        
        // Ajuster la navigation si nécessaire
        const activeBtn = document.querySelector('.nav-btn.active');
        if (activeBtn && window.innerWidth < 768) {
            const navMenu = document.querySelector('.nav-menu');
            const buttonRect = activeBtn.getBoundingClientRect();
            const menuRect = navMenu.getBoundingClientRect();
            const scrollLeft = activeBtn.offsetLeft - (menuRect.width / 2) + (buttonRect.width / 2);
            
            navMenu.scrollTo({
                left: scrollLeft,
                behavior: 'smooth'
            });
        }
    }, 100);
}

// Gestion responsive des modals
function adjustModalForMobile() {
    const modals = document.querySelectorAll('.modal-content');
    
    modals.forEach(modal => {
        if (window.innerWidth < 768) {
            modal.style.margin = '5% auto';
            modal.style.width = '95%';
            modal.style.maxHeight = '90vh';
        } else {
            modal.style.margin = '5% auto';
            modal.style.width = '90%';
            modal.style.maxHeight = '95vh';
        }
    });
}

// Optimisation des performances pour mobile
function optimizeForMobile() {
    if (window.innerWidth < 768) {
        // Réduire les animations sur mobile pour les performances
        document.body.classList.add('mobile-optimized');
        
        // Lazy loading pour les images si présentes
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (img.loading !== 'lazy') {
                img.loading = 'lazy';
            }
        });
    } else {
        document.body.classList.remove('mobile-optimized');
    }
}

// Ajout des écouteurs d'événements pour l'orientation et le redimensionnement
window.addEventListener('orientationchange', handleOrientationChange);
window.addEventListener('resize', () => {
    handleOrientationChange();
    adjustModalForMobile();
    optimizeForMobile();
});

// Initialisation mobile au chargement
document.addEventListener('DOMContentLoaded', () => {
    adjustModalForMobile();
    optimizeForMobile();
});

// Navigation entre sections (supprimée car remplacée par la version responsive ci-dessus)

// Gestion des modals
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    // Réinitialiser les formulaires
    const forms = document.getElementById(modalId).querySelectorAll('form');
    forms.forEach(form => form.reset());
}

function showClientModal() {
    showModal('clientModal');
}

function showArticleModal() {
    showModal('articleModal');
}

function showDocumentModal(type) {
    currentDocumentType = type;
    document.getElementById('documentModalTitle').textContent = 
        type === 'devis' ? 'Nouveau Devis' :
        type === 'facture' ? 'Nouvelle Facture' : 'Facture Proforma';
    
    populateClientSelect();
    populateArticleSelects();
    showModal('documentModal');
}

function showAchatModal() {
    // Populer la liste des articles
    const select = document.getElementById('achatArticle');
    select.innerHTML = '<option value="">Sélectionner un article</option>';
    
    articles.forEach(article => {
        const option = document.createElement('option');
        option.value = article.id;
        option.textContent = `${article.reference} - ${article.designation}`;
        select.appendChild(option);
    });
    
    // Date du jour par défaut
    document.getElementById('achatDate').value = new Date().toISOString().split('T')[0];
    
    // Écouteurs pour calcul automatique
    setupAchatCalculation();
    
    showModal('achatModal');
}

function setupAchatCalculation() {
    const quantityInput = document.getElementById('achatQuantity');
    const priceInput = document.getElementById('achatPrixUnitaire');
    const totalDisplay = document.getElementById('achatTotalDisplay');
    
    function calculateAchatTotal() {
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
    
    quantityInput.addEventListener('input', calculateAchatTotal);
    priceInput.addEventListener('input', calculateAchatTotal);
}

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
        // Sauvegarder l'achat
        const docRef = await db.collection('achats').add(achatData);
        achats.push({ id: docRef.id, ...achatData });
        
        // Mettre à jour le stock de l'article
        const articleToUpdate = articles.find(a => a.id === articleId);
        if (articleToUpdate) {
            articleToUpdate.stock += quantity;
            await db.collection('articles').doc(articleId).update({
                stock: articleToUpdate.stock
            });
        }
        
        // Créer un paiement si ce n'est pas à crédit
        if (modePaiement !== 'credit') {
            await createPaiementFromAchat(achatData);
        }
        
        displayAchats();
        displayArticles(); // Rafraîchir pour le stock
        closeModal('achatModal');
        showNotification('Achat enregistré avec succès', 'success');
        updateDashboard();
        
    } catch (error) {
        console.error('Erreur enregistrement achat:', error);
        showNotification('Erreur lors de l\'enregistrement de l\'achat', 'error');
    }
}

// Chargement des données
async function loadData() {
    try {
        await Promise.all([
            loadClients(),
            loadArticles(),
            loadDocuments(),
            loadAchats(),
            loadVentes(),
            loadPaiements(),
            loadCompanySettings()
        ]);
        updateDashboard();
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
    }
}

async function loadClients() {
    try {
        const snapshot = await db.collection('clients').get();
        clients = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        displayClients();
    } catch (error) {
        console.error('Erreur chargement clients:', error);
    }
}

async function loadArticles() {
    try {
        const snapshot = await db.collection('articles').get();
        articles = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        displayArticles();
    } catch (error) {
        console.error('Erreur chargement articles:', error);
    }
}

async function loadDocuments() {
    try {
        const snapshot = await db.collection('documents').get();
        documents = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        displayDocuments();
    } catch (error) {
        console.error('Erreur chargement documents:', error);
    }
}

async function loadCompanySettings() {
    try {
        const doc = await db.collection('settings').doc('company').get();
        if (doc.exists) {
            companySettings = { ...companySettings, ...doc.data() };
            updateCompanyDisplay();
        }
    } catch (error) {
        console.error('Erreur chargement paramètres:', error);
    }
}

// Gestion des clients
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
    const tbody = document.querySelector('#clientsTable tbody');
    tbody.innerHTML = '';
    
    clients.forEach(client => {
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

// Gestion des articles
async function handleArticleSubmit(e) {
    e.preventDefault();
    
    const articleData = {
        reference: document.getElementById('articleRef').value,
        designation: document.getElementById('articleDesignation').value,
        price: parseFloat(document.getElementById('articlePrice').value),
        stock: parseInt(document.getElementById('articleStock').value),
        createdAt: new Date()
    };

    try {
        const docRef = await db.collection('articles').add(articleData);
        articles.push({ id: docRef.id, ...articleData });
        displayArticles();
        closeModal('articleModal');
        showNotification('Article ajouté avec succès', 'success');
    } catch (error) {
        console.error('Erreur ajout article:', error);
        showNotification('Erreur lors de l\'ajout de l\'article', 'error');
    }
}

function displayArticles() {
    const tbody = document.querySelector('#articlesTable tbody');
    tbody.innerHTML = '';
    
    articles.forEach(article => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${article.reference}</td>
            <td>${article.designation}</td>
            <td>${article.price.toFixed(2)} MAD</td>
            <td>${article.stock}</td>
            <td>
                <button class="btn btn-info btn-small" onclick="editArticle('${article.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-small" onclick="deleteArticle('${article.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
    });
}

async function deleteArticle(articleId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
        try {
            await db.collection('articles').doc(articleId).delete();
            articles = articles.filter(a => a.id !== articleId);
            displayArticles();
            showNotification('Article supprimé avec succès', 'success');
        } catch (error) {
            console.error('Erreur suppression article:', error);
            showNotification('Erreur lors de la suppression', 'error');
        }
    }
}

// Gestion des documents
function populateClientSelect() {
    const select = document.getElementById('documentClient');
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
    const itemRow = document.createElement('div');
    itemRow.className = 'item-row';
    itemRow.innerHTML = `
        <select class="item-article" required></select>
        <input type="number" class="item-quantity" placeholder="Qté" min="1" required>
        <input type="number" class="item-price" placeholder="Prix" step="0.01" required>
        <button type="button" class="btn btn-danger btn-small" onclick="removeItem(this)">Supprimer</button>
    `;
    itemsList.appendChild(itemRow);
    
    // Populer le nouveau select
    const newSelect = itemRow.querySelector('.item-article');
    newSelect.innerHTML = '<option value="">Sélectionner un article</option>';
    articles.forEach(article => {
        const option = document.createElement('option');
        option.value = article.id;
        option.textContent = `${article.reference} - ${article.designation}`;
        option.dataset.price = article.price;
        newSelect.appendChild(option);
    });

    // Ajouter les événements pour calcul automatique
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

    articleSelect.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        if (selectedOption.dataset.price) {
            priceInput.value = selectedOption.dataset.price;
            calculateTotal();
        }
    });

    quantityInput.addEventListener('input', calculateTotal);
    priceInput.addEventListener('input', calculateTotal);
}

function calculateTotal() {
    let subtotal = 0;
    const itemRows = document.querySelectorAll('.item-row');
    
    itemRows.forEach(row => {
        const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        subtotal += quantity * price;
    });
    
    const tva = subtotal * 0.20; // TVA 20%
    const total = subtotal + tva;
    
    // Mettre à jour l'affichage avec le détail
    const totalElement = document.getElementById('documentTotal');
    totalElement.innerHTML = `
        <div style="text-align: right;">
            <div>Sous-total HT: ${subtotal.toFixed(2)} MAD</div>
            <div>TVA (20%): ${tva.toFixed(2)} MAD</div>
            <div style="font-weight: bold; border-top: 1px solid #ddd; padding-top: 0.5rem;">
                Total TTC: ${total.toFixed(2)} MAD
            </div>
        </div>
    `;
    
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
                article: article,
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
        
        // Si c'est une facture, créer automatiquement une vente
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

function generateDocumentNumber(type) {
    const year = new Date().getFullYear();
    const number = documentCounter[type].toString().padStart(4, '0');
    documentCounter[type]++;
    
    const prefix = type === 'devis' ? 'DEV' : type === 'facture' ? 'FACT' : 'PROF';
    return `${prefix}-${year}-${number}`;
}

function displayDocuments() {
    const tbody = document.querySelector('#documentsTable tbody');
    tbody.innerHTML = '';
    
    documents.forEach(doc => {
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

// Aperçu et impression de documents
function previewDocument(documentId = null) {
    let doc;
    
    if (documentId) {
        doc = documents.find(d => d.id === documentId);
        
        // Compatibilité avec les anciens documents sans TVA
        if (doc && !doc.subtotal) {
            doc.subtotal = doc.total / 1.2; // Calculer le HT à partir du TTC
            doc.tva = doc.total - doc.subtotal;
        }
    } else {
        // Créer un aperçu temporaire pour le document en cours
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
                    article: article,
                    quantity,
                    price,
                    total: quantity * price
                });
            }
        });

        const subtotal = items.reduce((sum, item) => sum + item.total, 0);
        const tva = subtotal * 0.20;
        const total = subtotal + tva;
        
        doc = {
            type: currentDocumentType,
            number: generateDocumentNumber(currentDocumentType),
            clientId,
            client: clients.find(c => c.id === clientId),
            date,
            items,
            subtotal,
            tva,
            total
        };
    }

    if (!doc || !doc.client) {
        showNotification('Données de document incomplètes', 'error');
        return;
    }

    const previewContent = generateDocumentHTML(doc);
    document.getElementById('previewContent').innerHTML = previewContent;
    showModal('previewModal');
}

function generateDocumentHTML(doc) {
    const documentTitle = doc.type === 'devis' ? 'DEVIS' : 
                         doc.type === 'facture' ? 'FACTURE' : 'FACTURE PROFORMA';
    
    let itemsHTML = '';
    doc.items.forEach(item => {
        itemsHTML += `
            <tr>
                <td>${item.article.reference}</td>
                <td>${item.article.designation}</td>
                <td style="text-align: center;">${item.quantity}</td>
                <td style="text-align: right;">${item.price.toFixed(2)} MAD</td>
                <td style="text-align: right;">${item.total.toFixed(2)} MAD</td>
            </tr>
        `;
    });

    return `
        <div class="document-preview">
            <div class="document-header">
                <div class="company-info">
                    ${companySettings.logoUrl ? `<img src="${companySettings.logoUrl}" alt="Logo" class="company-logo">` : ''}
                    <h2>${companySettings.name}</h2>
                    <p>${companySettings.address}</p>
                    ${companySettings.phone ? `<p>Tél: ${companySettings.phone}</p>` : ''}
                    ${companySettings.email ? `<p>Email: ${companySettings.email}</p>` : ''}
                </div>
            </div>
            
            <div class="document-title">
                <h1>${documentTitle}</h1>
                <p>N° ${doc.number}</p>
            </div>
            
            <div class="document-details">
                <div>
                    <h3>Client:</h3>
                    <p><strong>${doc.client.name}</strong></p>
                    ${doc.client.address ? `<p>${doc.client.address}</p>` : ''}
                    ${doc.client.phone ? `<p>Tél: ${doc.client.phone}</p>` : ''}
                    ${doc.client.email ? `<p>Email: ${doc.client.email}</p>` : ''}
                </div>
                <div>
                    <h3>Date:</h3>
                    <p>${new Date(doc.date).toLocaleDateString('fr-FR')}</p>
                </div>
            </div>
            
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Référence</th>
                        <th>Désignation</th>
                        <th style="text-align: center;">Quantité</th>
                        <th style="text-align: right;">Prix Unitaire HT</th>
                        <th style="text-align: right;">Total HT</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHTML}
                </tbody>
                <tfoot>
                    <tr style="border-top: 2px solid #ddd;">
                        <td colspan="4" style="text-align: right; font-weight: bold;">Sous-total HT:</td>
                        <td style="text-align: right; font-weight: bold;">${doc.subtotal.toFixed(2)} MAD</td>
                    </tr>
                    <tr>
                        <td colspan="4" style="text-align: right; font-weight: bold;">TVA (20%):</td>
                        <td style="text-align: right; font-weight: bold;">${doc.tva.toFixed(2)} MAD</td>
                    </tr>
                    <tr style="background-color: #f8f9fa; font-size: 1.1em;">
                        <td colspan="4" style="text-align: right; font-weight: bold;">Total TTC:</td>
                        <td style="text-align: right; font-weight: bold; color: #2d3748;">${doc.total.toFixed(2)} MAD</td>
                    </tr>
                </tfoot>
            </table>
            
            <div class="document-footer">
                <div class="cachet-section">
                    ${companySettings.cachetUrl ? `<img src="${companySettings.cachetUrl}" alt="Cachet">` : ''}
                </div>
                <div class="total-section">
                    <h2>Net à payer: ${doc.total.toFixed(2)} MAD</h2>
                </div>
            </div>
        </div>
    `;
}

function printDocument(documentId = null) {
    if (documentId) {
        previewDocument(documentId);
    }
    
    setTimeout(() => {
        const printContent = document.getElementById('previewContent').innerHTML;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Document</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .document-preview { max-width: 800px; margin: 0 auto; }
                        .document-header { display: flex; justify-content: space-between; margin-bottom: 30px; }
                        .document-title { text-align: center; margin: 30px 0; }
                        .document-details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
                        .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        .items-table th, .items-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                        .items-table th { background-color: #f5f5f5; }
                        .document-footer { display: flex; justify-content: space-between; margin-top: 40px; }
                        .company-logo { max-height: 80px; }
                        .cachet-section img { max-height: 100px; }
                        @media print { .no-print { display: none; } }
                    </style>
                </head>
                <body>
                    ${printContent}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }, 500);
}

// Gestion des paramètres
async function handleCompanySubmit(e) {
    e.preventDefault();
    
    const companyData = {
        name: document.getElementById('companyName').value,
        address: document.getElementById('companyAddress').value,
        phone: document.getElementById('companyPhone').value,
        email: document.getElementById('companyEmail').value
    };

    try {
        await db.collection('settings').doc('company').set({
            ...companySettings,
            ...companyData
        });
        
        companySettings = { ...companySettings, ...companyData };
        updateCompanyDisplay();
        showNotification('Paramètres sauvegardés avec succès', 'success');
    } catch (error) {
        console.error('Erreur sauvegarde paramètres:', error);
        showNotification('Erreur lors de la sauvegarde', 'error');
    }
}

async function uploadLogo() {
    const fileInput = document.getElementById('logoUpload');
    const file = fileInput.files[0];
    
    if (!file) {
        showNotification('Veuillez sélectionner un fichier', 'error');
        return;
    }

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
        showNotification('Veuillez sélectionner un fichier image', 'error');
        return;
    }

    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('Le fichier est trop volumineux (max 5MB)', 'error');
        return;
    }

    try {
        showNotification('Upload en cours...', 'info');
        
        // Créer un nom unique pour éviter les conflits
        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop();
        const fileName = `logo_${timestamp}.${fileExtension}`;
        
        const storageRef = storage.ref(`images/${fileName}`);
        
        // Upload avec metadata
        const metadata = {
            contentType: file.type,
            customMetadata: {
                'uploadedBy': 'admin',
                'uploadDate': new Date().toISOString()
            }
        };
        
        const snapshot = await storageRef.put(file, metadata);
        const downloadURL = await snapshot.ref.getDownloadURL();
        
        // Sauvegarder dans Firestore
        companySettings.logoUrl = downloadURL;
        await db.collection('settings').doc('company').set(companySettings, { merge: true });
        
        updateCompanyDisplay();
        showNotification('Logo téléchargé avec succès', 'success');
        
        // Réinitialiser l'input
        fileInput.value = '';
        
    } catch (error) {
        console.error('Erreur upload logo:', error);
        
        if (error.code === 'storage/unauthorized') {
            showNotification('Erreur d\'autorisation. Vérifiez les règles Firebase Storage.', 'error');
        } else if (error.code === 'storage/retry-limit-exceeded') {
            showNotification('Connexion instable. Réessayez dans quelques minutes.', 'error');
        } else if (error.code === 'storage/invalid-format') {
            showNotification('Format de fichier non supporté.', 'error');
        } else {
            showNotification('Erreur lors du téléchargement: ' + error.message, 'error');
        }
    }
}

async function uploadCachet() {
    const fileInput = document.getElementById('cachetUpload');
    const file = fileInput.files[0];
    
    if (!file) {
        showNotification('Veuillez sélectionner un fichier', 'error');
        return;
    }

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
        showNotification('Veuillez sélectionner un fichier image', 'error');
        return;
    }

    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('Le fichier est trop volumineux (max 5MB)', 'error');
        return;
    }

    try {
        showNotification('Upload en cours...', 'info');
        
        // Créer un nom unique pour éviter les conflits
        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop();
        const fileName = `cachet_${timestamp}.${fileExtension}`;
        
        const storageRef = storage.ref(`images/${fileName}`);
        
        // Upload avec metadata
        const metadata = {
            contentType: file.type,
            customMetadata: {
                'uploadedBy': 'admin',
                'uploadDate': new Date().toISOString()
            }
        };
        
        const snapshot = await storageRef.put(file, metadata);
        const downloadURL = await snapshot.ref.getDownloadURL();
        
        // Sauvegarder dans Firestore
        companySettings.cachetUrl = downloadURL;
        await db.collection('settings').doc('company').set(companySettings, { merge: true });
        
        showNotification('Cachet téléchargé avec succès', 'success');
        
        // Réinitialiser l'input
        fileInput.value = '';
        
    } catch (error) {
        console.error('Erreur upload cachet:', error);
        
        if (error.code === 'storage/unauthorized') {
            showNotification('Erreur d\'autorisation. Vérifiez les règles Firebase Storage.', 'error');
        } else if (error.code === 'storage/retry-limit-exceeded') {
            showNotification('Connexion instable. Réessayez dans quelques minutes.', 'error');
        } else if (error.code === 'storage/invalid-format') {
            showNotification('Format de fichier non supporté.', 'error');
        } else {
            showNotification('Erreur lors du téléchargement: ' + error.message, 'error');
        }
    }
}

function updateCompanyDisplay() {
    if (companySettings.logoUrl) {
        const logoImg = document.getElementById('companyLogo');
        logoImg.src = companySettings.logoUrl;
        logoImg.style.display = 'block';
    }
    
    // Mettre à jour les champs du formulaire
    document.getElementById('companyName').value = companySettings.name;
    document.getElementById('companyAddress').value = companySettings.address;
    document.getElementById('companyPhone').value = companySettings.phone || '';
    document.getElementById('companyEmail').value = companySettings.email || '';
}

async function loadPaiements() {
    try {
        const snapshot = await db.collection('paiements').orderBy('createdAt', 'desc').get();
        paiements = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        displayPaiements();
    } catch (error) {
        console.error('Erreur chargement paiements:', error);
    }
}

function displayPaiements() {
    const tbody = document.querySelector('#paiementsTable tbody');
    tbody.innerHTML = '';
    
    paiements.forEach(paiement => {
        const row = tbody.insertRow();
        const typeLabel = paiement.type === 'entree' ? 'Entrée' : 'Sortie';
        const typeClass = paiement.type === 'entree' ? 'success' : 'danger';
        
        row.innerHTML = `
            <td>${new Date(paiement.date).toLocaleDateString('fr-FR')}</td>
            <td><span class="status-badge ${typeClass}">${typeLabel}</span></td>
            <td>${paiement.fournisseur || paiement.client || paiement.description}</td>
            <td>${paiement.montant.toFixed(2)} MAD</td>
            <td>${paiement.modePaiement || '-'}</td>
            <td><span class="status-badge ${paiement.statut}">${paiement.statut}</span></td>
        `;
    });
}

// Calcul des bénéfices
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

// Dashboard et statistiques amélioré
function updateDashboard() {
    // Statistiques de base
    document.getElementById('totalClients').textContent = clients.length;
    document.getElementById('totalFactures').textContent = documents.filter(d => d.type === 'facture').length;
    document.getElementById('totalArticles').textContent = articles.length;
    
    // Calculs financiers
    const stats = calculateBenefices();
    document.getElementById('totalVentes').textContent = `${stats.totalVentes.toFixed(2)} MAD`;
    
    // Ajouter les nouvelles statistiques
    const statsGrid = document.querySelector('.stats-grid');
    
    // Vérifier si les cartes existent déjà
    if (!document.getElementById('totalAchats')) {
        // Carte Achats
        const achatCard = document.createElement('div');
        achatCard.className = 'stat-card';
        achatCard.innerHTML = `
            <div class="stat-icon" style="background: linear-gradient(135deg, #f56565, #e53e3e);">
                <i class="fas fa-shopping-bag"></i>
            </div>
            <div class="stat-info">
                <h3 id="totalAchats">${stats.totalAchats.toFixed(2)} MAD</h3>
                <p>Total Achats</p>
            </div>
        `;
        
        // Carte Bénéfices
        const beneficeCard = document.createElement('div');
        beneficeCard.className = 'stat-card';
        const beneficeColor = stats.benefice >= 0 ? '#48bb78' : '#f56565';
        beneficeCard.innerHTML = `
            <div class="stat-icon" style="background: linear-gradient(135deg, ${beneficeColor}, ${beneficeColor});">
                <i class="fas fa-chart-line"></i>
            </div>
            <div class="stat-info">
                <h3 id="totalBenefice">${stats.benefice.toFixed(2)} MAD</h3>
                <p>Bénéfice (${stats.margePercent.toFixed(1)}%)</p>
            </div>
        `;
        
        // Carte Marge
        const margeCard = document.createElement('div');
        margeCard.className = 'stat-card';
        margeCard.innerHTML = `
            <div class="stat-icon" style="background: linear-gradient(135deg, #9f7aea, #805ad5);">
                <i class="fas fa-percentage"></i>
            </div>
            <div class="stat-info">
                <h3 id="totalMarge">${stats.margePercent.toFixed(1)}%</h3>
                <p>Marge Bénéficiaire</p>
            </div>
        `;
        
        statsGrid.appendChild(achatCard);
        statsGrid.appendChild(beneficeCard);
        statsGrid.appendChild(margeCard);
    } else {
        // Mettre à jour les valeurs existantes
        document.getElementById('totalAchats').textContent = `${stats.totalAchats.toFixed(2)} MAD`;
        document.getElementById('totalBenefice').textContent = `${stats.benefice.toFixed(2)} MAD`;
        document.getElementById('totalMarge').textContent = `${stats.margePercent.toFixed(1)}%`;
        
        // Mettre à jour la couleur du bénéfice
        const beneficeIcon = document.getElementById('totalBenefice').closest('.stat-card').querySelector('.stat-icon');
        const beneficeColor = stats.benefice >= 0 ? '#48bb78' : '#f56565';
        beneficeIcon.style.background = `linear-gradient(135deg, ${beneficeColor}, ${beneficeColor})`;
    }
}

// Fonctions utilitaires
function showNotification(message, type = 'info') {
    // Créer une notification temporaire
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
        animation: slideIn 0.3s ease-out;
        background: ${type === 'success' ? '#48bb78' : type === 'error' ? '#f56565' : '#4299e1'};
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function initializeApp() {
    // Ajouter les écouteurs pour le calcul automatique des totaux
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('item-article') || 
            e.target.classList.contains('item-quantity') || 
            e.target.classList.contains('item-price')) {
            calculateTotal();
        }
    });

    // Configurer les événements pour la première ligne d'articles
    const firstRow = document.querySelector('.item-row');
    if (firstRow) {
        setupItemEventListeners(firstRow);
    }
}

async function loadAchats() {
    try {
        const snapshot = await db.collection('achats').orderBy('createdAt', 'desc').get();
        achats = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        displayAchats();
    } catch (error) {
        console.error('Erreur chargement achats:', error);
    }
}

async function loadVentes() {
    try {
        const snapshot = await db.collection('ventes').orderBy('createdAt', 'desc').get();
        ventes = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        displayVentes();
    } catch (error) {
        console.error('Erreur chargement ventes:', error);
    }
}

function displayAchats() {
    const tbody = document.querySelector('#achatsTable tbody');
    tbody.innerHTML = '';
    
    achats.forEach(achat => {
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

function displayVentes() {
    const tbody = document.querySelector('#ventesTable tbody');
    tbody.innerHTML = '';
    
    ventes.forEach(vente => {
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

// Création automatique d'une vente à partir d'une facture
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
        
        // Mettre à jour les stocks (décrémenter)
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
        displayArticles(); // Rafraîchir pour le stock
        
    } catch (error) {
        console.error('Erreur création vente:', error);
    }
}

// Fonctions d'édition et de visualisation
function editClient(clientId) {
    // TODO: Implémenter l'édition de client
    console.log('Édition client:', clientId);
}

function editArticle(articleId) {
    // TODO: Implémenter l'édition d'article
    console.log('Édition article:', articleId);
}

function viewAchatDetails(achatId) {
    const achat = achats.find(a => a.id === achatId);
    if (achat) {
        alert(`Détails de l'achat:
Fournisseur: ${achat.fournisseur}
Article: ${achat.article.designation}
Quantité: ${achat.quantity}
Prix unitaire HT: ${achat.prixUnitaire.toFixed(2)} MAD
Total TTC: ${achat.total.toFixed(2)} MAD
Mode de paiement: ${achat.modePaiement}
Statut: ${achat.statut}`);
    }
}

function viewVenteDetails(venteId) {
    const vente = ventes.find(v => v.id === venteId);
    if (vente) {
        let itemsText = vente.items.map(item => 
            `- ${item.article.designation}: ${item.quantity} x ${item.price.toFixed(2)} MAD`
        ).join('\n');
        
        alert(`Détails de la vente:
Client: ${vente.clientName}
Document: ${vente.documentNumber}
Articles:
${itemsText}
Total TTC: ${vente.total.toFixed(2)} MAD
Statut: ${vente.statut}`);
    }
}

async function deleteAchat(achatId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet achat ?')) {
        try {
            const achat = achats.find(a => a.id === achatId);
            
            // Réduire le stock de l'article
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

function editArticle(articleId) {
    // TODO: Implémenter l'édition d'article
    console.log('Édition article:', articleId);
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

// Détection automatique et gestion intelligente des uploads
async function smartUploadLogo() {
    const fileInput = document.getElementById('logoUpload');
    const file = fileInput.files[0];
    
    if (!file) {
        showNotification('Veuillez sélectionner un fichier', 'error');
        return;
    }

    try {
        // Tester d'abord si Firebase Storage est accessible
        const testRef = storage.ref('test/permission_test.txt');
        await testRef.putString('test');
        await testRef.delete();
        
        // Si ça marche, utiliser Firebase Storage
        await uploadLogo();
        
    } catch (error) {
        if (error.code === 'storage/unauthorized') {
            showNotification('Règles Firebase Storage à configurer - Mode local activé', 'info');
        } else {
            showNotification('Firebase Storage indisponible - Mode local activé', 'info');
        }
        
        // Utiliser le stockage local en fallback
        uploadLogoLocal();
    }
}

async function smartUploadCachet() {
    const fileInput = document.getElementById('cachetUpload');
    const file = fileInput.files[0];
    
    if (!file) {
        showNotification('Veuillez sélectionner un fichier', 'error');
        return;
    }

    try {
        // Tester d'abord si Firebase Storage est accessible
        const testRef = storage.ref('test/permission_test.txt');
        await testRef.putString('test');
        await testRef.delete();
        
        // Si ça marche, utiliser Firebase Storage
        await uploadCachet();
        
    } catch (error) {
        if (error.code === 'storage/unauthorized') {
            showNotification('Règles Firebase Storage à configurer - Mode local activé', 'info');
        } else {
            showNotification('Firebase Storage indisponible - Mode local activé', 'info');
        }
        
        // Utiliser le stockage local en fallback
        uploadCachetLocal();
    }
}

// Test de connectivité Firebase Storage amélioré
async function testFirebaseStorage() {
    try {
        // Test avec un fichier temporaire
        const testRef = storage.ref('test/connectivity_test.txt');
        const testData = `Test ${new Date().toISOString()}`;
        
        // Essayer d'écrire
        await testRef.putString(testData, 'raw');
        
        // Essayer de lire
        const downloadURL = await testRef.getDownloadURL();
        
        // Nettoyer le test
        await testRef.delete();
        
        console.log('✅ Firebase Storage accessible - Test réussi');
        return true;
        
    } catch (error) {
        console.error('❌ Firebase Storage test échoué:', error.code, error.message);
        
        if (error.code === 'storage/unauthorized') {
            console.log('💡 Solution: Configurer les règles Firebase Storage');
        }
        
        return false;
    }
}

// Initialisation avec test de connectivité
async function initializeApp() {
    // Vérifier la configuration Firebase
    if (!firebase.apps.length) {
        showNotification('Configuration Firebase manquante', 'error');
        return;
    }

    try {
        // Test de connectivité Firestore
        await db.collection('test').doc('connectivity').set({ test: true });
        await db.collection('test').doc('connectivity').delete();
        console.log('✅ Firestore accessible');
    } catch (error) {
        console.error('❌ Firestore inaccessible:', error);
        showNotification('Problème de connexion Firestore', 'error');
    }

    // Test de connectivité Firebase Storage
    try {
        const storageAvailable = await testFirebaseStorage();
        
        if (!storageAvailable) {
            console.log('⚠️ Firebase Storage non accessible - Mode local activé');
            showNotification('Mode local activé pour les images', 'info');
        } else {
            console.log('✅ Firebase Storage accessible');
        }
    } catch (error) {
        console.error('❌ Erreur test Firebase Storage:', error);
        showNotification('Mode local activé pour les images', 'info');
    }
    
    // Ajouter les écouteurs pour le calcul automatique des totaux
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('item-article') || 
            e.target.classList.contains('item-quantity') || 
            e.target.classList.contains('item-price')) {
            calculateTotal();
        }
    });

    // Configurer les événements pour la première ligne d'articles
    const firstRow = document.querySelector('.item-row');
    if (firstRow) {
        setupItemEventListeners(firstRow);
    }
}

// Solution alternative : stockage local temporaire des images
function uploadLogoLocal() {
    const fileInput = document.getElementById('logoUpload');
    const file = fileInput.files[0];
    
    if (!file) {
        showNotification('Veuillez sélectionner un fichier', 'error');
        return;
    }

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
        showNotification('Veuillez sélectionner un fichier image', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const base64Data = e.target.result;
            companySettings.logoUrl = base64Data;
            
            // Sauvegarder dans Firestore (seulement les autres données)
            const settingsToSave = { ...companySettings };
            delete settingsToSave.logoUrl; // Ne pas sauvegarder le base64 dans Firestore
            
            db.collection('settings').doc('company').set(settingsToSave, { merge: true });
            
            updateCompanyDisplay();
            showNotification('Logo chargé localement avec succès', 'success');
            fileInput.value = '';
        } catch (error) {
            console.error('Erreur lecture fichier:', error);
            showNotification('Erreur lors de la lecture du fichier', 'error');
        }
    };
    
    reader.readAsDataURL(file);
}

function uploadCachetLocal() {
    const fileInput = document.getElementById('cachetUpload');
    const file = fileInput.files[0];
    
    if (!file) {
        showNotification('Veuillez sélectionner un fichier', 'error');
        return;
    }

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
        showNotification('Veuillez sélectionner un fichier image', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const base64Data = e.target.result;
            companySettings.cachetUrl = base64Data;
            
            // Sauvegarder dans Firestore (seulement les autres données)
            const settingsToSave = { ...companySettings };
            delete settingsToSave.cachetUrl; // Ne pas sauvegarder le base64 dans Firestore
            
            db.collection('settings').doc('company').set(settingsToSave, { merge: true });
            
            showNotification('Cachet chargé localement avec succès', 'success');
            fileInput.value = '';
        } catch (error) {
            console.error('Erreur lecture fichier:', error);
            showNotification('Erreur lors de la lecture du fichier', 'error');
        }
    };
    
    reader.readAsDataURL(file);
}

// Détection automatique et gestion intelligente des uploads
async function smartUploadLogo() {
    try {
        // Essayer d'abord Firebase Storage
        await uploadLogo();
    } catch (error) {
        console.log('Firebase Storage non disponible, utilisation du stockage local');
        uploadLogoLocal();
    }
}

async function smartUploadCachet() {
    try {
        // Essayer d'abord Firebase Storage
        await uploadCachet();
    } catch (error) {
        console.log('Firebase Storage non disponible, utilisation du stockage local');
        uploadCachetLocal();
    }
}

// Test de connectivité Firebase Storage
async function testFirebaseStorage() {
    try {
        const testRef = storage.ref('test/connectivity.txt');
        await testRef.putString('test', 'raw');
        await testRef.delete(); // Nettoyer le test
        return true;
    } catch (error) {
        console.warn('Firebase Storage non accessible:', error.message);
        return false;
    }
}

// Création d'un paiement à partir d'un achat
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

// Initialisation finale
console.log('Application de Gestion Commerciale - DYNAMIQUE FROID SYSTEMES initialisée');