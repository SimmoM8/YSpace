import { apiGet } from "../../../javascript/api.js";

export async function initBookingsPage() {
    const filterForm = document.getElementById("bookings-filter-form");

    filterForm?.addEventListener("submit", async (event) => {
        event.preventDefault();
        await loadBookings();
    });

    await loadBookings();
}

async function loadBookings() {
    const tableBody = document.getElementById("bookings-tbody");

    const form = document.getElementById("bookings-filter-form");

    const formData = new FormData(form);

    const search = formData.get("search")?.trim();

    const params = new URLSearchParams();

    if (search) {
        params.set("search", search);
    }

    const query = params.toString();

    try {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7"
                    class="admin-table-empty"
                >
                    Loading bookings...
                </td>
            </tr>
        `;

        const response = await apiGet(`/admin/bookings${query ? `?${query}` : ""}`);

        const bookings = await response.json();

        const count = document.getElementById("bookings-count");

        count.textContent = `${bookings.length} bookings`;

        if (!bookings.length) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7"
                        class="admin-table-empty"
                    >
                        No bookings found.
                    </td>
                </tr>
            `;

            return;
        }

        tableBody.innerHTML = bookings.map(createBookingRow).join("");
    } catch (error) {
        console.error(error);

        tableBody.innerHTML = `
            <tr>
                <td colspan="7"
                    class="
                        admin-table-empty
                        admin-table-error
                    "
                >
                    ${escapeHtml(error.message || "Could not load bookings.")}
                </td>
            </tr>
        `;
    }
}

function createBookingRow(booking) {
    const journey =
        (booking.rows || [])
            .map(
                (row) => `
                    <div class="admin-route">
                        <strong>${escapeHtml(row.originCode)}</strong>
                        <span aria-hidden="true">→</span>
                        <strong>${escapeHtml(row.destinationCode)}</strong>
                    </div>
                    <small>
                        ${escapeHtml(row.routeName)}
                        · ${escapeHtml(row.flightCode)}
                    </small>
                `
            )
            .join("") || "—";

    const cancelledClass =
        booking.status === "CANCELLED"
            ? "admin-flight-row-cancelled"
            : "";

    return `
        <tr class="${cancelledClass}">
            <td>
                <strong>#${booking.id}</strong>
                <small>Created ${formatDateTime(booking.createdAt)}</small>
            </td>

            <td>
                <strong>${escapeHtml(booking.userName)}</strong>
                <small>${escapeHtml(booking.userEmail)}</small>
            </td>

            <td>
                ${journey}
            </td>

            <td>
                <strong>${formatDateTime(booking.departureTime)}</strong>
            </td>

            <td>
                <strong>${formatPrice(booking.totalPrice)} kr</strong>
            </td>

            <td>
                ${createStatusBadge(booking.status)}
            </td>

            <td>
                <button
                    type="button"
                    class="admin-row-action"
                    aria-label="View booking ${booking.id}"
                >
                    →
                </button>
            </td>
        </tr>
    `;
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
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatPrice(value) {
    return Number(value ?? 0).toFixed(2);
}

function formatDateTime(value) {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

function escapeHtml(value) {
    const element = document.createElement("div");

    element.textContent = value ?? "";

    return element.innerHTML;
}
