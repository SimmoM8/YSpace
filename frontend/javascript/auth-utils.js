export function isLoggedIn() {
    return Boolean(localStorage.getItem("token"));
}

export function logout() {
    localStorage.removeItem("token");

    window.location.href = "/login.html";
}

export function getUserEmail() {
    const token = localStorage.getItem("token");

    if (!token) {
        return null;
    }

    try {
        const payload = decodeJwtPayload(token);

        return payload.sub ?? null;
    } catch {
        return null;
    }
}

export function isAdmin() {
    const token = localStorage.getItem("token");

    if (!token) {
        return false;
    }

    try {
        const payload = decodeJwtPayload(token);

        const roles = payload.roles || payload.role || [];

        if (Array.isArray(roles)) {
            return roles.includes("ROLE_ADMIN") || roles.includes("ADMIN");
        }

        if (typeof roles === "string") {
            return roles === "ROLE_ADMIN" || roles === "ADMIN";
        }

        return false;
    } catch {
        return false;
    }
}

export function applyAuthState() {
    const loggedIn = isLoggedIn();
    const admin = isAdmin();

    document.querySelectorAll(".nav-login").forEach((element) => {
        if (loggedIn) {
            element.textContent = "Log out";

            element.href = "#";

            element.addEventListener("click", handleLogoutClick);
        } else {
            element.textContent = "Log in";

            element.href = "/login.html";
        }
    });

    document.querySelectorAll(".nav-bookings").forEach((element) => {
        element.href = loggedIn ? "/my-bookings.html" : "/login.html";
    });

    document.querySelectorAll(".nav-admin").forEach((element) => {
        if (loggedIn && admin) {
            element.style.display = "";
        } else {
            element.style.display = "none";
        }
    });
}

function handleLogoutClick(event) {
    event.preventDefault();

    logout();
}

function decodeJwtPayload(token) {
    const parts = token.split(".");

    if (parts.length !== 3) {
        throw new Error("Invalid JWT");
    }

    const base64Url = parts[1];

    const base64 = base64Url.replaceAll("-", "+").replaceAll("_", "/");

    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");

    const json = decodeURIComponent(
        atob(padded)
            .split("")
            .map(
                (character) =>
                    "%" + character.charCodeAt(0).toString(16).padStart(2, "0"),
            )
            .join(""),
    );

    return JSON.parse(json);
}
