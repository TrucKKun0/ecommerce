const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const container = document.querySelector(".container");

sign_up_btn.addEventListener("click", () => {
  container.classList.add("sign-up-mode");
});

sign_in_btn.addEventListener("click", () => {
  container.classList.remove("sign-up-mode");
});

// Handle form submissions
document.querySelector(".sign-in-form").addEventListener("submit", function(e) {
    //e.preventDefault();
    // Here you would typically send a request to your server to authenticate the user
    console.log("Sign in form submitted");
    
});

document.querySelector(".sign-up-form").addEventListener("submit", function(e) {
    //e.preventDefault();
    // Here you would typically send a request to your server to register the user
    console.log("Sign up form submitted");
    // Simulate successful registration and redirect to sign in
    container.classList.remove("sign-up-mode");
});

// Password Toggle Functionality
document.querySelectorAll('.password-toggle').forEach(toggle => {
    toggle.addEventListener('click', function() {
        const passwordInput = this.previousElementSibling;
        
        // Toggle password visibility
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            this.classList.add('show');
            this.classList.remove('fa-eye');
            this.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            this.classList.remove('show');
            this.classList.remove('fa-eye-slash');
            this.classList.add('fa-eye');
        }
    });
});
