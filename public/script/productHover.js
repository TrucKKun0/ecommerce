const productHover = {
    hoverCard: null,
    timeout: null,
    hoverCardTimeout: null,

    init: function() {
        console.log('ProductHover initialized');
        document.addEventListener('mouseover', this.handleMouseOver.bind(this));
        document.addEventListener('mouseout', this.handleMouseOut.bind(this));
    },

    handleMouseOver: function(event) {
        const product = event.target.closest('.product');
        if (product) {
            console.log('Mouse over product:', product);
            clearTimeout(this.timeout);
            clearTimeout(this.hoverCardTimeout); // Prevent hiding hover card when moving to it
            this.timeout = setTimeout(() => this.showHoverCard(product), 100);
        }
    },

    handleMouseOut: function(event) {
        const product = event.target.closest('.product');
        const hoverCard = event.target.closest('.hover-card');
        if (product && !hoverCard) {
            console.log('Mouse out of product');
            clearTimeout(this.timeout);
            this.timeout = setTimeout(() => this.hideHoverCard(), 300); // Increase delay for hiding
        }
    },

    showHoverCard: function(product) {
        console.log('Showing hover card');
        const productData = {
            image: product.querySelector('img').src,
            name: product.querySelector('h3').textContent,
            price: product.querySelector('.price').textContent,
            description: product.querySelector('p:not(.price)').textContent
        };

        if (this.hoverCard) {
            this.hideHoverCard();
        }

        this.hoverCard = document.createElement('div');
        this.hoverCard.className = 'hover-card';
        this.hoverCard.innerHTML = `
            <div class="hover-card-content">
               
                <h3>${productData.name}</h3>
                <p class="description">${productData.description}</p>
                <p class="price">${productData.price}</p>
                <button class="view-details">View Details</button>
            </div>
        `;

        const rect = product.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const hoverCardWidth = 250;

        this.hoverCard.style.position = 'absolute';
        
        if (rect.right + hoverCardWidth + 10 <= windowWidth) {
            this.hoverCard.style.left = `${rect.right + 10}px`;
        } else {
            this.hoverCard.style.left = `${rect.left - hoverCardWidth - 10}px`;
        }

        this.hoverCard.style.top = `${rect.top + window.scrollY}px`;
        this.hoverCard.style.zIndex = '1000';

        document.body.appendChild(this.hoverCard);

        // Add event listeners to keep hover card visible
        this.hoverCard.addEventListener('mouseover', () => {
            clearTimeout(this.hoverCardTimeout);
        });
        this.hoverCard.addEventListener('mouseout', () => {
            this.hoverCardTimeout = setTimeout(() => this.hideHoverCard(), 300);
        });

        // Trigger animation
        setTimeout(() => this.hoverCard.classList.add('active'), 10);
    },

    hideHoverCard: function() {
        if (this.hoverCard) {
            this.hoverCard.classList.remove('active');
            setTimeout(() => {
                if (this.hoverCard) {
                    this.hoverCard.remove();
                    this.hoverCard = null;
                }
            }, 300); // Match this with the CSS transition time
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM content loaded');
    productHover.init();
});

// Add this line at the end of the file
console.log('productHover.js loaded');
