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

export function applyAuthState() {
    const loggedIn = isLoggedIn();

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
