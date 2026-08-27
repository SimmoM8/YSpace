import { apiGet } from "./api.js";
import { applyAuthState } from "./auth-utils.js";

applyAuthState();

const listEl = document.getElementById("spacecraft-list");
const countEl = document.getElementById("spacecraft-count");

loadFleet();

async function loadFleet() {
    if (!listEl) return;

    listEl.innerHTML = '<div class="flights-loading"><p>Loading fleet...</p></div>';

    try {
        const response = await apiGet("/spacecraft");
        const fleet = await response.json();

        if (countEl) {
            countEl.textContent = `${fleet.length} spacecraft in the active fleet`;
        }

        if (fleet.length === 0) {
            listEl.innerHTML = `
                <div class="flights-empty">
                    <p>No spacecraft available.</p>
                </div>
            `;
            return;
        }

        listEl.innerHTML = fleet.map((s) => createCard(s)).join("");
    } catch (error) {
        console.error("Error loading fleet:", error);
        listEl.innerHTML = `
            <div class="flights-empty">
                <p>Could not load the fleet.</p>
                <button class="button button-primary" onclick="location.reload()">
                    Try again <span aria-hidden="true">→</span>
                </button>
            </div>
        `;
    }
}

function createCard(spacecraft) {
    const statusClass =
        spacecraft.status === "RETIRED" ? "flight-status-sold-out" :
        spacecraft.status === "UNDER_MAINTENANCE" ? "flight-status-limited" :
        "flight-status-available";

    return `
        <article class="spacecraft-card">
            <div class="spacecraft-card-head">
                <span class="flight-status ${statusClass}">${readableStatus(spacecraft.status)}</span>
            </div>

            <div class="spacecraft-card-icon" aria-hidden="true">
                <span class="spacecraft-orbit"></span>
                <span class="spacecraft-hull">YS</span>
            </div>

            <h3 class="spacecraft-card-name">${escapeHtml(spacecraft.name || "Unnamed")}</h3>

            <div class="spacecraft-card-meta">
                <div class="flight-detail-item">
                    <span>Model</span>
                    <strong>${escapeHtml(spacecraft.modelName || "—")}</strong>
                </div>
                <div class="flight-detail-item">
                    <span>Manufacturer</span>
                    <strong>${escapeHtml(spacecraft.manufacturer || "—")}</strong>
                </div>
                <div class="flight-detail-item">
                    <span>Seat capacity</span>
                    <strong>${spacecraft.seatCapacity ?? "—"}</strong>
                </div>
            </div>
        </article>
    `;
}

function readableStatus(status) {
    if (!status) return "Unknown";
    return status.split("_").map((w) => w[0] + w.slice(1).toLowerCase()).join(" ");
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
