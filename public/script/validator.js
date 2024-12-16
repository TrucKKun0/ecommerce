// Function to validate email and password
function validateForm(email, password) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/; // At least 8 characters, 1 letter, 1 number, 1 special character

    const errors = [];

    // Validate email
    if (!emailPattern.test(email)) {
        errors.push("Invalid email format.");
    }

    // Validate password
    if (!passwordPattern.test(password)) {
        errors.push("Password must be at least 8 characters long and contain at least one letter, one number, and one special character.");
    }

    return errors;
}

// Function to display validation errors on the frontend
function displayErrors(errors, errorContainerId) {
    const errorContainer = document.getElementById(errorContainerId);
    errorContainer.innerHTML = ""; // Clear previous errors

    if (errors.length > 0) {
        errors.forEach(error => {
            const errorElement = document.createElement("div");
            errorElement.textContent = error;
            errorElement.style.color = "red";
            errorContainer.appendChild(errorElement);
        });
    } 
}

// Attach event listeners to both forms
document.querySelector(".sign-in-form").addEventListener("submit", (event) => {
    const emailInput = event.target.email.value;
    const passwordInput = event.target.password.value;

    const validationErrors = validateForm(emailInput, passwordInput);

    if (validationErrors.length > 0) {
        event.preventDefault(); // Stop form submission
        displayErrors(validationErrors, "sign-in-errors");
    }
});

document.querySelector(".sign-up-form").addEventListener("submit", (event) => {
    const emailInput = event.target.email.value;
    const passwordInput = event.target.password.value;

    const validationErrors = validateForm(emailInput, passwordInput);

    if (validationErrors.length > 0) {
        event.preventDefault(); // Stop form submission
        displayErrors(validationErrors, "sign-up-errors");
    }
});
