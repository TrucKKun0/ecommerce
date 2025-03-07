// JavaScript for Shopping Cart Quantity Management

// Function to handle increase/decrease in quantity
function handleQuantityChange(isIncrease, productId) {
    const input = document.querySelector(`.Quantity[data-id="${productId}"]`);
    let quantity = parseInt(input.value, 10);
    let productPrice = parseFloat(input.dataset.price); // Convert price to number

    console.log(`Product ID: ${productId}, Price: ${productPrice}, Initial Quantity: ${quantity}`);

    // Validate productPrice
    if (isNaN(productPrice)) {
        console.error(`Error: productPrice is NaN for product ID ${productId}`);
        productPrice = 0; // Default to 0 to prevent NaN errors
    }

    if (isIncrease) {
        quantity++;
    } else if (quantity > 1) {
        quantity--;
    }

    input.value = quantity;

    // Validate quantity
    if (isNaN(quantity) || quantity < 1) {
        quantity = 1;
        input.value = quantity;
    }

    const subtotal = productPrice * quantity;
    
    console.log(`Updated Quantity: ${quantity}, Subtotal: ${subtotal}`);
    sendQuantityToBackend(productId, quantity, subtotal);
}

// Function to send updated quantity to the backend
async function sendQuantityToBackend(productId, newQuantity, newPrice) {
    try {
        console.log(`Sending Data - Product ID: ${productId}, Quantity: ${newQuantity}, Price: ${newPrice}`);

        if (isNaN(newPrice)) {
            console.error(`Error: newPrice is NaN for product ID ${productId}`);
            newPrice = 0; // Default to 0 to prevent errors
        }

        const response = await fetch('/update-quantity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, quantity: newQuantity, price: newPrice }),
        });

        if (!response.ok) throw new Error('Failed to update quantity');

        const data = await response.json();
        console.log('Quantity updated successfully:', data);
    } catch (error) {
        console.error('Error updating quantity:', error);
    }
}

// Add event listeners after DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".js-increase").forEach(button => {
        button.addEventListener("click", () => {
            const productId = button.dataset.id;
            handleQuantityChange(true, productId);
        });
    });

    document.querySelectorAll(".js-decrease").forEach(button => {
        button.addEventListener("click", () => {
            const productId = button.dataset.id;
            handleQuantityChange(false, productId);
        });
    });

    // Sync input changes when user manually edits quantity
    document.querySelectorAll(".Quantity").forEach(input => {
        input.addEventListener("input", () => {
            const productId = input.dataset.id;
            let quantity = parseInt(input.value, 10);
            let productPrice = parseFloat(input.dataset.price); // Convert price to number

            if (isNaN(quantity) || quantity < 1) {
                quantity = 1;
                input.value = quantity;
            }

            if (isNaN(productPrice)) {
                console.error(`Error: productPrice is NaN for product ID ${productId}`);
                productPrice = 0; // Default to 0 to prevent errors
            }

            const subtotal = productPrice * quantity;
            sendQuantityToBackend(productId, quantity, subtotal);
        });
    });
});
