// article-manager.js - Gestion des articles

function showArticleModal() {
    showModal('articleModal');
}

// Article management functions
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
    displayFilteredArticles(articles);
}

function displayFilteredArticles(filteredArticles) {
    const tbody = document.querySelector('#articlesTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    filteredArticles.forEach(article => {
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

function editArticle(articleId) {
    console.log('Édition article:', articleId);
    showNotification('Fonctionnalité en développement', 'info');
}

// Article filtering
function filterArticles() {
    const filterValue = document.getElementById('articleFilterName').value.toLowerCase();
    const filteredArticles = articles.filter(article => 
        article.reference.toLowerCase().includes(filterValue) ||
        article.designation.toLowerCase().includes(filterValue)
    );
    displayFilteredArticles(filteredArticles);
}