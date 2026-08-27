import { apiGet, apiPost } from "./api.js";
import { isLoggedIn, applyAuthState, getUserEmail } from "./auth-utils.js";

applyAuthState();

const searchForm = document.getElementById("flight-search-form");
const isIndexPage = !!document.getElementById("booking-search-form");
const isFlightsPage = !!document.querySelector(".flights-page");

const originInput = searchForm.querySelector("#origin-input");
const destinationInput = searchForm.querySelector("#destination-input");
const originHiddenInput = searchForm.querySelector("#origin-hidden-input");
const destinationHiddenInput = searchForm.querySelector("#destination-hidden-input");
const originOptions = searchForm.querySelector("#origin-options");
const destinationOptions = searchForm.querySelector("#destination-options");

originInput.addEventListener("input", async () => {
    originOptions.innerHTML = '<li class="search-options-list-item search-options-loading">Loading...</li>';
    originOptions.innerHTML = await fetchSpaceports(originInput.value);
});

searchForm.querySelector('.search-reverse-button').addEventListener('click', () => {
    [originInput.value, destinationInput.value] = [destinationInput.value, originInput.value];
    [originHiddenInput.value, destinationHiddenInput.value] = [destinationHiddenInput.value, originHiddenInput.value];
    originInput.setCustomValidity('');
    destinationInput.setCustomValidity('');
    originOptions.replaceChildren();
    destinationOptions.replaceChildren();
    originInput.setAttribute('aria-expanded', 'false');
    destinationInput.setAttribute('aria-expanded', 'false');
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

async function fetchRoutes() {
    try {
        const base = "http://localhost:8081";
        const response = await fetch(`${base}/routes`);
        return await response.json();
    } catch (error) {
        console.error("Error loading routes:", error);
        return [];
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
        return;
    }

    await loadFlights(originId, destinationId, date);
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
                    <a href="index.html#booking-search-form" class="button button-primary">
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

        flightList.innerHTML = "";
        for (const flight of flights) {
            flightList.appendChild(createFlightCard(flight));
        }
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

function createFlightCard(flight) {
    const departure = new Date(flight.departureTime);
    const arrival = new Date(flight.arrivalTime);
    const durationMs = arrival - departure;
    const durationDays = Math.floor(durationMs / (1000 * 60 * 60 * 24));
    const durationHours = Math.floor((durationMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const durationStr = durationDays > 0 ? `${durationDays}d ${durationHours}h` : `${durationHours}h`;

    const price = new Intl.NumberFormat("en-US").format(flight.price);

    const article = document.createElement("article");
    article.className = "flight-card";
    article.innerHTML = `
        <div class="flight-card-status">
            <span class="flight-number">${flight.code}</span>
            <span class="flight-status flight-status-available">Available</span>
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

            <button class="button flight-select-button" data-flight-id="${flight.id}">
                Select flight <span aria-hidden="true">→</span>
            </button>
        </div>

        <div class="flight-card-footer">
            <div class="flight-detail">
                <span>Spacecraft</span>
                <strong>${flight.spacecraft}</strong>
            </div>
            <div class="flight-detail">
                <span>Route</span>
                <strong>${flight.originCode} — ${flight.destinationCode} Express</strong>
            </div>
        </div>
    `;

    const selectBtn = article.querySelector(".flight-select-button");
    selectBtn.addEventListener("click", () => handleSelectFlight(flight));

    return article;
}

function formatTime(date) {
    return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });
}

async function handleSelectFlight(flight) {
    if (!isLoggedIn()) {
        window.location.href = `/login.html?redirect=/flights.html${encodeURIComponent(window.location.search)}`;
        return;
    }

    const price = new Intl.NumberFormat("en-US").format(flight.price);
    const confirmed = confirm(
        `Book flight ${flight.code}?\n\n${flight.originName} → ${flight.destinationName}\nPrice: ${price} kr`
    );

    if (!confirmed) return;

    try {
        const response = await apiPost("/bookings", { flightId: flight.id });
        const booking = await response.json();
        alert(`Booking confirmed! Booking ID: ${booking.bookingId}`);
        window.location.href = "/my-bookings.html";
    } catch (error) {
        alert(error.message || "Failed to create booking. Please try again.");
    }
}
