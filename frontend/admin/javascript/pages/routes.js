import {
    apiGet,
    apiPost,
} from "../../../javascript/api.js";

let routes = [];
let spaceports = [];

/* ================================================================
   ROUTES PAGE
================================================================ */

export async function initRoutesPage() {
    const tableBody = document.querySelector(
        ".admin-flight-table tbody",
    );

    if (!tableBody) {
        return;
    }

    bindRouteFilters();
    await loadRoutes();
}

async function loadRoutes() {
    try {
        const response = await apiGet("/admin/routes");

        routes = await response.json();

        renderRouteFilters(routes);
        renderRouteStats(routes);
        renderRoutes(routes);
    } catch (error) {
        console.error("Could not load routes:", error);

        showRoutesError(
            error.message || "Could not load routes.",
        );
    }
}

/* ================================================================
   FILTERING
================================================================ */

function bindRouteFilters() {
    const form = document.querySelector(".admin-flight-filters");

    if (!form) {
        return;
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        applyRouteFilters();
    });
}

function applyRouteFilters() {
    const search = document
        .getElementById("route-search")
        ?.value.trim()
        .toLowerCase() ?? "";

    const originCode =
        document.getElementById("route-origin-filter")?.value ?? "";

    const destinationCode =
        document.getElementById("route-destination-filter")?.value ?? "";

    const filteredRoutes = routes.filter((route) => {
        const origin = route.originSpaceport;
        const destination = route.destinationSpaceport;

        const matchesSearch =
            !search ||
            route.name?.toLowerCase().includes(search) ||
            route.description?.toLowerCase().includes(search) ||
            origin?.name?.toLowerCase().includes(search) ||
            origin?.code?.toLowerCase().includes(search) ||
            destination?.name?.toLowerCase().includes(search) ||
            destination?.code?.toLowerCase().includes(search);

        const matchesOrigin =
            !originCode ||
            origin?.code === originCode;

        const matchesDestination =
            !destinationCode ||
            destination?.code === destinationCode;

        return (
            matchesSearch &&
            matchesOrigin &&
            matchesDestination
        );
    });

    renderRoutes(filteredRoutes);
}

function renderRouteFilters(routeList) {
    const originSelect =
        document.getElementById("route-origin-filter");

    const destinationSelect =
        document.getElementById("route-destination-filter");

    if (!originSelect || !destinationSelect) {
        return;
    }

    const availableSpaceports = getUniqueRouteSpaceports(routeList);

    originSelect.innerHTML = `
        <option value="">All origins</option>
        ${availableSpaceports
            .map(createSpaceportFilterOption)
            .join("")}
    `;

    destinationSelect.innerHTML = `
        <option value="">All destinations</option>
        ${availableSpaceports
            .map(createSpaceportFilterOption)
            .join("")}
    `;
}

function getUniqueRouteSpaceports(routeList) {
    const uniqueSpaceports = new Map();

    routeList.forEach((route) => {
        const routeSpaceports = [
            route.originSpaceport,
            route.destinationSpaceport,
        ];

        routeSpaceports.forEach((spaceport) => {
            if (spaceport?.code) {
                uniqueSpaceports.set(
                    spaceport.code,
                    spaceport,
                );
            }
        });
    });

    return Array.from(uniqueSpaceports.values())
        .sort((a, b) => a.name.localeCompare(b.name));
}

function createSpaceportFilterOption(spaceport) {
    return `
        <option value="${escapeHtml(spaceport.code)}">
            ${escapeHtml(spaceport.code)} · ${escapeHtml(spaceport.name)}
        </option>
    `;
}

/* ================================================================
   ROUTE TABLE
================================================================ */

function renderRoutes(routeList) {
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
            `${routeList.length} ${routeList.length === 1 ? "route" : "routes"}`;
    }

    if (routeList.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="admin-table-empty">
                    No routes found.
                </td>
            </tr>
        `;

        return;
    }

    tableBody.innerHTML = routeList
        .map(createRouteRow)
        .join("");
}

function createRouteRow(route) {
    const origin = route.originSpaceport;
    const destination = route.destinationSpaceport;

    return `
        <tr>
            <td>
                <strong>${escapeHtml(route.name)}</strong>
                <small>Route ID ${escapeHtml(route.id)}</small>
            </td>

            <td>
                <strong>${escapeHtml(origin?.code ?? "—")}</strong>
                <small>${escapeHtml(origin?.name ?? "Unknown")}</small>
            </td>

            <td>
                <strong>${escapeHtml(destination?.code ?? "—")}</strong>
                <small>${escapeHtml(destination?.name ?? "Unknown")}</small>
            </td>

            <td>
                <strong>${formatDistance(route.distance)}</strong>
            </td>

            <td>
                <span>${escapeHtml(route.description || "No description")}</span>
            </td>

            <td>
                <button
                    type="button"
                    class="admin-row-action"
                    aria-label="View ${escapeHtml(route.name)}"
                    data-route-id="${escapeHtml(route.id)}"
                >
                    →
                </button>
            </td>
        </tr>
    `;
}

/* ================================================================
   ROUTE STATISTICS
================================================================ */

function renderRouteStats(routeList) {
    const totalElement = document.querySelector(
        '[data-route-stat="total"]',
    );

    const spaceportsElement = document.querySelector(
        '[data-route-stat="spaceports"]',
    );

    const shortestElement = document.querySelector(
        '[data-route-stat="shortest"]',
    );

    const longestElement = document.querySelector(
        '[data-route-stat="longest"]',
    );

    if (totalElement) {
        totalElement.textContent = routeList.length;
    }

    if (spaceportsElement) {
        spaceportsElement.textContent =
            getUniqueRouteSpaceports(routeList).length;
    }

    const distances = routeList
        .map((route) => Number(route.distance))
        .filter((distance) => Number.isFinite(distance));

    if (shortestElement) {
        shortestElement.textContent =
            distances.length > 0
                ? formatCompactDistance(Math.min(...distances))
                : "—";
    }

    if (longestElement) {
        longestElement.textContent =
            distances.length > 0
                ? formatCompactDistance(Math.max(...distances))
                : "—";
    }
}

function showRoutesError(message) {
    const tableBody = document.querySelector(
        ".admin-flight-table tbody",
    );

    const resultCount = document.querySelector(
        ".admin-table-result-count",
    );

    if (resultCount) {
        resultCount.textContent = "Unable to load";
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
   CREATE ROUTE PAGE
================================================================ */

export async function initCreateRoutePage() {
    const form = document.getElementById("create-route-form");

    if (!form) {
        return;
    }

    bindCreateRouteEvents(form);
    await loadSpaceports();
}

async function loadSpaceports() {
    const originSelect =
        document.getElementById("route-origin");

    const destinationSelect =
        document.getElementById("route-destination");

    try {
        const response = await apiGet("/admin/spaceports");

        spaceports = await response.json();

        renderSpaceportOptions(
            originSelect,
            "Select origin",
        );

        renderSpaceportOptions(
            destinationSelect,
            "Select destination",
        );

        updateRoutePreview();
    } catch (error) {
        console.error("Could not load spaceports:", error);

        showCreateRouteMessage(
            error.message || "Could not load spaceports.",
        );

        disableSelect(
            originSelect,
            "Could not load origins",
        );

        disableSelect(
            destinationSelect,
            "Could not load destinations",
        );
    }
}

function renderSpaceportOptions(select, placeholder) {
    if (!select) {
        return;
    }

    select.innerHTML = `
        <option value="">${placeholder}</option>

        ${spaceports
            .map((spaceport) => `
                <option value="${escapeHtml(spaceport.id)}">
                    ${escapeHtml(spaceport.code)} · ${escapeHtml(spaceport.name)}
                </option>
            `)
            .join("")}
    `;
}

function disableSelect(select, message) {
    if (!select) {
        return;
    }

    select.innerHTML = `
        <option value="">${escapeHtml(message)}</option>
    `;

    select.disabled = true;
}

/* ================================================================
   CREATE ROUTE EVENTS
================================================================ */

function bindCreateRouteEvents(form) {
    form.addEventListener("submit", handleCreateRoute);

    form.addEventListener("input", updateRoutePreview);
    form.addEventListener("change", updateRoutePreview);
}

async function handleCreateRoute(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const submitButton =
        document.getElementById("create-route-submit");

    clearCreateRouteMessage();

    if (!form.reportValidity()) {
        return;
    }

    const formData = new FormData(form);

    const originSpaceportId =
        Number(formData.get("originSpaceportId"));

    const destinationSpaceportId =
        Number(formData.get("destinationSpaceportId"));

    if (originSpaceportId === destinationSpaceportId) {
        showCreateRouteMessage(
            "Origin and destination must be different spaceports.",
        );

        return;
    }

    const route = {
        name: formData.get("name").trim(),
        originSpaceportId,
        destinationSpaceportId,
        distance: Number(formData.get("distance")),
        description:
            formData.get("description").trim() || null,
    };

    try {
        setSubmitting(submitButton, true);

        await apiPost("/admin/routes", route);

        window.location.hash = "routes";
    } catch (error) {
        console.error("Could not create route:", error);

        showCreateRouteMessage(
            error.message || "Could not create route.",
        );
    } finally {
        setSubmitting(submitButton, false);
    }
}

function setSubmitting(button, submitting) {
    if (!button) {
        return;
    }

    button.disabled = submitting;

    button.innerHTML = submitting
        ? "Creating..."
        : `
            <span>+</span>
            Create route
        `;
}

/* ================================================================
   CREATE ROUTE PREVIEW
================================================================ */

function updateRoutePreview() {
    const name =
        document.getElementById("route-name")?.value.trim() ?? "";

    const originId =
        document.getElementById("route-origin")?.value ?? "";

    const destinationId =
        document.getElementById("route-destination")?.value ?? "";

    const distance =
        document.getElementById("route-distance")?.value ?? "";

    const origin = findSpaceport(originId);
    const destination = findSpaceport(destinationId);

    setText(
        "preview-route-origin-code",
        origin?.code ?? "—",
    );

    setText(
        "preview-route-destination-code",
        destination?.code ?? "—",
    );

    setText(
        "preview-route-name",
        name || "Not set",
    );

    setText(
        "preview-route-origin",
        origin?.name ?? "Not set",
    );

    setText(
        "preview-route-destination",
        destination?.name ?? "Not set",
    );

    setText(
        "preview-route-distance",
        distance
            ? formatDistance(Number(distance))
            : "Not set",
    );
}

function findSpaceport(id) {
    return spaceports.find(
        (spaceport) => String(spaceport.id) === String(id),
    );
}

function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}

/* ================================================================
   CREATE ROUTE MESSAGE
================================================================ */

function showCreateRouteMessage(message) {
    const messageElement =
        document.getElementById("create-route-message");

    if (messageElement) {
        messageElement.textContent = message;
    }
}

function clearCreateRouteMessage() {
    showCreateRouteMessage("");
}

/* ================================================================
   FORMATTING
================================================================ */

function formatDistance(distance) {
    const numericDistance = Number(distance);

    if (!Number.isFinite(numericDistance)) {
        return "—";
    }

    return `${numericDistance.toLocaleString("en-US")} km`;
}

function formatCompactDistance(distance) {
    const numericDistance = Number(distance);

    if (!Number.isFinite(numericDistance)) {
        return "—";
    }

    if (numericDistance >= 1_000_000_000) {
        return `${formatCompactNumber(
            numericDistance / 1_000_000_000,
        )}b`;
    }

    if (numericDistance >= 1_000_000) {
        return `${formatCompactNumber(
            numericDistance / 1_000_000,
        )}m`;
    }

    if (numericDistance >= 1_000) {
        return `${formatCompactNumber(
            numericDistance / 1_000,
        )}k`;
    }

    return numericDistance.toLocaleString("en-US");
}

function formatCompactNumber(value) {
    return Number.isInteger(value)
        ? value.toString()
        : value.toFixed(1).replace(/\.0$/, "");
}

function escapeHtml(value) {
    const element = document.createElement("div");

    element.textContent = value ?? "";

    return element.innerHTML;
}