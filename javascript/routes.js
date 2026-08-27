import { API_HOST } from "./api.js";
import { applyAuthState } from "./auth-utils.js";

applyAuthState();

const routesList = document.getElementById("routes-list");
const routesCount = document.getElementById("routes-count");
const searchInput = document.getElementById("routes-search");
const searchForm = document.getElementById("routes-search-form");

let allRoutes = [];

loadRoutes();

async function loadRoutes(keyword = "") {
    if (!routesList) return;

    routesList.innerHTML = '<div class="flights-loading"><p>Loading routes...</p></div>';

    try {
        const url = `${API_HOST}/routes${keyword ? `?keyword=${encodeURIComponent(keyword)}` : ""}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to load routes");
        const routes = await response.json();

        allRoutes = routes;

        if (routesCount) {
            routesCount.textContent = `${routes.length} route${routes.length !== 1 ? "s" : ""} available`;
        }

        if (routes.length === 0) {
            routesList.innerHTML = `
                <div class="flights-empty">
                    <p>No routes found${keyword ? ` matching "${keyword}"` : ""}.</p>
                </div>
            `;
            return;
        }

        routesList.innerHTML = "";
        for (const route of routes) {
            routesList.appendChild(createRouteCard(route));
        }
    } catch (error) {
        console.error("Error loading routes:", error);
        routesList.innerHTML = `
            <div class="flights-empty">
                <p>Could not load routes.</p>
                <button class="button button-primary" onclick="location.reload()">
                    Try again <span aria-hidden="true">→</span>
                </button>
            </div>
        `;
    }
}

function createRouteCard(route) {
    const origin = route.originSpaceportName || "Origin";
    const destination = route.destinationSpaceportName || "Destination";
    const distance = route.distance ? formatDistance(route.distance) : "—";

    const article = document.createElement("article");
    article.className = "route-card";

    article.innerHTML = `
        <div class="route-card-body">
            <div class="route-card-heading">
                <h3>${origin} → ${destination}</h3>
                <span class="flight-status flight-status-available">Active route</span>
            </div>

            <div class="route-card-details">
                <div class="flight-detail-item">
                    <span>Route</span>
                    <strong>${route.routeName || "—"}</strong>
                </div>
                <div class="flight-detail-item">
                    <span>Distance</span>
                    <strong>${distance}</strong>
                </div>
                ${route.description ? `
                <div class="flight-detail-item" style="grid-column:1/-1">
                    <span>About</span>
                    <strong>${route.description}</strong>
                </div>` : ""}
            </div>
        </div>
        <a href="/index.html#booking-search-form" class="button button-primary route-card-cta">
            Search this route <span aria-hidden="true">→</span>
        </a>
    `;

    return article;
}

function formatDistance(km) {
    if (km >= 1000000) return `${(km / 1000000).toFixed(1)}M km`;
    if (km >= 1000) return `${(km / 1000).toFixed(1)}k km`;
    return `${km} km`;
}

if (searchForm) {
    searchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const keyword = searchInput ? searchInput.value.trim() : "";
        loadRoutes(keyword);
    });

    let debounceTimer;
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                loadRoutes(searchInput.value.trim());
            }, 300);
        });
    }
}
