/**
 * Manages view switching between Upload and Catalogue views
 */

/**
 * Shows the upload view and hides the catalogue view
 */
function showUploadView() {
    document.getElementById('uploadView').classList.remove('d-none');
    document.getElementById('catalogueView').classList.add('d-none');
    document.getElementById('uploadViewBtn').classList.add('btn-primary');
    document.getElementById('uploadViewBtn').classList.remove('btn-outline-primary');
    document.getElementById('catalogueViewBtn').classList.remove('btn-primary');
    document.getElementById('catalogueViewBtn').classList.add('btn-outline-primary');
}

/**
 * Shows the catalogue view and hides the upload view
 * Also loads the catalogue data
 */
function showCatalogueView() {
    document.getElementById('uploadView').classList.add('d-none');
    document.getElementById('catalogueView').classList.remove('d-none');
    document.getElementById('catalogueViewBtn').classList.add('btn-primary');
    document.getElementById('catalogueViewBtn').classList.remove('btn-outline-primary');
    document.getElementById('uploadViewBtn').classList.remove('btn-primary');
    document.getElementById('uploadViewBtn').classList.add('btn-outline-primary');
    
    // Load catalogue dynamically without page reload
    if (typeof loadCatalogue === 'function') {
        loadCatalogue();
    }
}

/**
 * Ensures the upload view is visible (used when errors occur)
 */
function ensureUploadViewVisible() {
    const uploadView = document.getElementById('uploadView');
    const catalogueView = document.getElementById('catalogueView');
    
    if (uploadView) {
        uploadView.classList.remove('d-none');
    }
    if (catalogueView) {
        catalogueView.classList.add('d-none');
    }
    
    // Update button states
    const uploadViewBtn = document.getElementById('uploadViewBtn');
    const catalogueViewBtn = document.getElementById('catalogueViewBtn');
    
    if (uploadViewBtn) {
        uploadViewBtn.classList.add('btn-primary');
        uploadViewBtn.classList.remove('btn-outline-primary');
    }
    if (catalogueViewBtn) {
        catalogueViewBtn.classList.remove('btn-primary');
        catalogueViewBtn.classList.add('btn-outline-primary');
    }
}
