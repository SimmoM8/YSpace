import { apiPost } from "./api.js";

const loginForm = document.getElementById("login-form");

if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(loginForm);

        const email = formData.get("email");
        const password = formData.get("password");

        try {
            await login(email, password);
            window.location.href = "/index.html";
        } catch (error) {
            console.error(error);
        }

    });
}

async function login(email, password) {
    console.log(`Logging in with email: ${email}`);
    const response = await apiPost("/auth/login", {
        email,
        password
    });

    const data = await response.json();

    localStorage.setItem("token", data.token);
}

function logout() {
    localStorage.removeItem("token");
    window.location.href = "/login.html";
}

export { login, logout };