import { apiGet } from "../../../javascript/api.js";

let users = [];

/* ================================================================
   USERS PAGE
================================================================ */

export async function initUsersPage() {
    const tableBody = document.querySelector(
        ".admin-flight-table tbody",
    );

    if (!tableBody) {
        return;
    }

    bindUserFilters();
    await loadUsers();
}

async function loadUsers() {
    try {
        const response = await apiGet("/admin/users");

        users = await response.json();

        renderUserStats(users);
        renderUsers(users);
    } catch (error) {
        console.error("Could not load members:", error);

        showUsersError(
            error.message || "Could not load members.",
        );
    }
}

/* ================================================================
   FILTERING
================================================================ */

function bindUserFilters() {
    const form = document.querySelector(
        ".admin-flight-filters",
    );

    if (!form) {
        return;
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        applyUserFilters();
    });
}

function applyUserFilters() {
    const search =
        document
            .getElementById("passenger-search")
            ?.value.trim()
            .toLowerCase() ?? "";

    const role =
        document.getElementById(
            "passenger-role-filter",
        )?.value ?? "";

    const bookingStatus =
        document.getElementById(
            "passenger-booking-filter",
        )?.value ?? "";

    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            !search ||
            user.firstName?.toLowerCase().includes(search) ||
            user.lastName?.toLowerCase().includes(search) ||
            user.email?.toLowerCase().includes(search) ||
            getFullName(user).toLowerCase().includes(search);

        const matchesRole =
            !role ||
            user.role === role;

        const matchesBookings =
            !bookingStatus ||
            matchesBookingFilter(user, bookingStatus);

        return (
            matchesSearch &&
            matchesRole &&
            matchesBookings
        );
    });

    renderUsers(filteredUsers);
}

function matchesBookingFilter(user, filter) {
    const openBookings =
        Number(user.openBookingCount) || 0;

    if (filter === "OPEN") {
        return openBookings > 0;
    }

    if (filter === "NONE") {
        return openBookings === 0;
    }

    return true;
}

/* ================================================================
   USER TABLE
================================================================ */

function renderUsers(userList) {
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
            `${userList.length} ${userList.length === 1
                ? "member"
                : "members"
            }`;
    }

    if (userList.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="admin-table-empty">
                    No members found.
                </td>
            </tr>
        `;

        return;
    }

    tableBody.innerHTML = userList
        .map(createUserRow)
        .join("");
}

function createUserRow(user) {
    const bookingCount =
        Number(user.bookingCount) || 0;

    const openBookingCount =
        Number(user.openBookingCount) || 0;

    return `
        <tr>
            <td>
                <strong>
                    ${escapeHtml(getFullName(user))}
                </strong>

                <small>
                    Member ID ${escapeHtml(user.id)}
                </small>
            </td>

            <td>
                <span>
                    ${escapeHtml(user.email)}
                </span>
            </td>

            <td>
                <span class="${getRoleClass(user.role)}">
                    ${escapeHtml(formatRole(user.role))}
                </span>
            </td>

            <td>
                <strong>
                    ${bookingCount}
                </strong>

                <small>
                    ${bookingCount === 1
            ? "Total booking"
            : "Total bookings"
        }
                </small>
            </td>

            <td>
                <strong>
                    ${openBookingCount}
                </strong>

                <small>
                    ${getOpenBookingLabel(openBookingCount)}
                </small>
            </td>

            <td>
                <strong>
                    ${formatDate(user.createdAt)}
                </strong>
            </td>
        </tr>
    `;
}

function getOpenBookingLabel(count) {
    if (count === 0) {
        return "No open bookings";
    }

    if (count === 1) {
        return "Open booking";
    }

    return "Open bookings";
}

/* ================================================================
   STATISTICS
================================================================ */

function renderUserStats(userList) {
    setStat(
        "total",
        userList.length,
    );

    setStat(
        "passengers",
        userList.filter(
            (user) =>
                user.role === "SPACE_TOURIST",
        ).length,
    );

    setStat(
        "open-bookings",
        userList.filter(
            (user) =>
                Number(user.openBookingCount) > 0,
        ).length,
    );

    setStat(
        "bookings",
        userList.reduce(
            (total, user) =>
                total + (Number(user.bookingCount) || 0),
            0,
        ),
    );
}

function setStat(name, value) {
    const element = document.querySelector(
        `[data-user-stat="${name}"]`,
    );

    if (element) {
        element.textContent = value;
    }
}

/* ================================================================
   ERROR HANDLING
================================================================ */

function showUsersError(message) {
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
                <td colspan="6" class="admin-table-empty">
                    ${escapeHtml(message)}
                </td>
            </tr>
        `;
    }
}

/* ================================================================
   FORMATTING
================================================================ */

function getFullName(user) {
    const name = [
        user.firstName,
        user.lastName,
    ]
        .filter(Boolean)
        .join(" ");

    return name || "Unknown member";
}

function formatRole(role) {
    const roles = {
        SPACE_TOURIST: "Space tourist",
        ADMIN: "Administrator",
    };

    return roles[role] ?? role ?? "Unknown";
}

function getRoleClass(role) {
    if (role === "ADMIN") {
        return "admin-status admin-status-active";
    }

    return "admin-status admin-status-confirmed";
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

function escapeHtml(value) {
    const element = document.createElement("div");

    element.textContent = value ?? "";

    return element.innerHTML;
}