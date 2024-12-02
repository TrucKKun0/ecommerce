// Sample product data


// Function to render products in the table


// Modal handling
const modal = document.getElementById('productModal');
const addProductBtn = document.querySelector('.add-product-btn');

function openModal(productId = null) {
    modal.style.display = 'block';
    const modalTitle = modal.querySelector('h2');
    
    if (productId) {
        modalTitle.textContent = 'Edit Product';
    } else {
        modalTitle.textContent = 'Add New Product';
    }
}

function closeModal() {
    modal.style.display = 'none';
}

// Initialize the admin panel
function initializeAdmin() {
    // Initial render
    renderProducts(products);
    
    // Set up event listeners
    addProductBtn.addEventListener('click', () => openModal());
    
    const cancelBtn = document.querySelector('.cancel-btn');
    cancelBtn.addEventListener('click', closeModal);
}

// Start the application
document.addEventListener('DOMContentLoaded', initializeAdmin); 