import { apiPost } from "./api.js";

const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");

// Show a notice if redirected after requiring login (e.g. booking, bookings page)
(function showRedirectNotice() {
    if (!loginMessage) return;
    const params = new URLSearchParams(window.location.search);
    if (!params.get("redirect")) return;
    loginMessage.textContent = "Please log in to continue.";
    loginMessage.classList.add("auth-form-message--info");
})();

if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(loginForm);
        const email = formData.get("email");
        const password = formData.get("password");

        loginMessage.textContent = "";
        loginMessage.className = "auth-form-message";

        const submitButton = loginForm.querySelector("button[type='submit']");
        submitButton.disabled = true;
        submitButton.innerHTML = "Logging in... <span aria-hidden='true'>→</span>";

        try {
            const role = await login(email, password);
            const params = new URLSearchParams(window.location.search);
            const redirect = params.get("redirect");
            if (redirect) {
                window.location.href = redirect;
            } else {
                window.location.href = role === "ADMIN" ? "/admin.html" : "/index.html";
            }
        } catch (error) {
            loginMessage.textContent = error.message || "Login failed. Please try again.";
            loginMessage.classList.add("auth-form-message--error");
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = "Log in <span aria-hidden='true'>→</span>";
        }
    });
}

async function login(email, password) {
    const response = await apiPost("/auth/login", { email, password });
    const data = await response.json();
    localStorage.setItem("token", data.token);
    if (data.role) {
        localStorage.setItem("role", data.role);
    }
    return data.role || "";
}

function logout() {
    localStorage.removeItem("token");
    window.location.href = "/login.html";
}

export { login, logout };
