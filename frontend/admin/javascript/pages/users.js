import { apiGet } from "../../../javascript/api.js";

export async function initUsersPage() {
    const filterForm = document.getElementById("users-filter-form");

    filterForm?.addEventListener("submit", async (event) => {
        event.preventDefault();
        await loadUsers();
    });

    await loadUsers();
}

async function loadUsers() {
    const tableBody = document.getElementById("users-tbody");

    const form = document.getElementById("users-filter-form");

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
                    Loading passengers...
                </td>
            </tr>
        `;

        const response = await apiGet(`/admin/users${query ? `?${query}` : ""}`);

        const users = await response.json();

        const count = document.getElementById("users-count");

        count.textContent = `${users.length} passengers`;

        if (!users.length) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7"
                        class="admin-table-empty"
                    >
                        No passengers found.
                    </td>
                </tr>
            `;

            return;
        }

        tableBody.innerHTML = users.map(createUserRow).join("");
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
                    ${escapeHtml(error.message || "Could not load passengers.")}
                </td>
            </tr>
        `;
    }
}

function createUserRow(user) {
    return `
        <tr>
            <td>
                <strong>
                    ${escapeHtml(user.firstName)}
                    ${escapeHtml(user.lastName)}
                </strong>

                <small>
                    Passenger ID ${user.id}
                </small>
            </td>

            <td>
                ${escapeHtml(user.email)}
            </td>

            <td>
                <strong>${user.bookingCount}</strong>
                <small>Total bookings</small>
            </td>

            <td>
                <strong>${user.openBookingCount}</strong>
                <small>
                    ${user.openBookingCount === 1
            ? "Current booking"
            : "Current bookings"}
                </small>
            </td>

            <td>
                <strong>${formatDateTime(user.createdAt)}</strong>
            </td>

            <td>
                <span class="admin-status admin-status-completed">
                    Passenger
                </span>
            </td>

            <td>
                <button
                    type="button"
                    class="admin-row-action"
                    aria-label="View ${escapeHtml(user.firstName)} ${escapeHtml(user.lastName)}"
                >
                    →
                </button>
            </td>
        </tr>
    `;
}

function formatRole(role) {
    if (!role) {
        return "Unknown";
    }

    return role
        .toLowerCase()
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
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
    }).format(date);
}

function escapeHtml(value) {
    const element = document.createElement("div");

    element.textContent = value ?? "";

    return element.innerHTML;
}
