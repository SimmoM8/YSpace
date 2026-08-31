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
                <td colspan="6"
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
                    <td colspan="6"
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
                <td colspan="6"
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
    const isAdmin = user.role === "ADMIN";

    return `
        <tr>
            <td>
                <div class="admin-flight-identity">
                    <strong>${user.id}</strong>
                </div>
            </td>

            <td>
                <strong>${escapeHtml(user.firstName)} ${escapeHtml(user.lastName)}</strong>
            </td>

            <td>
                ${escapeHtml(user.email)}
            </td>

            <td>
                <span class="admin-status ${isAdmin ? "admin-status-completed" : "admin-status-scheduled"
        }">
                    ${formatRole(user.role)}
                </span>
            </td>

            <td>
                <strong>${user.bookingCount}</strong>
            </td>

            <td>
                ${formatDateTime(user.createdAt)}
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
