export function isLoggedIn() {
    return !!localStorage.getItem("token");
}

export function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/login.html";
}

export function getUserRole() {
    return localStorage.getItem("role") || null;
}

export function getUserEmail() {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.sub || null;
    } catch {
        return null;
    }
}

export function applyAuthState() {
    const loggedIn = isLoggedIn();
    const email = getUserEmail();

    document.querySelectorAll(".nav-login").forEach((el) => {
        if (loggedIn) {
            el.textContent = "Log out";
            el.href = "#";
            el.addEventListener("click", (e) => {
                e.preventDefault();
                logout();
            });
        } else {
            el.textContent = "Log in";
            el.href = "/login.html";
        }
    });

    document.querySelectorAll(".nav-bookings").forEach((el) => {
        if (loggedIn) {
            el.href = "/my-bookings.html";
        } else {
            el.href = "/login.html";
        }
    });

    document.querySelectorAll(".nav-admin").forEach((el) => {
        if (loggedIn && getUserRole() === "ADMIN") {
            el.removeAttribute("hidden");
            el.href = "/admin.html";
        } else {
            el.setAttribute("hidden", "");
        }
    });
}
