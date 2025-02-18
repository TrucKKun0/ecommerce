// JavaScript for Shopping Cart Quantity Management

// Function to handle increase/decrease in quantity
function handleQuantityChange(isIncrease, productId) {
    // Select the input field for the specific product
    const input = document.querySelector(`.Quantity[data-id="${productId}"]`);
    let quantity = parseInt(input.value, 10);

    // Update quantity based on action
    if (isIncrease) {
        quantity++;
    } else if (quantity > 1) {
        quantity--;
    }

    // Update input field value
    input.value = quantity;

    // Send the updated quantity to the backend
    sendQuantityToBackend(productId, quantity);
}

// Function to send updated quantity to the backend
async function sendQuantityToBackend(productId, newQuantity) {
    try {
        const response = await fetch('/update-quantity', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                productId: productId,
                quantity: newQuantity,
            }),
        });

        // Handle response
        if (!response.ok) {
            throw new Error('Failed to update quantity');
        }

        const data = await response.json();
        console.log('Quantity updated successfully:', data);
    } catch (error) {
        console.error('Error updating quantity:', error);
    }
}

// Add event listeners after DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    // Add event listeners for increase buttons
    document.querySelectorAll(".js-increase").forEach(button => {
        button.addEventListener("click", () => {
            const productId = button.dataset.id;
            handleQuantityChange(true, productId);
        });
    });

    // Add event listeners for decrease buttons
    document.querySelectorAll(".js-decrease").forEach(button => {
        button.addEventListener("click", () => {
            const productId = button.dataset.id;
            handleQuantityChange(false, productId);
        });
    });

    // Optional: Sync input changes if the user edits the quantity manually
    document.querySelectorAll(".Quantity").forEach(input => {
        input.addEventListener("input", () => {
            const productId = input.dataset.id;
            let quantity = parseInt(input.value, 10);

            // Validate input and prevent invalid values
            if (isNaN(quantity) || quantity < 1) {
                quantity = 1; // Reset to minimum quantity
                input.value = quantity;
            }

            // Send the updated quantity to the backend
            sendQuantityToBackend(productId, quantity);
        });
    });
});
