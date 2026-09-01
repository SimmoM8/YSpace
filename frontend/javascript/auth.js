import { apiPost } from "./api.js";

const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");

if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const formData = new FormData(loginForm);
        const email = formData.get("email");
        const password = formData.get("password");
        clearLoginMessage();
        const submitButton = loginForm.querySelector("button[type='submit']");
        submitButton.disabled = true;
        submitButton.innerHTML = "Logging in... <span aria-hidden='true'>→</span>";

        try {
            await login(email, password);
            const params = new URLSearchParams(window.location.search);
            const redirect = params.get("redirect");
            window.location.href = redirect || "/index.html";
        } catch (error) {
            showLoginError(error.message || "Login failed. Please try again.");
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = "Log in <span aria-hidden='true'>→</span>";
        }
    });
}

async function login(email, password) {
    const response = await apiPost("/auth/login", {
        email,
        password,
    });

    const data = await response.json();

    localStorage.setItem("token", data.token);
}

function clearLoginMessage() {
    if (!loginMessage) {
        return;
    }

    loginMessage.textContent = "";

    loginMessage.className = "auth-form-message";
}

function showLoginError(message) {
    if (!loginMessage) {
        return;
    }

    loginMessage.textContent = message;

    loginMessage.classList.add("auth-form-message--error");
}

export { login };
