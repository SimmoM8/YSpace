import { apiGet } from "../../javascript/api.js";
import { initCreateFlightPage } from "./pages/create-flight.js";
import { initFlightsPage } from "./pages/flights.js";

const adminContent = document.getElementById("admin-content");

const routes = {
    dashboard: {
        view: "views/dashboard.html",
        title: "Dashboard"
    },
    flights: {
        view: "views/flights.html",
        title: "Flights",
        init: initFlightsPage
    },
    "create-flight": {
        view: "views/create-flight.html",
        title: "Schedule Flight",
        init: initCreateFlightPage
    }
};

document.addEventListener("DOMContentLoaded", async () => {
    const allowed = await protectAdminPage();

    if (!allowed) {
        return;
    }

    window.addEventListener("hashchange", handleRoute);
    await handleRoute();
});

async function protectAdminPage() {
    const token = localStorage.getItem("token");

    if (!token) {
        redirectToLogin();
        return false;
    }

    try {
        await apiGet("/admin/check");
        return true;
    } catch (error) {
        console.error("Admin access rejected:", error);

        if (error.status === 401) {
            localStorage.removeItem("token");
            redirectToLogin();
            return false;
        }

        if (error.status === 403) {
            window.location.href = "/index.html";
            return false;
        }

        showFatalError("Could not verify administrator access.");
        return false;
    }
}

function redirectToLogin() {
    const redirect = encodeURIComponent("/admin/");
    window.location.href = `/login.html?redirect=${redirect}`;
}

async function handleRoute() {
    const { page, id } = getRoute();

    if (page === "flight" && id) {
        window.location.hash = "flights";
        return;
    }

    const route = routes[page] ?? routes.dashboard;

    updateNavigation(page);
    await loadView(route);
}

function getRoute() {
    const hash = window.location.hash.substring(1) || "dashboard";
    const [page, id] = hash.split("/");

    return { page, id };
}

async function loadView(route) {
    try {
        showLoading();

        const response = await fetch(route.view);

        if (!response.ok) {
            throw new Error(`Could not load ${route.title}.`);
        }

        adminContent.innerHTML = await response.text();

        updatePageTitle(route.title);
        updateTopbarTitle(route.title);

        if (route.init) {
            await route.init();
        }
    } catch (error) {
        console.error(error);
        showFatalError(error.message || "Unable to load page.");
    }
}

function updateNavigation(page) {
    const navigationPage =
        page === "flight" || page === "create-flight"
            ? "flights"
            : page;

    document.querySelectorAll(".admin-nav-item").forEach((link) => {
        link.classList.remove("admin-nav-item-active");
        link.removeAttribute("aria-current");

        if (link.getAttribute("href") === `#${navigationPage}`) {
            link.classList.add("admin-nav-item-active");
            link.setAttribute("aria-current", "page");
        }
    });
}

function updatePageTitle(title) {
    document.title = `${title} — YSpace Admin`;
}

function updateTopbarTitle(title) {
    const titleElement = document.querySelector(
        ".admin-topbar-context strong"
    );

    if (titleElement) {
        titleElement.textContent = title;
    }
}

function showLoading() {
    adminContent.innerHTML = `
        <div class="admin-view-loading">Loading...</div>
    `;
}

function showFatalError(message) {
    adminContent.innerHTML = `
        <section class="admin-view-error">
            <p class="admin-page-kicker">ADMIN ERROR</p>
            <h2>Unable to load page</h2>
            <p>${escapeHtml(message)}</p>
        </section>
    `;
}

function escapeHtml(value) {
    const element = document.createElement("div");
    element.textContent = value ?? "";
    return element.innerHTML;
}