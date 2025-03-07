document.addEventListener('DOMContentLoaded', function() {

    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-to-cart')) {
            const button = e.target;
            
            // cartManager.addToCart(item);
    
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

    
    



    document.getElementById('searchBtn').addEventListener('click', function () {
        const searchData = document.getElementById('searchItem').value.trim();
        console.log('Search data:', searchData);
    
        if (!searchData) return; // Prevent empty search
    
        // Redirect to the search results page
        window.location.href = `/search?q=${encodeURIComponent(searchData)}`;
    });
    
})
  