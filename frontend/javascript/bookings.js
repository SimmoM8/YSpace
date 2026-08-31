import { apiGet, apiPatch } from "./api.js";
import { isLoggedIn, applyAuthState } from "./auth-utils.js";

applyAuthState();

if (!isLoggedIn()) {
    window.location.href = "/login.html";
}

const bookingsList = document.getElementById("bookings-list");
const bookingsCount = document.getElementById("bookings-count");

loadBookings();

async function loadBookings() {
    if (!bookingsList) return;

    bookingsList.innerHTML = '<div class="flights-loading"><p>Loading bookings...</p></div>';

    try {
        const response = await apiGet("/bookings");
        const bookings = await response.json();

        if (bookingsCount) {
            bookingsCount.textContent = `${bookings.length} booking${bookings.length !== 1 ? "s" : ""}`;
        }

        if (bookings.length === 0) {
            bookingsList.innerHTML = `
                <div class="flights-empty">
                    <p>You don't have any bookings yet.</p>
                    <a href="index.html#booking-search-form" class="button button-primary">
                        Find a flight <span aria-hidden="true">→</span>
                    </a>
                </div>
            `;
            return;
        }

        bookingsList.innerHTML = "";
        for (const booking of bookings) {
            bookingsList.appendChild(createBookingCard(booking));
        }
    } catch (error) {
        console.error("Error loading bookings:", error);
        bookingsList.innerHTML = `
            <div class="flights-empty">
                <p>Something went wrong while loading your bookings.</p>
                <button class="button button-primary" onclick="location.reload()">
                    Try again <span aria-hidden="true">→</span>
                </button>
            </div>
        `;
    }
}

function createBookingCard(booking) {
    const article = document.createElement("article");
    article.className = "flight-card";

    const departure = booking.departureTime ? new Date(booking.departureTime) : null;
    const departureStr = departure
        ? departure.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" })
        : "TBD";
    const price = new Intl.NumberFormat("en-US").format(booking.totalPrice);

    const statusClass = booking.status === "OPEN"
        ? "flight-status-available"
        : booking.status === "CANCELLED"
            ? "flight-status-sold-out"
            : "flight-status-limited";

    article.innerHTML = `
        <div class="flight-card-status">
            <span class="flight-number">Booking #${booking.bookingId}</span>
            <span class="flight-status ${statusClass}">${booking.status}</span>
        </div>

        <div class="flight-card-main">
            <div class="flight-time">
                <span class="flight-time-value">${departureStr}</span>
                <strong>${booking.routeName || "—"}</strong>
                <span>Route</span>
            </div>

            <div class="flight-journey">
                <div class="flight-price">
                    <span>Total</span>
                    <strong>${price} kr</strong>
                </div>
            </div>

            <div class="flight-time flight-time-arrival">
                <span class="flight-time-value">Created</span>
                <strong>${new Date(booking.createdAt).toLocaleDateString("en-US")}</strong>
                <span>${booking.status}</span>
            </div>

            ${booking.status === "OPEN"
                ? `<button class="button flight-select-button" data-booking-id="${booking.bookingId}">
                    Cancel booking <span aria-hidden="true">→</span>
                </button>`
                : `<span class="button flight-select-button flight-select-button-disabled">${booking.status}</span>`
            }
        </div>
    `;

    const cancelBtn = article.querySelector("[data-booking-id]");
    if (cancelBtn) {
        cancelBtn.addEventListener("click", () => handleCancelBooking(booking.bookingId));
    }

    return article;
}

async function handleCancelBooking(bookingId) {
    const confirmed = confirm(`Cancel booking #${bookingId}?`);
    if (!confirmed) return;

    try {
        await apiPatch(`/bookings/${bookingId}/cancel`);
        alert("Booking cancelled.");
        loadBookings();
    } catch (error) {
        alert(error.message || "Failed to cancel booking.");
    }
}
