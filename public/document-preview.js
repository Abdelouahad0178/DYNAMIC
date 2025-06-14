
// document-preview.js - Aperçu et impression des documents

// Utilitaire pour convertir un montant en lettres (en français)
function numberToFrenchWords(number) {
    const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
    const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
    const tens = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];
    const thousands = ['', 'mille', 'million', 'milliard'];

    if (number === 0) return 'zéro';

    function convertChunk(num) {
        if (num === 0) return '';
        if (num < 10) return units[num];
        if (num < 20) return teens[num - 10];
        if (num < 100) {
            const ten = Math.floor(num / 10);
            const unit = num % 10;
            let result = tens[ten];
            if (unit > 0) result += (ten === 7 || ten === 9 ? '-' + teens[unit] : '-' + units[unit]);
            return result;
        }
        const hundred = Math.floor(num / 100);
        const rest = num % 100;
        let result = hundred > 1 ? units[hundred] + ' cents' : 'cent';
        if (rest > 0) result += ' ' + convertChunk(rest);
        return result;
    }

    let result = '';
    let chunkIndex = 0;
    while (number > 0) {
        const chunk = number % 1000;
        if (chunk > 0) {
            let chunkText = convertChunk(chunk);
            if (chunkIndex > 0) chunkText += ' ' + thousands[chunkIndex] + (chunk > 1 && chunkIndex === 1 ? 's' : '');
            result = chunkText + (result ? ' ' + result : '');
        }
        number = Math.floor(number / 1000);
        chunkIndex++;
    }

    return result.trim();
}

// Formuler la phrase "Arrêté..." selon le type de document
function getDocumentTotalText(docType, total) {
    const totalInWords = numberToFrenchWords(Math.floor(total)) + ' dirhams';
    switch (docType.toLowerCase()) {
        case 'facture':
            return `Arrêtée la présente facture à la somme de : ${totalInWords}`;
        case 'devis':
            return `Arrêté le présent devis à la somme de : ${totalInWords}`;
        case 'facture_proforma':
            return `Arrêtée la présente facture pro forma à la somme de : ${totalInWords}`;
        default:
            return `Arrêté le présent document à la somme de : ${totalInWords}`;
    }
}

// Calculer la date de validité (+30 jours)
function getValidityDate(dateString) {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        console.error('Invalid date string:', dateString);
        return 'N/A';
    }
    date.setDate(date.getDate() + 30);
    return date.toLocaleDateString('fr-FR');
}

async function previewDocument(documentId) {
    console.log(`📄 previewDocument called with ID: ${documentId}`);
    console.log('🔍 Documents array:', documents);

    const docData = documents.find(doc => doc.id === documentId);
    if (!docData) {
        showNotification('Document introuvable', 'error');
        console.error(`Document with ID ${documentId} not found`);
        return;
    }
    console.log('📄 Document data:', docData);

    // Vérifier les données nécessaires
    if (!docData.items || !Array.isArray(docData.items)) {
        showNotification('Les articles du document sont manquants', 'error');
        console.error('Invalid or missing items in document:', docData);
        return;
    }
    if (!docData.subtotal || !docData.tva || !docData.total || !docData.date) {
        showNotification('Les données du document sont incomplètes', 'error');
        console.error('Missing required data in document:', docData);
        return;
    }

    const modal = document.getElementById('previewModal');
    if (!modal) {
        showNotification('Modal d\'aperçu introuvable', 'error');
        console.error('Modal #previewModal not found in DOM');
        return;
    }
    console.log('✅ Modal #previewModal found');

    const previewContent = modal.querySelector('.modal-content');
    if (!previewContent) {
        showNotification('Contenu du modal introuvable', 'error');
        console.error('Modal content (.modal-content) not found');
        return;
    }
    console.log('✅ Modal content (.modal-content) found');

    // Générer le contenu de l'aperçu
    const itemsHTML = docData.items.map(item => {
        if (!item.article || !item.quantity || !item.price) {
            console.warn('Invalid item data:', item);
            return '';
        }
        return `
            <tr>
                <td>${item.article.reference || 'N/A'}</td>
                <td>${item.article.designation || 'N/A'}</td>
                <td>${item.quantity}</td>
                <td>${item.price.toFixed(2)}</td>
                <td>${(item.quantity * item.price).toFixed(2)}</td>
            </tr>
        `;
    }).filter(row => row).join('');

    const documentType = docData.type.toUpperCase();
    const totalText = getDocumentTotalText(docData.type, docData.total);
    const validityDate = getValidityDate(docData.date);
    const cachetHTML = companySettings.cachetUrl ? `
        <div class="cachet-section">
            <img src="${companySettings.cachetUrl}" alt="Cachet" class="cachet-img">
        </div>
    ` : '';
    console.log('🔧 Company settings:', companySettings);

    previewContent.innerHTML = `
        <div class="modal-header">
            <h2>Aperçu ${documentType} - ${docData.number}</h2>
            <span class="close" onclick="closeModal('previewModal')">×</span>
        </div>
        <div class="document-preview">
            <div class="document-header">
                <div class="company-info">
                    <img src="${companySettings.logoUrl || ''}" alt="Logo" class="company-logo" style="display: ${companySettings.logoUrl ? 'block' : 'none'};">
                    <h3>${companySettings.name || 'DYNAMIQUE FROID SYSTEMES'}</h3>
                    <p>${companySettings.address || ''}</p>
                    <p>${companySettings.phone || ''}</p>
                    <p>${companySettings.email || ''}</p>
                </div>
                <div class="document-info">
                    <h3>${documentType}</h3>
                    <p><strong>Numéro:</strong> ${docData.number}</p>
                    <p><strong>Date:</strong> ${new Date(docData.date).toLocaleDateString('fr-FR')}</p>
                    <p><strong>Validité:</strong> ${validityDate}</p>
                    <p><strong>Client:</strong> ${docData.client?.name || 'N/A'}</p>
                </div>
            </div>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Référence</th>
                        <th>Désignation</th>
                        <th>Quantité</th>
                        <th>Prix HT</th>
                        <th>Total HT</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHTML}
                </tbody>
            </table>
            <div class="document-total">
                <p><strong>Sous-total HT:</strong> ${docData.subtotal.toFixed(2)}</p>
                <p><strong>TVA (20%):</strong> ${docData.tva.toFixed(2)}</p>
                <p><strong>Total TTC:</strong> ${docData.total.toFixed(2)} dhs</p>
                <p class="total-in-words">${totalText}</p>
            </div>
            <div class="document-footer">
                <div class="total-section"></div>
                ${cachetHTML}
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-primary" onclick="printDocument('${documentId}')">
                <i class="fas fa-print"></i> Imprimer
            </button>
            <button class="btn btn-secondary" onclick="closeModal('previewModal')">
                Fermer
            </button>
        </div>
    `;
    console.log('📝 Modal content generated');

    // Ajouter ou mettre à jour les styles
    let printStyle = document.getElementById('print-preview-style');
    if (!printStyle) {
        printStyle = document.createElement('style');
        printStyle.id = 'print-preview-style';
        document.head.appendChild(printStyle);
        console.log('✅ Created print-preview-style');
    }
    printStyle.textContent = `
        .document-preview {
            background: white;
            padding: 20px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 14px;
        }
        .document-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 10px;
        }
        .company-info, .document-info {
            width: 45%;
            margin-bottom: 4%;
        }
        .company-logo {
            max-width: 150px;
            margin-bottom: 10px;
        }
        .document-info p {
            margin: 5px 0;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .items-table th, .items-table td {
            border: 1px solid #e2e8f0;
            padding: 8px;
            text-align: left;
        }
        .items-table th {
            background: #f7fafc;
            font-weight: bold;
        }
        .document-total {
            text-align: right;
            margin-top: 20px;
        }
        .document-total p {
            margin: 5px 0;
        }
        .total-in-words {
            font-style: italic;
            margin-top: 10px;
            text-transform: capitalize;
            font-size: 12px;
        }
        .document-footer {
            margin-top: 30px;
            position: relative;
            min-height: 100px;
        }
        .cachet-section {
            position: absolute;
            right: 0;
            bottom: 0;
            text-align: right;
        }
        .cachet-img {
            max-width: 150px;
            max-height: 100px;
            object-fit: contain;
        }
        @media print {
            .document-footer {
                display: block !important;
                position: relative;
                margin-top: 30px;
            }
            .cachet-section {
                position: absolute;
                right: 0;
                bottom: 0;
                margin-top: 30px !important;
                text-align: right;
            }
            .total-section {
                display: none;
            }
            .modal-header, .modal-footer {
                display: none !important;
            }
            .document-preview {
                border: none;
                box-shadow: none;
                padding: 0;
                visibility: visible !important;
                opacity: 1 !important;
                width: 210mm;
                margin: 0 auto;
            }
            body {
                margin: 0;
                padding: 10mm;
            }
        }
    `;
    console.log('✅ Print styles updated');

    return new Promise((resolve, reject) => {
        try {
            showModal('previewModal');
            console.log('✅ Modal preview opened');
        } catch (error) {
            console.error('Error calling showModal:', error);
            showNotification('Échec de l\'ouverture du modal', 'error');
            reject(new Error('showModal failed'));
            return;
        }

        // Utiliser MutationObserver pour détecter l'ajout de .document-preview
        const observer = new MutationObserver((mutations, obs) => {
            if (modal.querySelector('.document-preview')) {
                console.log('✅ .document-preview rendered');
                obs.disconnect();
                resolve();
            }
        });
        observer.observe(modal, { childList: true, subtree: true });
        console.log('🔍 MutationObserver started');

        // Timeout de secours après 3 secondes
        setTimeout(() => {
            if (!modal.querySelector('.document-preview')) {
                console.error('Timeout: .document-preview not rendered');
                console.log('Current modal HTML:', modal.innerHTML);
                showNotification('Échec du rendu de l\'aperçu', 'error');
                observer.disconnect();
                reject(new Error('Preview content not rendered'));
            }
        }, 3000);
    });
}

async function printDocument(documentId) {
    console.log(`🖨️ printDocument called with ID: ${documentId}`);
    const modal = document.getElementById('previewModal');
    if (!modal) {
        console.error('Modal #previewModal not found');
        showNotification('Modal introuvable', 'error');
        return;
    }

    let documentPreview = modal.querySelector('.document-preview');
    if (!documentPreview) {
        console.warn('Modal or preview content not found, initializing preview');
        try {
            await previewDocument(documentId);
            documentPreview = modal.querySelector('.document-preview');
        } catch (error) {
            showNotification('Échec de l\'initialisation de l\'aperçu', 'error');
            console.error('Preview initialization failed:', error);
            return;
        }
    }

    if (!documentPreview) {
        showNotification('Contenu de l\'aperçu introuvable', 'error');
        console.error('Document preview (.document-preview) not found after initialization');
        console.log('Current modal HTML:', modal.innerHTML);
        return;
    }

    const previewContent = documentPreview.innerHTML;
    console.log('📄 Preview content retrieved, length:', previewContent.length);

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        showNotification('La fenêtre d\'impression a été bloquée par le navigateur', 'error');
        console.error('Print window blocked or failed to open');
        return;
    }

    try {
        printWindow.document.write(`
            <html>
            <head>
                <title>Impression Document</title>
                <style>
                    ${document.getElementById('print-preview-style')?.textContent || ''}
                </style>
            </head>
            <body>
                <div class="document-preview">
                    ${previewContent}
                </div>
            </body>
            </html>
        `);

        printWindow.document.close();
        console.log('🖨️ Print window content written');
        printWindow.focus();
        printWindow.print();
        printWindow.close();
        console.log('✅ Print window opened and closed');
    } catch (error) {
        showNotification('Erreur lors de l\'impression', 'error');
        console.error('Print error:', error);
        printWindow.close();
    }
}
