document.addEventListener('DOMContentLoaded', function () {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    function displayCart() {
        cartItems.innerHTML = '';
        let total = 0;

        if (!cart || cart.length === 0) {
            cartItems.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
            cartTotal.textContent = '0.00';
            return;
        }

        cart.forEach((item, index) => {
            if (!item.quantity || isNaN(item.quantity)) {
                item.quantity = 1;
            }

            const price = parseFloat(item.price) || 0;
            const itemTotal = price * item.quantity;

            const cartItem = document.createElement('div');
            cartItem.classList.add('cart-item');
            cartItem.innerHTML = `
                <div>
                    <h3>${item.name}</h3>
                    <p>Price: Rs${price.toFixed(2)}</p>
                    <div class="quantity-controls">
                        <button class="decrease-qty" data-index="${index}" aria-label="Decrease quantity" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                        <input type="number" class="item-quantity" value="${item.quantity}" min="1" data-index="${index}" aria-label="Quantity">
                        <button class="increase-qty" data-index="${index}" aria-label="Increase quantity">+</button>
                    </div>
                    <p>Total: Rs<span class="item-total">${itemTotal.toFixed(2)}</span></p>
                </div>
                <button class="remove-from-cart" data-index="${index}">Remove</button>
            `;
            cartItems.appendChild(cartItem);
            total += itemTotal;
        });

        cartTotal.textContent = `${total.toFixed(2)}`;
    }

    displayCart();

    cartItems.addEventListener('click', function (e) {
        const index = parseInt(e.target.dataset.index);

        if (e.target.classList.contains('remove-from-cart')) {
            if (!isNaN(index) && index >= 0 && index < cart.length) {
                cart.splice(index, 1);
                localStorage.setItem('cart', JSON.stringify(cart));
                displayCart();
            }
        } else if (e.target.classList.contains('increase-qty')) {
            if (!isNaN(index) && index >= 0 && index < cart.length) {
                cart[index].quantity = (parseInt(cart[index].quantity) || 1) + 1;
                localStorage.setItem('cart', JSON.stringify(cart));
                displayCart();
            }
        } else if (e.target.classList.contains('decrease-qty')) {
            if (!isNaN(index) && index >= 0 && index < cart.length) {
                if (cart[index].quantity > 1) {
                    cart[index].quantity--;
                    localStorage.setItem('cart', JSON.stringify(cart));
                    displayCart();
                }
            }
        }
    });

    cartItems.addEventListener('input', function (e) {
        if (e.target.classList.contains('item-quantity')) {
            const index = parseInt(e.target.dataset.index);
            if (!isNaN(index) && index >= 0 && index < cart.length) {
                const newQuantity = Math.max(parseInt(e.target.value) || 1, 1);
                cart[index].quantity = newQuantity;
                localStorage.setItem('cart', JSON.stringify(cart));
                displayCart();
            }
        }
    });
});
