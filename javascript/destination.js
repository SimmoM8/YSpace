import { apiGet } from "./api.js";
import { applyAuthState } from "./auth-utils.js";

applyAuthState();

const listEl = document.getElementById("destination-list");
const countEl = document.getElementById("destination-count");
const searchForm = document.getElementById("destination-search-form");
const searchInput = document.getElementById("destination-search");

loadDestinations();

async function loadDestinations(keyword = "") {
    if (!listEl) return;

    listEl.innerHTML = '<div class="flights-loading"><p>Loading destinations...</p></div>';

    try {
        const response = await apiGet(`/spaceports?keyword=${encodeURIComponent(keyword)}`);
        const destinations = await response.json();

        if (countEl) {
            countEl.textContent = `${destinations.length} spaceport${destinations.length !== 1 ? "s" : ""} in the network`;
        }

        if (destinations.length === 0) {
            listEl.innerHTML = `
                <div class="flights-empty">
                    <p>No destinations found${keyword ? ` matching "${keyword}"` : ""}.</p>
                </div>
            `;
            return;
        }

        listEl.innerHTML = destinations.map((d) => createCard(d)).join("");
    } catch (error) {
        console.error("Error loading destinations:", error);
        listEl.innerHTML = `
            <div class="flights-empty">
                <p>Could not load destinations.</p>
                <button class="button button-primary" onclick="location.reload()">
                    Try again <span aria-hidden="true">→</span>
                </button>
            </div>
        `;
    }
}

function createCard(destination) {
    const type = destination.spaceportType || "DESTINATION";
    const code = destination.spaceportCode || "—";
    const name = destination.spaceportName || "Unnamed spaceport";

    const typeLabel = type === "STATION"
        ? "Orbital station"
        : type === "MOON"
        ? "Moon"
        : type === "PLANET"
        ? "Planet"
        : "Destination";

    return `
        <article class="destination-card">
            <div class="destination-card-top">
                <span class="destination-code">${escapeHtml(code)}</span>
                <span class="flight-status flight-status-available">${escapeHtml(typeLabel)}</span>
            </div>

            <div class="destination-card-icon" aria-hidden="true">
                <span class="destination-planet destination-planet--${type.toLowerCase()}"></span>
            </div>

            <h3 class="destination-card-name">${escapeHtml(name)}</h3>

            <p class="destination-card-desc">
                ${destination.spaceportDescription ? escapeHtml(destination.spaceportDescription) : "Reachable across the YSpace passenger network."}
            </p>

            <a href="/index.html#booking-search-form" class="button button-outline destination-card-cta">
                Plan a trip <span aria-hidden="true">→</span>
            </a>
        </article>
    `;
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

if (searchForm) {
    searchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        loadDestinations(searchInput ? searchInput.value.trim() : "");
    });

    let debounceTimer;
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                loadDestinations(searchInput.value.trim());
            }, 300);
        });
    }
}
