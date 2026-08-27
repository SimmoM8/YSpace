export function isLoggedIn() {
    return !!localStorage.getItem("token");
}

export function logout() {
    localStorage.removeItem("token");
    window.location.href = "/login.html";
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
}
