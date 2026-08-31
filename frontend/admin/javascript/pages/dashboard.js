import { apiGet } from "../../../javascript/api.js";

/* ================================================================
   DASHBOARD PAGE
================================================================ */

export async function initDashboardPage() {
    try {
        const dashboardData = await loadDashboardData();

        renderDashboardStats(dashboardData);
        renderUpcomingFlights(dashboardData.flights);
        renderNetworkOverview(dashboardData);
        renderRecentBookings(dashboardData.bookings);
        renderUserOverview(dashboardData.users);
    } catch (error) {
        console.error("Could not load dashboard:", error);

        showDashboardError(
            error.message || "Could not load dashboard data.",
        );
    }
}

/* ================================================================
   DATA
================================================================ */

async function loadDashboardData() {
    const [
        flightResponse,
        bookingResponse,
        userResponse,
        routeResponse,
        spaceportResponse,
        spacecraftResponse,
    ] = await Promise.all([
        apiGet("/admin/flights"),
        apiGet("/admin/bookings"),
        apiGet("/admin/users"),
        apiGet("/admin/routes"),
        apiGet("/admin/spaceports"),
        apiGet("/admin/spacecraft"),
    ]);

    const [
        flights,
        bookings,
        users,
        routes,
        spaceports,
        spacecraft,
    ] = await Promise.all([
        flightResponse.json(),
        bookingResponse.json(),
        userResponse.json(),
        routeResponse.json(),
        spaceportResponse.json(),
        spacecraftResponse.json(),
    ]);

    return {
        flights,
        bookings,
        users,
        routes,
        spaceports,
        spacecraft,
    };
}

/* ================================================================
   DASHBOARD STATISTICS
================================================================ */

function renderDashboardStats(data) {
    const scheduledFlights = data.flights.filter(
        (flight) =>
            flight.status === "SCHEDULED",
    ).length;

    const openBookings = data.bookings.filter(
        (booking) =>
            booking.status === "OPEN",
    ).length;

    const passengers = data.users.filter(
        (user) =>
            user.role === "SPACE_TOURIST",
    ).length;

    const operationalSpacecraft = data.spacecraft.filter(
        (spacecraft) =>
            spacecraft.operational === true,
    ).length;

    const fleetAvailability =
        calculatePercentage(
            operationalSpacecraft,
            data.spacecraft.length,
        );

    setDashboardStat(
        "scheduled-flights",
        scheduledFlights,
    );

    setDashboardStat(
        "open-bookings",
        openBookings,
    );

    setDashboardStat(
        "passengers",
        passengers,
    );

    setDashboardStat(
        "fleet-availability",
        `${fleetAvailability}%`,
    );
}

function setDashboardStat(name, value) {
    const element = document.querySelector(
        `[data-dashboard-stat="${name}"]`,
    );

    if (element) {
        element.textContent = value;
    }
}

/* ================================================================
   UPCOMING FLIGHTS
================================================================ */

function renderUpcomingFlights(flights) {
    const tableBody = document.getElementById(
        "dashboard-upcoming-flights",
    );

    if (!tableBody) {
        return;
    }

    const now = new Date();

    const upcomingFlights = flights
        .filter((flight) =>
            isUpcomingFlight(flight, now),
        )
        .sort(
            (first, second) =>
                new Date(first.departureTime) -
                new Date(second.departureTime),
        )
        .slice(0, 4);

    if (upcomingFlights.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="admin-table-empty">
                    No upcoming departures.
                </td>
            </tr>
        `;

        return;
    }

    tableBody.innerHTML = upcomingFlights
        .map(createUpcomingFlightRow)
        .join("");
}

function isUpcomingFlight(flight, now) {
    if (!flight.departureTime) {
        return false;
    }

    const activeStatuses = [
        "SCHEDULED",
        "BOARDING",
    ];

    return (
        activeStatuses.includes(flight.status) &&
        new Date(flight.departureTime) >= now
    );
}

function createUpcomingFlightRow(flight) {
    const loadPercentage = calculatePercentage(
        Number(flight.bookedSeats) || 0,
        Number(flight.seatCapacity) || 0,
    );

    return `
        <tr>
            <td>
                <strong class="admin-flight-number">
                    ${escapeHtml(flight.code)}
                </strong>
            </td>

            <td>
                <div class="admin-route">
                    <strong>
                        ${escapeHtml(flight.originCode)}
                    </strong>

                    <span>→</span>

                    <strong>
                        ${escapeHtml(flight.destinationCode)}
                    </strong>
                </div>

                <small>
                    ${escapeHtml(flight.routeName)}
                </small>
            </td>

            <td>
                <strong>
                    ${formatTime(flight.departureTime)}
                </strong>

                <small>
                    ${formatDate(flight.departureTime)}
                </small>
            </td>

            <td>
                <span>
                    ${escapeHtml(flight.spacecraftName)}
                </span>

                <small>
                    ${escapeHtml(flight.spacecraftModel)}
                </small>
            </td>

            <td>
                <div class="admin-load">
                    <span>
                        ${loadPercentage}%
                    </span>

                    <div class="admin-progress">
                        <span
                            style="width: ${loadPercentage}%"
                        ></span>
                    </div>
                </div>
            </td>

            <td>
                <span class="${getFlightStatusClass(flight.status)}">
                    ${escapeHtml(formatStatus(flight.status))}
                </span>
            </td>
        </tr>
    `;
}

/* ================================================================
   NETWORK OVERVIEW
================================================================ */

function renderNetworkOverview(data) {
    const operationalSpacecraft = data.spacecraft.filter(
        (spacecraft) =>
            spacecraft.operational === true,
    ).length;

    setNetworkMetric(
        "routes",
        data.routes.length,
    );

    setNetworkMetric(
        "spaceports",
        data.spaceports.length,
    );

    setNetworkMetric(
        "fleet",
        `${operationalSpacecraft} / ${data.spacecraft.length}`,
    );
}

function setNetworkMetric(name, value) {
    const element = document.querySelector(
        `[data-dashboard-network="${name}"]`,
    );

    if (element) {
        element.textContent = value;
    }
}

/* ================================================================
   RECENT BOOKINGS
================================================================ */

function renderRecentBookings(bookings) {
    const container = document.getElementById(
        "dashboard-recent-bookings",
    );

    if (!container) {
        return;
    }

    const recentBookings = [...bookings]
        .sort(
            (first, second) =>
                new Date(second.createdAt) -
                new Date(first.createdAt),
        )
        .slice(0, 4);

    if (recentBookings.length === 0) {
        container.innerHTML = `
            <div class="admin-table-empty">
                No bookings have been created yet.
            </div>
        `;

        return;
    }

    container.innerHTML = recentBookings
        .map(createRecentBookingRow)
        .join("");
}

function createRecentBookingRow(booking) {
    const journey = getBookingJourney(booking);

    return `
        <div class="admin-booking-row">
            <div class="admin-booking-reference">
                <strong>
                    ${formatBookingReference(booking.id)}
                </strong>

                <span>
                    ${escapeHtml(booking.userName)}
                </span>
            </div>

            <div class="admin-booking-route">
                <strong>
                    ${escapeHtml(journey.label)}
                </strong>

                <span>
                    ${escapeHtml(journey.details)}
                </span>
            </div>

            <div class="admin-booking-date">
                <strong>
                    ${formatShortDate(booking.createdAt)}
                </strong>

                <span>
                    ${formatTime(booking.createdAt)}
                </span>
            </div>

            <span class="${getBookingStatusClass(booking.status)}">
                ${escapeHtml(formatStatus(booking.status))}
            </span>
        </div>
    `;
}

function getBookingJourney(booking) {
    if (!booking.rows?.length) {
        return {
            label: "No journey",
            details: "No flight information",
        };
    }

    const firstRow = booking.rows[0];
    const lastRow =
        booking.rows[booking.rows.length - 1];

    const label =
        `${firstRow.originCode ?? "—"} → ` +
        `${lastRow.destinationCode ?? "—"}`;

    if (booking.rows.length === 1) {
        return {
            label,
            details: `Flight ${firstRow.flightCode}`,
        };
    }

    return {
        label,
        details:
            `${booking.rows.length} flight segments`,
    };
}

/* ================================================================
   USER OVERVIEW
================================================================ */

function renderUserOverview(users) {
    const passengers = users.filter(
        (user) =>
            user.role === "SPACE_TOURIST",
    ).length;

    const admins = users.filter(
        (user) =>
            user.role === "ADMIN",
    ).length;

    const activeMembers = users.filter(
        (user) =>
            Number(user.openBookingCount) > 0,
    ).length;

    setUserMetric(
        "total",
        users.length,
    );

    setUserMetric(
        "passengers",
        passengers,
    );

    setUserMetric(
        "admins",
        admins,
    );

    setUserMetric(
        "active",
        activeMembers,
    );
}

function setUserMetric(name, value) {
    const element = document.querySelector(
        `[data-dashboard-user="${name}"]`,
    );

    if (element) {
        element.textContent = value;
    }
}

/* ================================================================
   ERROR HANDLING
================================================================ */

function showDashboardError(message) {
    const flightTable = document.getElementById(
        "dashboard-upcoming-flights",
    );

    const bookingList = document.getElementById(
        "dashboard-recent-bookings",
    );

    if (flightTable) {
        flightTable.innerHTML = `
            <tr>
                <td colspan="6" class="admin-table-empty">
                    ${escapeHtml(message)}
                </td>
            </tr>
        `;
    }

    if (bookingList) {
        bookingList.innerHTML = `
            <div class="admin-table-empty">
                ${escapeHtml(message)}
            </div>
        `;
    }
}

/* ================================================================
   FORMATTING
================================================================ */

function calculatePercentage(value, total) {
    if (!total || total <= 0) {
        return 0;
    }

    return Math.min(
        100,
        Math.round((value / total) * 100),
    );
}

function formatBookingReference(id) {
    if (id == null) {
        return "Booking";
    }

    return `YSB-${String(id).padStart(6, "0")}`;
}

function formatStatus(status) {
    if (!status) {
        return "Unknown";
    }

    return status
        .toLowerCase()
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase(),
        );
}

function getFlightStatusClass(status) {
    const classes = {
        SCHEDULED:
            "admin-status admin-status-scheduled",

        BOARDING:
            "admin-status admin-status-active",

        DEPARTED:
            "admin-status admin-status-active",

        IN_FLIGHT:
            "admin-status admin-status-active",

        ARRIVED:
            "admin-status admin-status-confirmed",

        CANCELLED:
            "admin-status admin-status-cancelled",
    };

    return (
        classes[status] ??
        "admin-status admin-status-scheduled"
    );
}

function getBookingStatusClass(status) {
    const classes = {
        OPEN:
            "admin-status admin-status-confirmed",

        CLOSED:
            "admin-status admin-status-scheduled",

        CANCELLED:
            "admin-status admin-status-cancelled",
    };

    return (
        classes[status] ??
        "admin-status admin-status-scheduled"
    );
}

function formatDate(value) {
    const date = parseDate(value);

    if (!date) {
        return "—";
    }

    return new Intl.DateTimeFormat(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        },
    ).format(date);
}

function formatShortDate(value) {
    const date = parseDate(value);

    if (!date) {
        return "—";
    }

    return new Intl.DateTimeFormat(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
        },
    ).format(date);
}

function formatTime(value) {
    const date = parseDate(value);

    if (!date) {
        return "—";
    }

    return new Intl.DateTimeFormat(
        "en-GB",
        {
            hour: "2-digit",
            minute: "2-digit",
        },
    ).format(date);
}

function parseDate(value) {
    if (!value) {
        return null;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date;
}

function escapeHtml(value) {
    const element = document.createElement("div");

    element.textContent = value ?? "";

    return element.innerHTML;
}