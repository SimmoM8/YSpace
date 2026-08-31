import { apiGet } from "../../../javascript/api.js";

export async function initSpaceportsPage() {
    const tableBody = document.getElementById("spaceports-tbody");

    try {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6"
                    class="admin-table-empty"
                >
                    Loading spaceports...
                </td>
            </tr>
        `;

        const response = await apiGet("/admin/spaceports");

        const spaceports = await response.json();

        const count = document.getElementById("spaceports-count");

        count.textContent = `${spaceports.length} spaceports`;

        if (!spaceports.length) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6"
                        class="admin-table-empty"
                    >
                        No spaceports found.
                    </td>
                </tr>
            `;

            return;
        }

        tableBody.innerHTML = spaceports.map(createSpaceportRow).join("");
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
                    ${escapeHtml(error.message || "Could not load spaceports.")}
                </td>
            </tr>
        `;
    }
}

function createSpaceportRow(spaceport) {
    return `
        <tr>
            <td>
                <div class="admin-flight-identity">
                    <strong>${escapeHtml(spaceport.name)}</strong>
                    <span>Spaceport ID ${spaceport.id}</span>
                </div>
            </td>

            <td>
                <strong>${escapeHtml(spaceport.code)}</strong>
            </td>

            <td>
                <span class="admin-status admin-status-scheduled">
                    ${formatType(spaceport.type)}
                </span>
            </td>

            <td>
                <span class="admin-table-description">
                    ${escapeHtml(spaceport.description || "—")}
                </span>
            </td>

            <td>
                —
            </td>

            <td>
                <button
                    type="button"
                    class="admin-row-action"
                    aria-label="View ${escapeHtml(spaceport.name)}"
                >
                    →
                </button>
            </td>
        </tr>
    `;
}

function formatType(type) {
    if (!type) {
        return "Unknown";
    }

    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
}

function escapeHtml(value) {
    const element = document.createElement("div");

    element.textContent = value ?? "";

    return element.innerHTML;
}
