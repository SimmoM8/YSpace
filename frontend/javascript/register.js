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

        try {
            await apiPost("/users/register", {
                firstName,
                lastName,
                email,
                password
            });

            window.location.href = "/login.html";
        } catch (error) {
            if (messageEl) {
                messageEl.textContent = error.message || "Registration failed. Please try again.";
                messageEl.classList.add("register-message--error");
            }
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = "Create passenger account <span aria-hidden='true'>→</span>";
        }
    });
}
