// config.js - Configuration Firebase et variables globales

// Configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDbLE9Disc3x-5jjjyjlyhfLC-stJO9Oq68",
    authDomain: "dynamicfr.firebaseapp.com",
    projectId: "dynamicfr",
    storageBucket: "dynamicfr.firebasestorage.app",
    messagingSenderId: "669407854261",
    appId: "1:669407854261:web:c4abdc9341ae9d532908fc",
    measurementId: "G-SCMB28SN1B"
};

// Initialisation Firebase (protection contre la double initialisation)
let db, storage;

try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        console.log('✅ Firebase initialisé avec succès');
    } else {
        console.log('ℹ️ Firebase déjà initialisé');
    }
    
    db = firebase.firestore();
    storage = firebase.storage();
    
    // Test de connectivité Firebase
    db.enableNetwork().then(() => {
        console.log('✅ Firestore en ligne');
    }).catch((error) => {
        console.warn('⚠️ Firestore hors ligne:', error);
    });
    
} catch (error) {
    console.error('❌ Erreur initialisation Firebase:', error);
    
    // Mode dégradé sans Firebase
    db = {
        collection: () => ({
            add: () => Promise.resolve({ id: 'local_' + Date.now() }),
            get: () => Promise.resolve({ docs: [] }),
            doc: () => ({
                set: () => Promise.resolve(),
                update: () => Promise.resolve(),
                delete: () => Promise.resolve(),
                get: () => Promise.resolve({ exists: false })
            })
        })
    };
    
    storage = {
        ref: () => ({
            put: () => Promise.reject(new Error('Firebase Storage non disponible')),
            getDownloadURL: () => Promise.reject(new Error('Firebase Storage non disponible'))
        })
    };
    
    console.log('🔄 Mode local activé (sans Firebase)');
}

// Variables globales pour les données
let clients = [];
let articles = [];
let documents = [];
let ventes = [];
let achats = [];
let paiements = [];

// Paramètres de l'entreprise
let companySettings = {
    name: "DYNAMIQUE FROID SYSTEMES",
    address: "10 Rue Chrarda RDC Derb Loubila Bourgogne Centre D'Affaire Socojufi Casablanca Maroc",
    phone: "",
    email: "",
    logoUrl: "",
    cachetUrl: ""
};

// Compteurs pour les numéros de documents
let documentCounter = {
    devis: 1,
    facture: 1,
    proforma: 1
};

// Configuration des collections Firebase
const COLLECTIONS = {
    CLIENTS: 'clients',
    ARTICLES: 'articles',
    DOCUMENTS: 'documents',
    VENTES: 'ventes',
    ACHATS: 'achats',
    PAIEMENTS: 'paiements',
    SETTINGS: 'settings'
};

// Utilitaires pour les dates
const DateUtils = {
    now: () => new Date(),
    toISOString: (date) => date instanceof Date ? date.toISOString() : new Date(date).toISOString(),
    toLocaleDateString: (date, locale = 'fr-FR') => {
        const d = date instanceof Date ? date : new Date(date);
        return d.toLocaleDateString(locale);
    },
    toInputFormat: (date) => {
        const d = date instanceof Date ? date : new Date(date);
        return d.toISOString().split('T')[0];
    }
};

// Utilitaires pour les montants
const MoneyUtils = {
    format: (amount, currency = 'MAD') => `${parseFloat(amount).toFixed(2)} ${currency}`,
    parse: (str) => parseFloat(str.replace(/[^\d.-]/g, '')) || 0,
    calculateTVA: (amount, rate = 0.20) => amount * rate,
    calculateTTC: (amountHT, rate = 0.20) => amountHT * (1 + rate)
};

// Configuration des statuts
const STATUS_CONFIG = {
    DOCUMENTS: {
        'en-cours': { label: 'En cours', class: 'warning' },
        'valide': { label: 'Validé', class: 'success' },
        'paye': { label: 'Payé', class: 'success' },
        'annule': { label: 'Annulé', class: 'danger' }
    },
    PAIEMENTS: {
        'en-attente': { label: 'En attente', class: 'warning' },
        'valide': { label: 'Validé', class: 'success' },
        'rejete': { label: 'Rejeté', class: 'danger' }
    }
};

// Configuration des types de documents
const DOCUMENT_TYPES = {
    'devis': { label: 'Devis', prefix: 'DEV', class: 'info' },
    'facture': { label: 'Facture', prefix: 'FACT', class: 'primary' },
    'proforma': { label: 'Facture Proforma', prefix: 'PROF', class: 'warning' }
};

// Mode debug
const DEBUG_MODE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

if (DEBUG_MODE) {
    console.log('🔧 Mode debug activé');
    window.appConfig = {
        firebaseConfig,
        db,
        storage,
        clients,
        articles,
        documents,
        ventes,
        achats,
        paiements,
        companySettings,
        documentCounter,
        COLLECTIONS,
        DateUtils,
        MoneyUtils,
        STATUS_CONFIG,
        DOCUMENT_TYPES
    };
}

// Export des variables pour les autres modules
window.db = db;
window.storage = storage;
window.clients = clients;
window.articles = articles;
window.documents = documents;
window.ventes = ventes;
window.achats = achats;
window.paiements = paiements;
window.companySettings = companySettings;
window.documentCounter = documentCounter;
window.COLLECTIONS = COLLECTIONS;
window.DateUtils = DateUtils;
window.MoneyUtils = MoneyUtils;
window.STATUS_CONFIG = STATUS_CONFIG;
window.DOCUMENT_TYPES = DOCUMENT_TYPES;

console.log('✅ Configuration de l\'application chargée');