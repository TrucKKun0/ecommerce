document.addEventListener('DOMContentLoaded', function() {
    cartManager.updateCartCount();
    productManager.displayProducts();
    productManager.setupEventListeners();
    authManager.updateUIForAuthState();
    authManager.setupEventListeners();
    sliderManager.init();
});
