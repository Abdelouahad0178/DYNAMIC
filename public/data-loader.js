// data-loader.js - Chargement des données depuis Firebase

// Load data functions
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