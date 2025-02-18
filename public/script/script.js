document.addEventListener('DOMContentLoaded', function() {

    // Cart functionality
    const cartManager = {
        cart: JSON.parse(localStorage.getItem('cart')) || [],
        
        saveCart: function() {
            localStorage.setItem('cart', JSON.stringify(this.cart));
        },
        
        addToCart: function(item) {
            this.cart.push(item);
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
    
            // Send only the name to the backend
            const productName = button.getAttribute('data-name');
            if (productName) {
                fetch('/cart', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ productName }),
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Error: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log('Response from backend:', data);
                    })
                    .catch(error => {
                        console.error('Error sending name to backend:', error);
                    });
            } else {
                console.error('Product name is undefined.');
            }
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
            console.log("All Cookies:", cookies);
            this.isLoggedIn = cookies.some(cookie => {
                const [name, value] = cookie.trim().split('=');
                console.log(`Cookie name: ${name}, value: ${value}`);
                return name === 'token' && value !== '';
            });
            this.updateUIForAuthState();
        },
    
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
    
        login: function(tokenValue) {
            document.cookie = `token=${tokenValue}; path=/; max-age=86400`;
            this.isLoggedIn = true;
            this.updateUIForAuthState();
        },
    
        logout: function() {
            document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
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
    
    // Initialize
    authManager.setupEventListeners();
    authManager.checkLoginState();
    

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

    sliderManager.init();
});



const searchBtn = document.getElementById('searchBtn').addEventListener('click', function () {
    const searchData = document.getElementById('searchItem').value;
    console.log('Search data:', searchData);
  
    // Send a GET request with the search term as a query parameter
    fetch(`/search?q=${encodeURIComponent(searchData)}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
      })
      .then(data => {
        console.log('Response from backend:', data);
        
      })
      .catch(error => {
        console.error('Error sending search request:', error);
      });
  });