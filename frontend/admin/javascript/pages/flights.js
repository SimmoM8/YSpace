import {
    apiGet
} from "../../../javascript/api.js";

let summaryFlights = [];

export async function initFlightsPage() {
    const filterForm =
        document.querySelector(
            ".admin-flight-filters"
        );

    filterForm?.addEventListener(
        "submit",
        async (event) => {
            event.preventDefault();

            await loadFlights(false);
        }
    );

    await loadFlights(true);
}

async function loadFlights(
    updateSummary = false
) {
    const tableBody =
        document.querySelector(
            ".admin-flight-table tbody"
        );

    if (!tableBody) {
        return;
    }

    try {
        showLoading(tableBody);

        const query =
            buildFlightQuery();

        const response =
            await apiGet(
                `/admin/flights${query}`
            );

        const flights =
            await response.json();

        if (updateSummary) {
            summaryFlights =
                flights;

            updateFlightSummary(
                summaryFlights
            );
        }

        renderFlights(
            tableBody,
            flights
        );

        updateResultCount(
            flights.length
        );
    } catch (error) {
        console.error(error);

        showError(
            tableBody,
            error.message
        );
    }
}

function buildFlightQuery() {
    const form =
        document.querySelector(
            ".admin-flight-filters"
        );

    if (!form) {
        return "";
    }

    const formData =
        new FormData(form);

    const params =
        new URLSearchParams();

    const search =
        formData
            .get("search")
            ?.trim();

    const status =
        formData.get(
            "status"
        );

    const date =
        formData.get(
            "date"
        );

    if (search) {
        params.set(
            "search",
            search
        );
    }

    if (status) {
        params.set(
            "status",
            status
        );
    }

    if (date) {
        params.set(
            "date",
            date
        );
    }

    const queryString =
        params.toString();

    return queryString
        ? `?${queryString}`
        : "";
}

function renderFlights(
    tableBody,
    flights
) {
    if (!flights.length) {
        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    class="admin-table-empty"
                >
                    No flights found.
                </td>
            </tr>
        `;

        return;
    }

    tableBody.innerHTML =
        flights
            .map(createFlightRow)
            .join("");
}

function createFlightRow(flight) {
    const capacity =
        Number(
            flight.seatCapacity ?? 0
        );

    const bookedSeats =
        Number(
            flight.bookedSeats ?? 0
        );

    const loadPercentage =
        capacity > 0
            ? Math.min(
                100,
                Math.round(
                    (
                        bookedSeats /
                        capacity
                    )
                    *
                    100
                )
            )
            : 0;

    const cancelledClass =
        flight.status === "CANCELLED"
            ? "admin-flight-row-cancelled"
            : "";

    return `
        <tr class="${cancelledClass}">

            <td>

                <div class="admin-flight-identity">

                    <strong>
                        ${escapeHtml(flight.code)}
                    </strong>

                    <span>
                        ID ${flight.id}
                    </span>

                </div>

            </td>

            <td>

                <div class="admin-route admin-flight-route">

                    <strong>
                        ${escapeHtml(flight.originCode)}
                    </strong>

                    <span aria-hidden="true">
                        →
                    </span>

                    <strong>
                        ${escapeHtml(flight.destinationCode)}
                    </strong>

                </div>

                <small>
                    ${escapeHtml(flight.originName)}
                    ·
                    ${escapeHtml(flight.destinationName)}
                </small>

            </td>

            <td>

                <div class="admin-flight-schedule">

                    <div>

                        <span>
                            Departure
                        </span>

                        <strong>
                            ${formatDateTime(
        flight.departureTime
    )}
                        </strong>

                    </div>

                    <div>

                        <span>
                            Arrival
                        </span>

                        <strong>
                            ${formatDateTime(
        flight.arrivalTime
    )}
                        </strong>

                    </div>

                </div>

            </td>

            <td>

                <strong>
                    ${escapeHtml(
        flight.spacecraftName ?? "—"
    )}
                </strong>

                <small>
                    ${escapeHtml(
        flight.spacecraftModel ?? ""
    )}
                </small>

            </td>

            <td>

                <div class="admin-passenger-load">

                    <div class="admin-passenger-load-header">

                        <strong>
                            ${bookedSeats}
                            /
                            ${capacity}
                        </strong>

                        <span>
                            ${loadPercentage}%
                        </span>

                    </div>

                    <div class="admin-progress">

                        <span
                            style="width: ${loadPercentage}%"
                        ></span>

                    </div>

                </div>

            </td>

            <td>
                ${createStatusBadge(
        flight.status
    )}
            </td>

            <td>

                <a
                    href="#flight/${flight.id}"
                    class="admin-row-action"
                    aria-label="View ${escapeHtml(
        flight.code
    )}"
                >
                    →
                </a>

            </td>

        </tr>
    `;
}

function createStatusBadge(status) {
    const classMap = {
        SCHEDULED:
            "admin-status-scheduled",

        BOARDING:
            "admin-status-active",

        DEPARTED:
            "admin-status-active",

        IN_FLIGHT:
            "admin-status-active",

        ARRIVED:
            "admin-status-completed",

        CANCELLED:
            "admin-status-cancelled"
    };

    const cssClass =
        classMap[status]
        ??
        "admin-status-scheduled";

    return `
        <span
            class="admin-status ${cssClass}"
        >
            ${formatStatus(status)}
        </span>
    `;
}

function updateFlightSummary(
    flights
) {
    const scheduled =
        flights.filter(
            flight =>
                flight.status ===
                "SCHEDULED"
        ).length;

    const inProgress =
        flights.filter(
            flight =>
                [
                    "BOARDING",
                    "DEPARTED",
                    "IN_FLIGHT"
                ]
                    .includes(
                        flight.status
                    )
        ).length;

    const arrived =
        flights.filter(
            flight =>
                flight.status ===
                "ARRIVED"
        ).length;

    const cancelled =
        flights.filter(
            flight =>
                flight.status ===
                "CANCELLED"
        ).length;

    setSummaryValue(
        "scheduled",
        scheduled
    );

    setSummaryValue(
        "in-progress",
        inProgress
    );

    setSummaryValue(
        "arrived",
        arrived
    );

    setSummaryValue(
        "cancelled",
        cancelled
    );
}

function setSummaryValue(
    name,
    value
) {
    const element =
        document.querySelector(
            `[data-flight-stat="${name}"]`
        );

    if (element) {
        element.textContent =
            String(value)
                .padStart(
                    2,
                    "0"
                );
    }
}

function updateResultCount(count) {
    const element =
        document.querySelector(
            ".admin-table-result-count"
        );

    if (!element) {
        return;
    }

    element.textContent =
        count === 1
            ? "1 flight"
            : `${count} flights`;
}

function formatStatus(status) {
    if (!status) {
        return "Unknown";
    }

    return status
        .toLowerCase()
        .replaceAll(
            "_",
            " "
        )
        .replace(
            /\b\w/g,
            letter =>
                letter.toUpperCase()
        );
}

function formatDateTime(value) {
    if (!value) {
        return "—";
    }

    /*
     * Spring sends LocalDateTime without a timezone.
     *
     * We therefore construct a local browser Date
     * rather than treating the value as UTC.
     */
    const [
        datePart,
        timePart
    ] = value.split("T");

    if (
        !datePart ||
        !timePart
    ) {
        return value;
    }

    const [
        year,
        month,
        day
    ] =
        datePart
            .split("-")
            .map(Number);

    const [
        hour,
        minute
    ] =
        timePart
            .split(":")
            .map(Number);

    const date =
        new Date(
            year,
            month - 1,
            day,
            hour,
            minute
        );

    return new Intl.DateTimeFormat(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
        }
    )
        .format(date);
}

function showLoading(tableBody) {
    tableBody.innerHTML = `
        <tr>
            <td
                colspan="7"
                class="admin-table-empty"
            >
                Loading flights...
            </td>
        </tr>
    `;
}

function showError(
    tableBody,
    message
) {
    tableBody.innerHTML = `
        <tr>
            <td
                colspan="7"
                class="
                    admin-table-empty
                    admin-table-error
                "
            >
                ${escapeHtml(
        message ||
        "Could not load flights."
    )}
            </td>
        </tr>
    `;

    updateResultCount(0);
}

function escapeHtml(value) {
    const element =
        document.createElement("div");

    element.textContent =
        value ?? "";

    return element.innerHTML;
}