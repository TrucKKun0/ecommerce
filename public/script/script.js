document.addEventListener('DOMContentLoaded', function() {
    function displayProducts(products, containerId) {
        const container = document.getElementById(containerId);
        products.forEach(product => {
            const productElement = createProductElement(product);
            container.appendChild(productElement);
        });
    }

    function createProductElement(product) {
        const productDiv = document.createElement('div');
        productDiv.className = 'product';
        productDiv.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <p class="price">Rs.${product.price.toFixed(2)}</p>
                <button class="add-to-cart" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}">Add to Cart</button>
            </div>
        `;
        return productDiv;
    }
   
    displayProducts(featuredProducts, 'featured-product-container');
    displayProducts(electronicsProducts, 'electronics-product-container');
    displayProducts(fashionProducts, 'fashion-product-container');
    displayProducts(sportsProducts, 'sports-product-container');
    displayProducts(homeLivingProducts, 'home-living-product-container');

    // Cart functionality
    const cartManager = {
        cart: JSON.parse(localStorage.getItem('cart')) || [],
        
        updateCartCount: function() {
            const cartCount = document.querySelector('.cart-count');
            if (cartCount) {
                cartCount.textContent = this.cart.length;
                if (this.cart.length > 0) {
                    cartCount.classList.add('visible');
                } else {
                    cartCount.classList.remove('visible');
                }
            }
        },
        
        saveCart: function() {
            localStorage.setItem('cart', JSON.stringify(this.cart));
        },
        
        addToCart: function(item) {
            this.cart.push(item);
            this.updateCartCount();
            this.saveCart();
        }
    };

    // Setup event listeners for add to cart buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-to-cart')) {
            const button = e.target;
            const item = {
                id: button.getAttribute('data-id'),
                name: button.getAttribute('data-name'),
                price: parseFloat(button.getAttribute('data-price'))
            };
            cartManager.addToCart(item);
            
        }
    });

    // Authentication functionality
    const authManager = {
        isLoggedIn: false,
        signinLink: document.getElementById('signin-link'),
        signupLink: document.getElementById('signup-link'),
        profileLink: document.getElementById('profile-link'),
        signoutLink: document.getElementById('signout-link'),
        
        checkLoginState: function() {
            const cookies = document.cookie.split(';');
            console.log("All Cookies:", cookies); // Debugging line
            for (let cookie of cookies) {
                const [name, value] = cookie.trim().split('=');
                console.log(`Cookie name: ${name}, value: ${value}`); // Debugging line
                if (name === 'token' && value !=='') {
                    this.isLoggedIn = true;
                    break;
                }
            }
            this.updateUIForAuthState();
        }
        ,
        
        updateUIForAuthState: function() {
            if (this.isLoggedIn) {
                this.signinLink.style.display = 'none';
                this.signupLink.style.display = 'none';
                this.profileLink.style.display = 'inline-block';
                this.signoutLink.style.display = 'inline-block';
            } else {
                this.signinLink.style.display = 'inline-block';
                this.signupLink.style.display = 'inline-block';
                this.profileLink.style.display = 'none';
                this.signoutLink.style.display = 'none';
            }
        },
        
        login: function() {
            // This function would be called when the user successfully logs in
            document.cookie = 'isLoggedIn=true; path=/; max-age=86400'; // Set cookie to expire in 1 day
            this.isLoggedIn = true;
            this.updateUIForAuthState();
        },
        
        logout: function() {
            document.cookie = 'isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'; // Delete the cookie
            this.isLoggedIn = false;
            this.updateUIForAuthState();
        },
        
        setupEventListeners: function() {
            this.signoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
    };

    // Image slider functionality
    const sliderManager = {
        slider: document.querySelector('.slider'),
        prevBtn: document.querySelector('.slider-nav.prev'),
        nextBtn: document.querySelector('.slider-nav.next'),
        slides: document.querySelectorAll('.slider img'),
        currentSlide: 0,
        slideInterval: null,
        
        showSlide: function(index) {
            if (index < 0) {
                this.currentSlide = this.slides.length - 1;
            } else if (index >= this.slides.length) {
                this.currentSlide = 0;
            } else {
                this.currentSlide = index;
            }

            const translateX = -this.currentSlide * 100;
            this.slider.style.transform = `translateX(${translateX}%)`;
        },
        
        nextSlide: function(e) {
            if (e) e.preventDefault();
            this.showSlide(this.currentSlide + 1);
        },
        
        prevSlide: function(e) {
            if (e) e.preventDefault();
            this.showSlide(this.currentSlide - 1);
        },
        
        autoPlay: function() {
            this.nextSlide();
        },
        
        setupEventListeners: function() {
            this.nextBtn.addEventListener('click', this.nextSlide.bind(this));
            this.prevBtn.addEventListener('click', this.prevSlide.bind(this));
            
            this.slider.addEventListener('mouseenter', () => {
                clearInterval(this.slideInterval);
            });
            
            this.slider.addEventListener('mouseleave', () => {
                this.slideInterval = setInterval(this.autoPlay.bind(this), 5000);
            });
        },
        
        init: function() {
            this.setupEventListeners();
            this.slideInterval = setInterval(this.autoPlay.bind(this), 5000);
        }
    };

// notification toast
const notificationToast = document.querySelector('[data-toast]');
const toastCloseBtn = document.querySelector('[data-toast-close]');

toastCloseBtn.addEventListener('click', function () {
    notificationToast.classList.add('closed');
  });

    // Initialize all functionalities
    cartManager.updateCartCount();
    authManager.checkLoginState();
    authManager.setupEventListeners();
    sliderManager.init();
});
