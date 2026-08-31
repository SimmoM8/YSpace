import { apiGet } from "../../javascript/api.js";

import { initDashboardPage } from "./pages/dashboard.js";
import { initFlightsPage } from "./pages/flights.js";
import { initCreateFlightPage } from "./pages/create-flight.js";
import {
    initRoutesPage,
    initCreateRoutePage,
} from "./pages/routes.js";
import {
    initSpaceportsPage,
    initCreateSpaceportPage,
} from "./pages/spaceports.js";
import {
    initSpacecraftPage,
    initCreateSpacecraftPage,
} from "./pages/spacecraft.js";
import { initBookingsPage } from "./pages/bookings.js";
import { initUsersPage } from "./pages/users.js";

const adminContent = document.getElementById("admin-content");

const routes = {
    dashboard: {
        view: "views/dashboard.html",
        title: "Dashboard",
        init: initDashboardPage,
    },

    flights: {
        view: "views/flights.html",
        title: "Flights",
        init: initFlightsPage,
    },

    "create-flight": {
        view: "views/create-flight.html",
        title: "Schedule Flight",
        init: initCreateFlightPage,
    },

    routes: {
        view: "views/routes.html",
        title: "Routes",
        init: initRoutesPage,
    },

    "create-route": {
        view: "views/create-route.html",
        title: "Create Route",
        init: initCreateRoutePage,
    },

    spaceports: {
        view: "views/spaceports.html",
        title: "Spaceports",
        init: initSpaceportsPage,
    },

    "create-spaceport": {
        view: "views/create-spaceport.html",
        title: "Add Spaceport",
        init: initCreateSpaceportPage,
    },

    spacecrafts: {
        view: "views/spacecrafts.html",
        title: "Spacecraft",
        init: initSpacecraftPage,
    },

    "create-spacecraft": {
        view: "views/create-spacecraft.html",
        title: "Add Spacecraft",
        init: initCreateSpacecraftPage,
    },

    bookings: {
        view: "views/bookings.html",
        title: "Bookings",
        init: initBookingsPage,
    },

    "create-booking": {
        view: "views/create-booking.html",
        title: "Create Booking",
    },

    passengers: {
        view: "views/passengers.html",
        title: "Passengers",
        init: initUsersPage,
    },

    "create-passenger": {
        view: "views/create-passenger.html",
        title: "Add Passenger",
    },
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
            window.location.href = "../index.html";

            return false;
        }

        showFatalError("Could not verify administrator access.");

        return false;
    }
}

function redirectToLogin() {
    const redirect = encodeURIComponent("/admin/");

    window.location.href = `../login.html?redirect=${redirect}`;
}

async function handleRoute() {
    const page = getPage();
    const route = routes[page] ?? routes.dashboard;

    updateNavigation(page);

    await loadView(route);
}

function getPage() {
    return window.location.hash.substring(1) || "dashboard";
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
    const navigationPage = getNavigationPage(page);

    document.querySelectorAll(".admin-nav-item").forEach((link) => {
        const active = link.getAttribute("href") === `#${navigationPage}`;

        link.classList.toggle("admin-nav-item-active", active);

        if (active) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });
}

function getNavigationPage(page) {
    const parentPages = {
        "create-flight": "flights",
        "create-route": "routes",
        "create-spaceport": "spaceports",
        "create-spacecraft": "spacecrafts",
        "create-booking": "bookings",
        "create-passenger": "passengers",
    };

    return parentPages[page] ?? page;
}

function updatePageTitle(title) {
    document.title = `${title} — YSpace Admin`;
}

function updateTopbarTitle(title) {
    const titleElement = document.querySelector(
        ".admin-topbar-context strong",
    );

    if (titleElement) {
        titleElement.textContent = title;
    }
}

function showLoading() {
    adminContent.innerHTML = `
        <div class="admin-view-loading">
            Loading...
        </div>
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