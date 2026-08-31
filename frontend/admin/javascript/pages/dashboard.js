import { apiGet } from "../../../javascript/api.js";

export async function initDashboardPage() {
    const statsGrid = document.querySelector(".admin-stats-grid");

    try {
        const response = await apiGet("/admin/dashboard");

        const data = await response.json();

        renderStats(data);

        renderUpcomingFlights(data);

        renderRecentBookings(data);

        renderNetworkMetrics(data);
    } catch (error) {
        console.error(error);

        statsGrid?.setAttribute("class", "admin-stats-grid admin-view-error");

        if (statsGrid) {
            statsGrid.innerHTML = `
                <p class="admin-page-kicker">ADMIN ERROR</p>
                <h2>Could not load dashboard</h2>
                <p>${escapeHtml(error.message || "Unknown error.")}</p>
            `;
        }
    }
}

function renderStats(data) {
    const statCards = document.querySelectorAll(".admin-stat-value[data-stat]");

    const values = {
        scheduled: data.scheduledFlights,
        bookings: data.openBookings,
        passengers: data.totalPassengers,
    };

    statCards.forEach((card) => {
        const key = card.getAttribute("data-stat");

        if (values[key] !== undefined) {
            card.innerHTML = String(values[key]);
        }
    });
}

function renderUpcomingFlights(data) {
    const tableBody = document.querySelector("#dashboard-upcoming-flights tbody");

    if (!tableBody) {
        return;
    }

    const flights = data.upcomingFlights || [];

    if (!flights.length) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="admin-table-empty">
                    No upcoming flights.
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = flights.map(createFlightRow).join("");
}

function createFlightRow(flight) {
    const capacity = Number(flight.seatCapacity ?? 0);

    const booked = Number(flight.bookedSeats ?? 0);

    const load =
        capacity > 0 ? Math.min(100, Math.round((booked / capacity) * 100)) : 0;

    const statusClass =
        flight.status === "BOARDING"
            ? "admin-status-active"
            : "admin-status-scheduled";

    return `
        <tr>
            <td>
                <strong class="admin-flight-number">
                    ${escapeHtml(flight.code)}
                </strong>
            </td>

            <td>
                <div class="admin-route">
                    <strong>${escapeHtml(flight.originCode)}</strong>
                    <span aria-hidden="true">→</span>
                    <strong>${escapeHtml(flight.destinationCode)}</strong>
                </div>
                <small>${escapeHtml(flight.originName)} · ${escapeHtml(flight.destinationName)}</small>
            </td>

            <td>
                <strong>${formatDateTime(flight.departureTime)}</strong>
            </td>

            <td>
                <span>${escapeHtml(flight.spacecraftName)}</span>
            </td>

            <td>
                <div class="admin-load">
                    <span>${load}%</span>
                    <div class="admin-progress">
                        <span style="width: ${load}%"></span>
                    </div>
                </div>
            </td>

            <td>
                <span class="admin-status ${statusClass}">
                    ${formatStatus(flight.status)}
                </span>
            </td>
        </tr>
    `;
}

function renderRecentBookings(data) {
    const container = document.querySelector("#dashboard-recent-bookings");

    if (!container) {
        return;
    }

    const bookings = data.recentBookings || [];

    if (!bookings.length) {
        container.innerHTML = `
            <div class="admin-booking-row">
                <span class="admin-table-empty">No recent bookings.</span>
            </div>
        `;
        return;
    }

    container.innerHTML = bookings.map(createBookingRow).join("");
}

function createBookingRow(booking) {
    return `
        <div class="admin-booking-row">
            <div class="admin-booking-reference">
                <strong>#${booking.id}</strong>
                <span>${escapeHtml(booking.userName)}</span>
            </div>

            <div class="admin-booking-route">
                <strong>
                    ${escapeHtml(booking.originCode || "—")}
                    → ${escapeHtml(booking.destinationCode || "—")}
                </strong>
                <span>Flight ${escapeHtml(booking.flightCode || "—")}</span>
            </div>

            <div class="admin-booking-date">
                <strong>$${Number(booking.totalPrice ?? 0).toFixed(2)}</strong>
                <span>${booking.createdAt}</span>
            </div>

            ${createStatusBadge(booking.status)}
        </div>
    `;
}

function renderNetworkMetrics(data) {
    const metrics = document.querySelectorAll("[data-network-metric]");

    const values = {
        routes: data.activeRoutes,
        spaceports: data.activeSpaceports,
        fleet: data.activeSpacecraft,
    };

    metrics.forEach((metric) => {
        const key = metric.getAttribute("data-network-metric");

        if (values[key] !== undefined) {
            metric.textContent = String(values[key]);
        }
    });
}

function createStatusBadge(status) {
    const classMap = {
        OPEN: "admin-status-active",
        CLOSED: "admin-status-completed",
        CANCELLED: "admin-status-cancelled",
    };

    const cssClass = classMap[status] ?? "admin-status-scheduled";

    return `
        <span class="admin-status ${cssClass}">
            ${formatStatus(status)}
        </span>
    `;
}

function formatStatus(status) {
    if (!status) {
        return "Unknown";
    }

    return status
        .toLowerCase()
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDateTime(value) {
    if (!value) {
        return "—";
    }

    const parts = value.split(" ");

    if (parts.length !== 2) {
        return value;
    }

    const [datePart, timePart] = parts;

    const [year, month, day] = datePart.split("-").map(Number);

    const [hour, minute] = timePart.split(":").map(Number);

    const date = new Date(year, month - 1, day, hour, minute);

    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

function escapeHtml(value) {
    const element = document.createElement("div");

    element.textContent = value ?? "";

    return element.innerHTML;
}
