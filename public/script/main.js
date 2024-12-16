document.addEventListener('DOMContentLoaded', function() {
    cartManager.updateCartCount();
    
    productManager.setupEventListeners();
    authManager.updateUIForAuthState();
    authManager.setupEventListeners();
    sliderManager.init();
});
