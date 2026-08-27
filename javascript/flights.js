import { apiGet, apiPost } from "./api.js";
import { isLoggedIn, applyAuthState } from "./auth-utils.js";
import { openModal, closeModal, confirmDialog } from "./modal.js";

applyAuthState();

const searchForm = document.getElementById("flight-search-form");
const isFlightsPage = !!document.querySelector(".flights-page");

const originInput = searchForm.querySelector("#origin-input");
const destinationInput = searchForm.querySelector("#destination-input");
const originHiddenInput = searchForm.querySelector("#origin-hidden-input");
const destinationHiddenInput = searchForm.querySelector("#destination-hidden-input");
const originOptions = searchForm.querySelector("#origin-options");
const destinationOptions = searchForm.querySelector("#destination-options");

let currentFlights = [];

originInput.addEventListener("input", async () => {
    originOptions.innerHTML = '<li class="search-options-list-item search-options-loading">Loading...</li>';
    originOptions.innerHTML = await fetchSpaceports(originInput.value);
});

destinationInput.addEventListener("input", async () => {
    destinationOptions.innerHTML = '<li class="search-options-list-item search-options-loading">Loading...</li>';
    destinationOptions.innerHTML = await fetchSpaceports(destinationInput.value);
});

originOptions.addEventListener("click", (event) => {
    const selectedOption = event.target.closest(".search-options-list-item");
    if (selectedOption) {
        originInput.value = selectedOption.dataset.name;
        originHiddenInput.value = selectedOption.dataset.id;
        originOptions.innerHTML = "";
    } else {
        originOptions.innerHTML = "";
    }
});

destinationOptions.addEventListener("click", (event) => {
    const selectedOption = event.target.closest(".search-options-list-item");
    if (selectedOption) {
        destinationInput.value = selectedOption.dataset.name;
        destinationHiddenInput.value = selectedOption.dataset.id;
        destinationOptions.innerHTML = "";
    } else {
        destinationOptions.innerHTML = "";
    }
});

document.addEventListener("click", (event) => {
    if (!event.target.closest(".search-input-wrapper")) {
        originOptions.innerHTML = "";
        destinationOptions.innerHTML = "";
    }
});

searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    performSearch();
});

function performSearch() {
    const originId = originHiddenInput.value;
    const destinationId = destinationHiddenInput.value;
    const dateInput = searchForm.querySelector('[name="departure-date"]');
    const date = dateInput ? dateInput.value : "";

    if (!originId || !destinationId) {
        return;
    }

    const params = new URLSearchParams();
    params.set("originId", originId);
    params.set("destinationId", destinationId);
    if (date) params.set("date", date);

    window.location.href = `/flights.html?${params.toString()}`;
}

async function fetchSpaceports(keyword) {
    try {
        const response = await apiGet(`/spaceports?keyword=${encodeURIComponent(keyword)}`);
        const spaceports = await response.json();

        let html = "";
        for (const sp of spaceports) {
            html += `<li class="search-options-list-item" data-id="${sp.spaceportId}" data-name="${sp.spaceportName}">${sp.spaceportName} (${sp.spaceportCode || ""})</li>`;
        }
        return html;
    } catch (error) {
        console.error("Error loading spaceports:", error);
        return "";
    }
}

if (isFlightsPage) {
    initFlightsPage();
}

async function initFlightsPage() {
    const params = new URLSearchParams(window.location.search);
    const originId = params.get("originId");
    const destinationId = params.get("destinationId");
    const date = params.get("date");

    if (originId) originHiddenInput.value = originId;
    if (destinationId) destinationHiddenInput.value = destinationId;
    if (date) {
        const dateInput = searchForm.querySelector('[name="departure-date"]');
        if (dateInput) dateInput.value = date;
    }

    if (!originId || !destinationId) {
        showEmptyState();
        return;
    }

    await loadFlights(originId, destinationId, date);
}

function showEmptyState() {
    const flightList = document.querySelector(".flight-list");
    const resultsHeader = document.querySelector(".flights-results-header");
    if (!flightList) return;

    const resultsCount = document.querySelector(".flights-results-header h2");
    if (resultsCount) resultsCount.textContent = "Search for a route";
    if (resultsHeader) {
        const kicker = resultsHeader.querySelector(".flights-results-kicker");
        if (kicker) kicker.textContent = "READY TO TRAVEL";
    }

    flightList.innerHTML = `
        <div class="flights-empty">
            <p>Choose an origin and destination above to see available flights.</p>
            <a href="/index.html#booking-search-form" class="button button-primary">
                Start your search <span aria-hidden="true">→</span>
            </a>
        </div>
    `;
}

async function loadFlights(originId, destinationId, date) {
    const flightList = document.querySelector(".flight-list");
    const resultsHeader = document.querySelector(".flights-results-header");
    const resultsKicker = document.querySelector(".flights-results-kicker");
    const resultsCount = document.querySelector(".flights-results-header h2");
    const resultsDate = document.querySelector(".flights-results-date");

    if (!flightList) return;

    flightList.innerHTML = '<div class="flights-loading"><p>Loading flights...</p></div>';

    try {
        let url = `/flights/search?originId=${originId}&destinationId=${destinationId}`;
        if (date) url += `&date=${date}`;

        const response = await apiGet(url);
        const flights = await response.json();

        if (flights.length === 0) {
            flightList.innerHTML = `
                <div class="flights-empty">
                    <p>No flights found for this route and date.</p>
                    <a href="/index.html#booking-search-form" class="button button-primary">
                        Search again <span aria-hidden="true">→</span>
                    </a>
                </div>
            `;
            if (resultsCount) resultsCount.textContent = "0 departures found";
            return;
        }

        if (resultsKicker && flights.length > 0) {
            resultsKicker.textContent = `${flights[0].originCode} → ${flights[0].destinationCode}`;
        }
        if (resultsCount) resultsCount.textContent = `${flights.length} departure${flights.length !== 1 ? "s" : ""} found`;
        if (resultsDate && date) {
            const d = new Date(date + "T00:00:00");
            resultsDate.textContent = d.toLocaleDateString("en-US", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            });
        }

        currentFlights = flights;
        renderFlights(flights);
    } catch (error) {
        console.error("Error loading flights:", error);
        flightList.innerHTML = `
            <div class="flights-empty">
                <p>Something went wrong while loading flights.</p>
                <button class="button button-primary" onclick="location.reload()">
                    Try again <span aria-hidden="true">→</span>
                </button>
            </div>
        `;
    }
}

function renderFlights(flights) {
    const flightList = document.querySelector(".flight-list");
    if (!flightList) return;

    flightList.innerHTML = "";
    for (const flight of flights) {
        flightList.appendChild(createFlightCard(flight));
    }
}

function isFlightBookable(flight) {
    return flight.status !== "CANCELLED" && flight.status !== "DEPARTED" && flight.status !== "ARRIVED" && flight.status !== "IN_FLIGHT";
}

function getFlightStatus(flight) {
    if (!flight.status || flight.status === "SCHEDULED" || flight.status === "BOARDING") {
        return { label: flight.status === "BOARDING" ? "Boarding" : "Available", cls: "flight-status-available" };
    }
    if (flight.status === "CANCELLED") {
        return { label: "Cancelled", cls: "flight-status-sold-out" };
    }
    if (flight.status === "DEPARTED" || flight.status === "IN_FLIGHT") {
        return { label: flight.status === "DEPARTED" ? "Departed" : "In flight", cls: "flight-status-limited" };
    }
    if (flight.status === "ARRIVED") {
        return { label: "Arrived", cls: "flight-status-limited" };
    }
    return { label: flight.status, cls: "flight-status-limited" };
}

function createFlightCard(flight) {
    const departure = new Date(flight.departureTime);
    const arrival = new Date(flight.arrivalTime);
    const durationMs = arrival - departure;
    const durationDays = Math.floor(durationMs / (1000 * 60 * 60 * 24));
    const durationHours = Math.floor((durationMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const durationStr = durationDays > 0 ? `${durationDays}d ${durationHours}h` : `${durationHours}h`;

    const price = formatPrice(flight.price);
    const status = getFlightStatus(flight);
    const bookable = isFlightBookable(flight);
    const delayedLabel = flight.delayed ? '<span class="flight-delayed-badge">Delayed</span>' : "";

    const article = document.createElement("article");
    article.className = `flight-card ${!bookable ? "flight-card-unavailable" : ""}`;
    article.innerHTML = `
        <div class="flight-card-status">
            <span class="flight-number">${flight.code}</span>
            <span class="flight-status ${status.cls}">${status.label}</span>
            ${delayedLabel}
        </div>

        <div class="flight-card-main">
            <div class="flight-time">
                <span class="flight-time-value">${formatTime(departure)}</span>
                <strong>${flight.originCode}</strong>
                <span>${flight.originName}</span>
            </div>

            <div class="flight-journey">
                <span class="flight-duration">${durationStr}</span>
                <div class="flight-route">
                    <span class="flight-route-point"></span>
                    <span class="flight-route-line"></span>
                    <span class="flight-craft-icon">✦</span>
                    <span class="flight-route-line"></span>
                    <span class="flight-route-point"></span>
                </div>
                <span class="flight-route-type">Direct</span>
            </div>

            <div class="flight-time flight-time-arrival">
                <span class="flight-time-value">${formatTime(arrival)}</span>
                <strong>${flight.destinationCode}</strong>
                <span>${flight.destinationName}</span>
            </div>

            <div class="flight-price">
                <span>From</span>
                <strong>${price} kr</strong>
                <small>per passenger</small>
            </div>

            ${bookable
                ? `<button class="button flight-select-button" data-flight-id="${flight.id}">
                    Select flight <span aria-hidden="true">→</span>
                  </button>`
                : `<span class="button flight-select-button flight-select-button-disabled">${status.label}</span>`
            }
        </div>

        <div class="flight-card-footer">
            <div class="flight-detail">
                <span>Spacecraft</span>
                <strong>${flight.spacecraft || "—"}</strong>
            </div>
            <div class="flight-detail">
                <span>Route</span>
                <strong>${flight.originCode} → ${flight.destinationCode}</strong>
            </div>
            <div class="flight-detail" style="margin-left:auto">
                <button class="flight-details-link" data-flight-id="${flight.id}">Details</button>
            </div>
        </div>
    `;

    const selectBtn = article.querySelector(".flight-select-button");
    if (selectBtn) {
        selectBtn.addEventListener("click", () => handleSelectFlight(flight));
    }

    const detailsLink = article.querySelector(".flight-details-link");
    if (detailsLink) {
        detailsLink.addEventListener("click", () => openFlightDetails(flight));
    }

    return article;
}

function formatPrice(value) {
    if (value === null || value === undefined) return "0";
    return new Intl.NumberFormat("en-US").format(Number(value));
}

function formatTime(date) {
    return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });
}

async function openFlightDetails(flight) {
    let details = flight;
    try {
        const response = await apiGet(`/flights/${flight.id}`);
        details = await response.json();
    } catch (error) {
        console.error("Error loading flight details:", error);
    }

    const departure = new Date(details.departureTime);
    const arrival = new Date(details.arrivalTime);

    const body = `
        <div class="flight-modal-summary">
            <div>
                <div class="flight-modal-route">${details.originCode} → ${details.destinationCode}</div>
                <div class="flight-modal-times">
                    <span>${formatDateTime(departure)}</span>
                    <span class="arrow">→</span>
                    <span>${formatDateTime(arrival)}</span>
                </div>
            </div>
            <div class="flight-modal-price">
                <span>From</span>
                <strong>${formatPrice(details.price)} kr</strong>
            </div>
        </div>

        <div class="flight-detail-grid">
            <div class="flight-detail-item">
                <span>Flight</span>
                <strong>${details.code}</strong>
            </div>
            <div class="flight-detail-item">
                <span>Status</span>
                <strong>${details.delayed ? "Delayed" : details.status || "Scheduled"}</strong>
            </div>
            <div class="flight-detail-item">
                <span>Spacecraft</span>
                <strong>${details.spacecraftName || "—"}</strong>
            </div>
            <div class="flight-detail-item">
                <span>Model</span>
                <strong>${details.spacecraftModel || "—"}</strong>
            </div>
            <div class="flight-detail-item">
                <span>Manufacturer</span>
                <strong>${details.spacecraftManufacturer || "—"}</strong>
            </div>
            <div class="flight-detail-item">
                <span>Distance</span>
                <strong>${details.distance ? formatDistance(details.distance) : "—"}</strong>
            </div>
            <div class="flight-detail-item">
                <span>Route</span>
                <strong>${details.routeName || "—"}</strong>
            </div>
            <div class="flight-detail-item">
                <span>Origin</span>
                <strong>${details.originName} (${details.originCode})</strong>
            </div>
            <div class="flight-detail-item">
                <span>Destination</span>
                <strong>${details.destinationName} (${details.destinationCode})</strong>
            </div>
            ${details.routeDescription ? `
                <div class="flight-detail-item" style="grid-column:1/-1">
                    <span>About this route</span>
                    <strong>${details.routeDescription}</strong>
                </div>
            ` : ""}
        </div>
    `;

    const footer = isFlightBookable(details)
        ? `<button class="button button-primary app-modal-confirm-book" data-flight-id="${details.id}">Book this flight <span aria-hidden="true">→</span></button>`
        : `<span class="button flight-select-button-disabled">Not available for booking</span>`;

    openModal({
        title: `${details.code} — Flight details`,
        body,
        footer
    });

    const bookBtn = document.querySelector(".app-modal-confirm-book");
    if (bookBtn) {
        bookBtn.addEventListener("click", () => {
            closeModal();
            handleSelectFlight(details);
        });
    }
}

function formatDateTime(date) {
    return date.toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });
}

function formatDistance(km) {
    if (km >= 1000000) return `${(km / 1000000).toFixed(1)}M km`;
    if (km >= 1000) return `${(km / 1000).toFixed(1)}k km`;
    return `${km} km`;
}

async function handleSelectFlight(flight) {
    if (!isLoggedIn()) {
        window.location.href = `/login.html?redirect=/flights.html${encodeURIComponent(window.location.search)}`;
        return;
    }

    const price = formatPrice(flight.price);

    const confirmed = await confirmDialog({
        title: `Book flight ${flight.code}?`,
        message: `${flight.originName} → ${flight.destinationName}<br><strong>${price} kr</strong> per passenger.`,
        confirmText: "Confirm booking",
        danger: false
    });

    if (!confirmed) return;

    try {
        const response = await apiPost("/bookings", { flightId: flight.id });
        const booking = await response.json();
        showBookingConfirmed(booking);
    } catch (error) {
        openModal({
            title: "Booking failed",
            body: `<p>${error.message || "Something went wrong. Please try again."}</p>`,
            footer: `<button class="button button-primary app-modal-ok">OK</button>`
        });
        document.querySelector(".app-modal-ok")?.addEventListener("click", closeModal);
    }
}

function showBookingConfirmed(booking) {
    const rows = (booking.bookingRows || []).map((row) => {
        return `
            <div class="flight-detail-grid">
                <div class="flight-detail-item"><span>Flight</span><strong>${row.flightCode}</strong></div>
                <div class="flight-detail-item"><span>Route</span><strong>${row.routeName || "—"}</strong></div>
                <div class="flight-detail-item"><span>Departs</span><strong>${row.departureTime ? formatDateTime(new Date(row.departureTime)) : "—"}</strong></div>
                <div class="flight-detail-item"><span>Arrives</span><strong>${row.arrivalTime ? formatDateTime(new Date(row.arrivalTime)) : "—"}</strong></div>
            </div>
        `;
    }).join("");

    openModal({
        title: "Booking confirmed 🚀",
        body: `
            <p><strong>Booking #${booking.bookingId}</strong> has been created.</p>
            <p>Status: <strong>${booking.status}</strong></p>
            <div class="flight-modal-summary">
                <div>
                    <div class="flight-modal-route">Total</div>
                </div>
                <div class="flight-modal-price">
                    <strong>${formatPrice(booking.totalPrice)} kr</strong>
                </div>
            </div>
            ${rows}
        `,
        footer: `
            <button class="button button-outline app-modal-close-link">Close</button>
            <a class="button button-primary" href="/my-bookings.html">View my bookings <span aria-hidden="true">→</span></a>
        `
    });
    document.querySelector(".app-modal-close-link")?.addEventListener("click", closeModal);
}

// Sort

const sortSelect = document.getElementById("flight-sort");
if (sortSelect) {
    sortSelect.addEventListener("change", () => {
        const sortBy = sortSelect.value;
        const sorted = [...currentFlights];

        if (sortBy === "Departure time") {
            sorted.sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));
        } else if (sortBy === "Lowest price") {
            sorted.sort((a, b) => Number(a.price) - Number(b.price));
        } else if (sortBy === "Shortest journey") {
            sorted.sort((a, b) => {
                const da = new Date(a.arrivalTime) - new Date(a.departureTime);
                const db = new Date(b.arrivalTime) - new Date(b.departureTime);
                return da - db;
            });
        } else {
            return; // Recommended: keep original order
        }

        renderFlights(sorted);
    });
}
