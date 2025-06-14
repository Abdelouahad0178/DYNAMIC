// settings-manager.js - Gestion des paramètres de l'entreprise

// Company settings
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

function updateCompanyDisplay() {
    if (companySettings.logoUrl) {
        const logoImg = document.getElementById('companyLogo');
        if (logoImg) {
            logoImg.src = companySettings.logoUrl;
            logoImg.style.display = 'block';
        }
    }
    
    const fields = ['companyName', 'companyAddress', 'companyPhone', 'companyEmail'];
    const values = [companySettings.name, companySettings.address, companySettings.phone || '', companySettings.email || ''];
    
    fields.forEach((fieldId, index) => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.value = values[index];
        }
    });
}

// File upload functions
async function smartUploadLogo() {
    const fileInput = document.getElementById('logoUpload');
    const file = fileInput.files[0];
    
    if (!file) {
        showNotification('Veuillez sélectionner un fichier', 'error');
        return;
    }

    try {
        const testRef = storage.ref('test/permission_test.txt');
        await testRef.putString('test');
        await testRef.delete();
        
        await uploadLogo();
        
    } catch (error) {
        if (error.code === 'storage/unauthorized') {
            showNotification('Règles Firebase Storage à configurer - Mode local activé', 'info');
        } else {
            showNotification('Firebase Storage indisponible - Mode local activé', 'info');
        }
        
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
        const testRef = storage.ref('test/permission_test.txt');
        await testRef.putString('test');
        await testRef.delete();
        
        await uploadCachet();
        
    } catch (error) {
        if (error.code === 'storage/unauthorized') {
            showNotification('Règles Firebase Storage à configurer - Mode local activé', 'info');
        } else {
            showNotification('Firebase Storage indisponible - Mode local activé', 'info');
        }
        
        uploadCachetLocal();
    }
}

async function uploadLogo() {
    const fileInput = document.getElementById('logoUpload');
    const file = fileInput.files[0];
    
    if (!file) {
        showNotification('Veuillez sélectionner un fichier', 'error');
        return;
    }

    if (!file.type.startsWith('image/')) {
        showNotification('Veuillez sélectionner un fichier image', 'error');
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        showNotification('Le fichier est trop volumineux (max 5MB)', 'error');
        return;
    }

    try {
        showNotification('Upload en cours...', 'info');
        
        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop();
        const fileName = `logo_${timestamp}.${fileExtension}`;
        
        const storageRef = storage.ref(`images/${fileName}`);
        
        const metadata = {
            contentType: file.type,
            customMetadata: {
                'uploadedBy': 'admin',
                'uploadDate': new Date().toISOString()
            }
        };
        
        const snapshot = await storageRef.put(file, metadata);
        const downloadURL = await snapshot.ref.getDownloadURL();
        
        companySettings.logoUrl = downloadURL;
        await db.collection('settings').doc('company').set(companySettings, { merge: true });
        
        updateCompanyDisplay();
        showNotification('Logo téléchargé avec succès', 'success');
        
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

    if (!file.type.startsWith('image/')) {
        showNotification('Veuillez sélectionner un fichier image', 'error');
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        showNotification('Le fichier est trop volumineux (max 5MB)', 'error');
        return;
    }

    try {
        showNotification('Upload en cours...', 'info');
        
        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop();
        const fileName = `cachet_${timestamp}.${fileExtension}`;
        
        const storageRef = storage.ref(`images/${fileName}`);
        
        const metadata = {
            contentType: file.type,
            customMetadata: {
                'uploadedBy': 'admin',
                'uploadDate': new Date().toISOString()
            }
        };
        
        const snapshot = await storageRef.put(file, metadata);
        const downloadURL = await snapshot.ref.getDownloadURL();
        
        companySettings.cachetUrl = downloadURL;
        await db.collection('settings').doc('company').set(companySettings, { merge: true });
        
        showNotification('Cachet téléchargé avec succès', 'success');
        
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

function uploadLogoLocal() {
    const fileInput = document.getElementById('logoUpload');
    const file = fileInput.files[0];
    
    if (!file) {
        showNotification('Veuillez sélectionner un fichier', 'error');
        return;
    }

    if (!file.type.startsWith('image/')) {
        showNotification('Veuillez sélectionner un fichier image', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const base64Data = e.target.result;
            companySettings.logoUrl = base64Data;
            
            const settingsToSave = { ...companySettings };
            delete settingsToSave.logoUrl;
            
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

    if (!file.type.startsWith('image/')) {
        showNotification('Veuillez sélectionner un fichier image', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const base64Data = e.target.result;
            companySettings.cachetUrl = base64Data;
            
            const settingsToSave = { ...companySettings };
            delete settingsToSave.cachetUrl;
            
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

// Firebase Storage connectivity test
async function testFirebaseStorage() {
    try {
        const testRef = storage.ref('test/connectivity_test.txt');
        const testData = `Test ${Date.now()}`;
        
        await testRef.putString(testData, 'raw');
        const downloadURL = await testRef.getDownloadURL();
        await testRef.delete();
        
        console.log('✅ Firebase Storage accessible');
        return true;
        
    } catch (error) {
        console.error('❌ Firebase Storage test échoué:', error.code, error.message);
        return false;
    }
}