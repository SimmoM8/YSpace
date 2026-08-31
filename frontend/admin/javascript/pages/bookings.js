import {
    apiGet
} from "../../../javascript/api.js";


export async function initBookingsPage() {

    const filterForm =
        document.getElementById(
            "bookings-filter-form"
        );

    filterForm?.addEventListener(
        "submit",
        async (event) => {
            event.preventDefault();
            await loadBookings();
        }
    );


    await loadBookings();
}


async function loadBookings() {

    const tableBody =
        document.getElementById(
            "bookings-tbody"
        );


    const form =
        document.getElementById(
            "bookings-filter-form"
        );

    const formData =
        new FormData(form);

    const search =
        formData.get("search")
            ?.trim();


    const params =
        new URLSearchParams();

    if (search) {
        params.set("search", search);
    }

    const query =
        params.toString();


    try {

        tableBody.innerHTML = `
            <tr>
                <td colspan="6"
                    class="admin-table-empty"
                >
                    Loading bookings...
                </td>
            </tr>
        `;


        const response =
            await apiGet(
                `/admin/bookings${query ? `?${query}` : ""}`
            );

        const bookings =
            await response.json();


        const count =
            document.getElementById(
                "bookings-count"
            );

        count.textContent =
            `${bookings.length} bookings`;


        if (!bookings.length) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="6"
                        class="admin-table-empty"
                    >
                        No bookings found.
                    </td>
                </tr>
            `;

            return;
        }


        tableBody.innerHTML =
            bookings
                .map(createBookingRow)
                .join("");

    } catch (error) {

        console.error(error);

        tableBody.innerHTML = `
            <tr>
                <td colspan="6"
                    class="
                        admin-table-empty
                        admin-table-error
                    "
                >
                    ${escapeHtml(
        error.message ||
        "Could not load bookings."
    )}
                </td>
            </tr>
        `;
    }
}


function createBookingRow(booking) {

    const flights =
        (booking.rows || [])
            .map(row => `
                ${escapeHtml(row.originCode)}
                → ${escapeHtml(row.destinationCode)}
                (${escapeHtml(row.flightCode)})
            `)
            .join("<br/>") || "—";


    return `
        <tr>
            <td>
                <div class="admin-flight-identity">
                    <strong>#${booking.id}</strong>
                </div>
            </td>

            <td>
                <strong>${escapeHtml(booking.userName)}</strong>
                <small>${escapeHtml(booking.userEmail)}</small>
            </td>

            <td>
                ${flights}
            </td>

            <td>
                <strong>$${formatPrice(booking.totalPrice)}</strong>
            </td>

            <td>
                ${formatDateTime(booking.createdAt)}
            </td>

            <td>
                ${createStatusBadge(booking.status)}
            </td>
        </tr>
    `;
}


function createStatusBadge(status) {

    const classMap = {
        OPEN: "admin-status-active",
        CLOSED: "admin-status-completed",
        CANCELLED: "admin-status-cancelled"
    };

    const cssClass =
        classMap[status]
        ?? "admin-status-scheduled";

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
        .replace(
            /\b\w/g,
            letter =>
                letter.toUpperCase()
        );
}


function formatPrice(value) {

    return Number(
        value ?? 0
    ).toFixed(2);
}


function formatDateTime(value) {

    if (!value) {
        return "—";
    }

    const date = new Date(value);

    return new Intl.DateTimeFormat(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    ).format(date);
}


function escapeHtml(value) {

    const element =
        document.createElement("div");

    element.textContent =
        value ?? "";

    return element.innerHTML;
}
