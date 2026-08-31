import { apiGet } from "../../javascript/api.js";

import {
    initFlightsPage
} from "./pages/flights.js";

import {
    initDashboardPage
} from "./pages/dashboard.js";

import {
    initScheduleFlightPage
} from "./pages/schedule-flight.js";

import {
    initRoutesPage
} from "./pages/routes.js";

import {
    initBookingsPage
} from "./pages/bookings.js";

import {
    initUsersPage
} from "./pages/users.js";

import {
    initSpaceportsPage
} from "./pages/spaceports.js";

import {
    initSpacecraftPage
} from "./pages/spacecraft.js";


const adminContent =
    document.getElementById(
        "admin-content"
    );


const routes = {

    dashboard: {
        view: "views/dashboard.html",
        title: "Dashboard",
        init: initDashboardPage
    },

    "create-flight": {
        view: "views/schedule-flight.html",
        title: "Schedule Flight",
        init: initScheduleFlightPage
    },

    flights: {
        view: "views/flights.html",
        title: "Flights",
        init: initFlightsPage
    },

    routes: {
        view: "views/routes.html",
        title: "Routes",
        init: initRoutesPage
    },

    spaceports: {
        view: "views/spaceports.html",
        title: "Spaceports",
        init: initSpaceportsPage
    },

    spacecraft: {
        view: "views/spacecraft.html",
        title: "Spacecraft",
        init: initSpacecraftPage
    },

    bookings: {
        view: "views/bookings.html",
        title: "Bookings",
        init: initBookingsPage
    },

    users: {
        view: "views/users.html",
        title: "Passengers",
        init: initUsersPage
    }

};


document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const allowed =
            await protectAdminPage();

        if (!allowed) {
            return;
        }


        window.addEventListener(
            "hashchange",
            handleRoute
        );


        await handleRoute();
    }
);


async function protectAdminPage() {

    const token =
        localStorage.getItem("token");


    if (!token) {

        redirectToLogin();

        return false;
    }


    try {

        /*
         * The browser does not decide whether
         * the user is an administrator.
         *
         * Spring Security does.
         */
        await apiGet(
            "/admin/check"
        );

        return true;

    } catch (error) {

        console.error(
            "Admin access rejected:",
            error
        );


        if (error.status === 401) {

            localStorage.removeItem(
                "token"
            );

            redirectToLogin();

            return false;
        }


        if (error.status === 403) {

            window.location.href =
                "/index.html";

            return false;
        }


        showFatalError(
            "Could not verify administrator access."
        );

        return false;
    }
}


function redirectToLogin() {

    const redirect =
        encodeURIComponent(
            "/admin/"
        );

    window.location.href =
        `/login.html?redirect=${redirect}`;
}


async function handleRoute() {

    const {
        page,
        id
    } = getRoute();


    let normalizedPage = page;

    /*
     * Individual flight details are the next
     * admin view we'll implement.
     *
     * The URL format is already reserved.
     */
    if (
        page === "flight" &&
        id
    ) {

        window.location.hash =
            "flights";

        return;
    }


    if (normalizedPage === "create-flight") {
        normalizedPage = "create-flight";
    }


    const route =
        routes[normalizedPage] ??
        routes.dashboard;


    updateNavigation(normalizedPage);

    await loadView(route);
}


function getRoute() {

    const hash =
        window.location.hash
            .substring(1)
        ||
        "dashboard";


    const [page, id] =
        hash.split("/");


    return {
        page,
        id
    };
}


async function loadView(route) {

    try {

        showLoading();


        const response =
            await fetch(
                route.view
            );


        if (!response.ok) {

            throw new Error(
                `Could not load ${route.title}.`
            );
        }


        const html =
            await response.text();


        adminContent.innerHTML =
            html;


        updatePageTitle(
            route.title
        );

        updateTopbarTitle(
            route.title
        );


        if (route.init) {

            await route.init();
        }

    } catch (error) {

        console.error(error);

        showFatalError(
            error.message ||
            "Unable to load page."
        );
    }
}


function updateNavigation(page) {

    const navigationPage =
        page === "flight"
            ? "flights"
            : page === "create-flight"
                ? "flights"
                : page;


    document
        .querySelectorAll(
            ".admin-nav-item"
        )
        .forEach((link) => {

            link.classList.remove(
                "admin-nav-item-active"
            );

            link.removeAttribute(
                "aria-current"
            );


            if (
                link.getAttribute(
                    "href"
                )
                ===
                `#${navigationPage}`
            ) {

                link.classList.add(
                    "admin-nav-item-active"
                );

                link.setAttribute(
                    "aria-current",
                    "page"
                );
            }
        });
}


function updatePageTitle(title) {

    document.title =
        `${title} — YSpace Admin`;
}


function updateTopbarTitle(title) {

    const titleElement =
        document.querySelector(
            ".admin-topbar-context strong"
        );


    if (titleElement) {

        titleElement.textContent =
            title;
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

            <p class="admin-page-kicker">
                ADMIN ERROR
            </p>

            <h2>
                Unable to load page
            </h2>

            <p>
                ${escapeHtml(message)}
            </p>

        </section>
    `;
}


function escapeHtml(value) {

    const element =
        document.createElement("div");

    element.textContent =
        value ?? "";

    return element.innerHTML;
}
