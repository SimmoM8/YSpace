import { apiGet, apiPatch } from "./api.js";
import { isLoggedIn, applyAuthState } from "./auth-utils.js";
import { openModal, closeModal, confirmDialog } from "./modal.js";

applyAuthState();

if (!isLoggedIn()) {
    const params = new URLSearchParams(window.location.search);
    params.set("redirect", "/my-bookings.html");
    window.location.href = `/login.html?${params.toString()}`;
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
                    <a href="/index.html#booking-search-form" class="button button-primary">
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
    const price = formatPrice(booking.totalPrice);

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

            <div class="flight-card-actions">
                <button class="button button-outline flight-card-action" data-view="${booking.bookingId}">
                    Details
                </button>
                ${booking.status === "OPEN"
                    ? `<button class="button flight-select-button flight-card-action" data-cancel="${booking.bookingId}">
                        Cancel
                      </button>`
                    : ""
                }
            </div>
        </div>
    `;

    const viewBtn = article.querySelector("[data-view]");
    if (viewBtn) {
        viewBtn.addEventListener("click", () => openBookingDetails(booking.bookingId));
    }

    const cancelBtn = article.querySelector("[data-cancel]");
    if (cancelBtn) {
        cancelBtn.addEventListener("click", () => handleCancelBooking(booking.bookingId));
    }

    return article;
}

function formatPrice(value) {
    if (value === null || value === undefined) return "0";
    return new Intl.NumberFormat("en-US").format(Number(value));
}

function formatDateTime(date) {
    return date.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

async function openBookingDetails(bookingId) {
    openModal({
        title: "Loading booking...",
        body: `<p>Fetching your booking details...</p>`
    });

    try {
        const response = await apiGet(`/bookings/${bookingId}`);
        const booking = await response.json();

        const rows = (booking.bookingRows || []).map((row) => `
            <div class="flight-detail-grid">
                <div class="flight-detail-item"><span>Flight</span><strong>${row.flightCode}</strong></div>
                <div class="flight-detail-item"><span>Route</span><strong>${row.routeName || "—"}</strong></div>
                <div class="flight-detail-item"><span>From</span><strong>${row.originName} (${row.originCode})</strong></div>
                <div class="flight-detail-item"><span>To</span><strong>${row.destinationName} (${row.destinationCode})</strong></div>
                <div class="flight-detail-item"><span>Departs</span><strong>${row.departureTime ? formatDateTime(new Date(row.departureTime)) : "—"}</strong></div>
                <div class="flight-detail-item"><span>Price</span><strong>${formatPrice(row.price)} kr</strong></div>
            </div>
        `).join("");

        const statusClass = booking.status === "OPEN"
            ? "flight-status-available"
            : booking.status === "CANCELLED"
                ? "flight-status-sold-out"
                : "flight-status-limited";

        openModal({
            title: `Booking #${booking.bookingId}`,
            body: `
                <div class="flight-modal-summary">
                    <div>
                        <div class="flight-modal-route">Status: ${booking.status}</div>
                        <div class="flight-modal-times">Booked ${new Date(booking.createdAt).toLocaleDateString("en-US")}</div>
                    </div>
                    <div class="flight-modal-price">
                        <span>Total</span>
                        <strong>${formatPrice(booking.totalPrice)} kr</strong>
                    </div>
                </div>
                ${rows}
            `,
            footer: booking.status === "OPEN"
                ? `<button class="button app-modal-danger app-modal-cancel-booking">Cancel booking</button>
                   <button class="button button-primary app-modal-close-link">Close</button>`
                : `<button class="button button-primary app-modal-close-link">Close</button>`
        });

        document.querySelector(".app-modal-close-link")?.addEventListener("click", closeModal);

        const cancelBtn = document.querySelector(".app-modal-cancel-booking");
        if (cancelBtn) {
            cancelBtn.addEventListener("click", async () => {
                const confirmed = await confirmDialog({
                    title: `Cancel booking #${booking.bookingId}?`,
                    message: "This action cannot be undone.",
                    confirmText: "Cancel booking",
                    danger: true
                });
                if (confirmed) {
                    try {
                        await apiPatch(`/bookings/${bookingId}/cancel`);
                        closeModal();
                        showToast("Booking cancelled.");
                        loadBookings();
                    } catch (error) {
                        openModal({
                            title: "Error",
                            body: `<p>${error.message || "Could not cancel booking."}</p>`,
                            footer: `<button class="button button-primary app-modal-ok">OK</button>`
                        });
                        document.querySelector(".app-modal-ok")?.addEventListener("click", closeModal);
                    }
                }
            });
        }
    } catch (error) {
        openModal({
            title: "Error",
            body: `<p>Could not load booking details.</p>`,
            footer: `<button class="button button-primary app-modal-ok">OK</button>`
        });
        document.querySelector(".app-modal-ok")?.addEventListener("click", closeModal);
    }
}

async function handleCancelBooking(bookingId) {
    const confirmed = await confirmDialog({
        title: `Cancel booking #${bookingId}?`,
        message: "This action cannot be undone.",
        confirmText: "Cancel booking",
        cancelText: "Keep booking",
        danger: true
    });

    if (!confirmed) return;

    try {
        await apiPatch(`/bookings/${bookingId}/cancel`);
        showToast("Booking cancelled.");
        loadBookings();
    } catch (error) {
        openModal({
            title: "Error",
            body: `<p>${error.message || "Could not cancel booking."}</p>`,
            footer: `<button class="button button-primary app-modal-ok">OK</button>`
        });
        document.querySelector(".app-modal-ok")?.addEventListener("click", closeModal);
    }
}

function showToast(message) {
    const existing = document.querySelector(".app-toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.className = "app-toast";
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("app-toast--show");
    }, 10);

    setTimeout(() => {
        toast.classList.remove("app-toast--show");
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
