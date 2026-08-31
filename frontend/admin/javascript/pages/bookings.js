import { apiGet } from "../../../javascript/api.js";

let bookings = [];

/* ================================================================
   BOOKINGS PAGE
================================================================ */

export async function initBookingsPage() {
    const tableBody = document.querySelector(
        ".admin-flight-table tbody",
    );

    if (!tableBody) {
        return;
    }

    bindBookingFilters();
    await loadBookings();
}

async function loadBookings() {
    try {
        const response = await apiGet("/admin/bookings");

        bookings = await response.json();

        renderBookingStats(bookings);
        renderBookings(bookings);
    } catch (error) {
        console.error("Could not load bookings:", error);

        showBookingsError(
            error.message || "Could not load bookings.",
        );
    }
}

/* ================================================================
   FILTERING
================================================================ */

function bindBookingFilters() {
    const form = document.querySelector(
        ".admin-flight-filters",
    );

    if (!form) {
        return;
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        applyBookingFilters();
    });
}

function applyBookingFilters() {
    const search =
        document
            .getElementById("booking-search")
            ?.value.trim()
            .toLowerCase() ?? "";

    const status =
        document.getElementById(
            "booking-status-filter",
        )?.value ?? "";

    const createdDate =
        document.getElementById(
            "booking-date-filter",
        )?.value ?? "";

    const filteredBookings = bookings.filter((booking) => {
        const matchesSearch =
            !search ||
            matchesBookingSearch(booking, search);

        const matchesStatus =
            !status ||
            booking.status === status;

        const matchesCreatedDate =
            !createdDate ||
            getDatePart(booking.createdAt) === createdDate;

        return (
            matchesSearch &&
            matchesStatus &&
            matchesCreatedDate
        );
    });

    renderBookings(filteredBookings);
}

function matchesBookingSearch(booking, search) {
    if (
        String(booking.id).includes(search) ||
        booking.userName?.toLowerCase().includes(search) ||
        booking.userEmail?.toLowerCase().includes(search)
    ) {
        return true;
    }

    return booking.rows?.some((row) =>
        row.flightCode?.toLowerCase().includes(search) ||
        row.routeName?.toLowerCase().includes(search) ||
        row.originCode?.toLowerCase().includes(search) ||
        row.destinationCode?.toLowerCase().includes(search)
    );
}

/* ================================================================
   BOOKING TABLE
================================================================ */

function renderBookings(bookingList) {
    const tableBody = document.querySelector(
        ".admin-flight-table tbody",
    );

    const resultCount = document.querySelector(
        ".admin-table-result-count",
    );

    if (!tableBody) {
        return;
    }

    if (resultCount) {
        resultCount.textContent =
            `${bookingList.length} ${bookingList.length === 1
                ? "booking"
                : "bookings"
            }`;
    }

    if (bookingList.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="admin-table-empty">
                    No bookings found.
                </td>
            </tr>
        `;

        return;
    }

    tableBody.innerHTML = bookingList
        .map(createBookingRow)
        .join("");
}

function createBookingRow(booking) {
    const journey = getBookingJourney(booking);

    const cancelledClass =
        booking.status === "CANCELLED"
            ? "admin-flight-row-cancelled"
            : "";

    return `
        <tr class="${cancelledClass}">
            <td>
                <strong>
                    ${formatBookingReference(booking.id)}
                </strong>

                <small>
                    Created ${formatDate(booking.createdAt)}
                </small>
            </td>

            <td>
                <strong>
                    ${escapeHtml(booking.userName)}
                </strong>

                <small>
                    ${escapeHtml(booking.userEmail)}
                </small>
            </td>

            <td>
                ${createJourneyCell(journey)}
            </td>

            <td>
                ${createDepartureCell(booking.departureTime)}
            </td>

            <td>
                <strong>
                    ${formatPrice(booking.totalPrice)}
                </strong>
            </td>

            <td>
                <span class="${getBookingStatusClass(booking.status)}">
                    ${escapeHtml(formatStatus(booking.status))}
                </span>
            </td>

            <td>
                <button
                    type="button"
                    class="admin-row-action"
                    aria-label="View booking ${formatBookingReference(booking.id)}"
                    data-booking-id="${escapeHtml(booking.id)}"
                >
                    →
                </button>
            </td>
        </tr>
    `;
}

function createJourneyCell(journey) {
    if (!journey) {
        return `
            <strong>—</strong>
            <small>No journey information</small>
        `;
    }

    return `
        <div class="admin-route">
            <strong>${escapeHtml(journey.originCode)}</strong>
            <span>→</span>
            <strong>${escapeHtml(journey.destinationCode)}</strong>
        </div>

        <small>
            ${escapeHtml(journey.routeName)}
        </small>
    `;
}

function createDepartureCell(departureTime) {
    if (!departureTime) {
        return `
            <strong>Not scheduled</strong>
        `;
    }

    return `
        <strong>
            ${formatDate(departureTime)}
        </strong>

        <small>
            ${formatTime(departureTime)}
        </small>
    `;
}

function getBookingJourney(booking) {
    if (!booking.rows?.length) {
        return null;
    }

    const firstRow = booking.rows[0];

    return {
        originCode: firstRow.originCode,
        destinationCode: firstRow.destinationCode,
        routeName: firstRow.routeName,
    };
}

/* ================================================================
   STATISTICS
================================================================ */

function renderBookingStats(bookingList) {
    setStat(
        "open",
        countByStatus(bookingList, "OPEN"),
    );

    setStat(
        "closed",
        countByStatus(bookingList, "CLOSED"),
    );

    setStat(
        "cancelled",
        countByStatus(bookingList, "CANCELLED"),
    );

    setStat(
        "total",
        bookingList.length,
    );
}

function countByStatus(bookingList, status) {
    return bookingList.filter(
        (booking) => booking.status === status,
    ).length;
}

function setStat(name, value) {
    const element = document.querySelector(
        `[data-booking-stat="${name}"]`,
    );

    if (element) {
        element.textContent = value;
    }
}

/* ================================================================
   ERROR HANDLING
================================================================ */

function showBookingsError(message) {
    const tableBody = document.querySelector(
        ".admin-flight-table tbody",
    );

    const resultCount = document.querySelector(
        ".admin-table-result-count",
    );

    if (resultCount) {
        resultCount.textContent =
            "Unable to load";
    }

    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="admin-table-empty">
                    ${escapeHtml(message)}
                </td>
            </tr>
        `;
    }
}

/* ================================================================
   FORMATTING
================================================================ */

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
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase(),
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
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
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

function formatTime(value) {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
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

function getDatePart(value) {
    if (!value) {
        return "";
    }

    return value.substring(0, 10);
}

function formatPrice(value) {
    const price = Number(value);

    if (!Number.isFinite(price)) {
        return "—";
    }

    return new Intl.NumberFormat(
        "sv-SE",
        {
            style: "currency",
            currency: "SEK",
            maximumFractionDigits: 2,
        },
    ).format(price);
}

function escapeHtml(value) {
    const element = document.createElement("div");

    element.textContent = value ?? "";

    return element.innerHTML;
}