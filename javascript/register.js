import { apiPost } from "./api.js";

const registerForm = document.getElementById("register-form");

if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(registerForm);
        const firstName = formData.get("firstName");
        const lastName = formData.get("lastName");
        const email = formData.get("email");
        const password = formData.get("password");

        const messageEl = registerForm.querySelector(".register-message");
        if (messageEl) {
            messageEl.textContent = "";
            messageEl.className = "register-message";
        }

        const submitButton = registerForm.querySelector("button[type='submit']");
        submitButton.disabled = true;
        submitButton.innerHTML = "Creating account... <span aria-hidden='true'>→</span>";

        let registered = false;
        try {
            await apiPost("/users/register", {
                firstName,
                lastName,
                email,
                password
            });

            registered = true;

            // Show success state before redirect
            if (messageEl) {
                messageEl.textContent = "Account created! Redirecting to log in...";
                messageEl.classList.add("register-message--success");
            }
            submitButton.innerHTML = "Account created ✓";

            setTimeout(() => {
                window.location.href = "/login.html";
            }, 1500);
        } catch (error) {
            if (messageEl) {
                if (error.message && error.message.toLowerCase().includes("already")) {
                    messageEl.textContent = "An account with this email already exists.";
                } else {
                    messageEl.textContent = error.message || "Registration failed. Please try again.";
                }
                messageEl.classList.add("register-message--error");
            }
        } finally {
            submitButton.disabled = registered;
        }
    });
}
