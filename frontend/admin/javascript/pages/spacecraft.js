import { apiGet } from "../../../javascript/api.js";

export async function initSpacecraftPage() {
    const tableBody = document.getElementById("spacecraft-tbody");

    try {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7"
                    class="admin-table-empty"
                >
                    Loading spacecraft...
                </td>
            </tr>
        `;

        const response = await apiGet("/admin/spacecraft");

        const spacecraft = await response.json();

        const count = document.getElementById("spacecraft-count");

        count.textContent = `${spacecraft.length} spacecraft`;

        if (!spacecraft.length) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7"
                        class="admin-table-empty"
                    >
                        No spacecraft found.
                    </td>
                </tr>
            `;

            return;
        }

        tableBody.innerHTML = spacecraft.map(createSpacecraftRow).join("");
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
                    ${escapeHtml(error.message || "Could not load spacecraft.")}
                </td>
            </tr>
        `;
    }
}

function createSpacecraftRow(craft) {
    const operationalClass = craft.operational
        ? "admin-status-completed"
        : "admin-status-cancelled";

    return `
        <tr>
            <td>
                <div class="admin-flight-identity">
                    <strong>${escapeHtml(craft.name)}</strong>
                    <span>Craft ID ${craft.id}</span>
                </div>
            </td>

            <td>
                <strong>${escapeHtml(craft.model)}</strong>
            </td>

            <td>
                ${escapeHtml(craft.manufacturer || "—")}
            </td>

            <td>
                <strong>${craft.seatCapacity}</strong>
                <small>Passenger seats</small>
            </td>

            <td>
                <span class="admin-status admin-status-scheduled">
                    ${formatStatus(craft.status)}
                </span>
            </td>

            <td>
                <span class="admin-status ${operationalClass}">
                    ${craft.operational ? "Operational" : "Unavailable"}
                </span>
            </td>

            <td>
                <button
                    type="button"
                    class="admin-row-action"
                    aria-label="View ${escapeHtml(craft.name)}"
                >
                    →
                </button>
            </td>
        </tr>
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

function escapeHtml(value) {
    const element = document.createElement("div");

    element.textContent = value ?? "";

    return element.innerHTML;
}
