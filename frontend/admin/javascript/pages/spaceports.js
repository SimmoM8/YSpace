import {
    apiGet,
    apiPost,
} from "../../../javascript/api.js";

let spaceports = [];

/* ================================================================
   SPACEPORTS PAGE
================================================================ */

export async function initSpaceportsPage() {
    const tableBody = document.querySelector(
        ".admin-flight-table tbody",
    );

    if (!tableBody) {
        return;
    }

    bindSpaceportFilters();
    await loadSpaceports();
}

async function loadSpaceports() {
    try {
        const response = await apiGet("/admin/spaceports");

        spaceports = await response.json();

        renderSpaceportStats(spaceports);
        renderSpaceports(spaceports);
    } catch (error) {
        console.error("Could not load spaceports:", error);

        showSpaceportsError(
            error.message || "Could not load spaceports.",
        );
    }
}

/* ================================================================
   FILTERING
================================================================ */

function bindSpaceportFilters() {
    const form = document.querySelector(".admin-flight-filters");

    if (!form) {
        return;
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        applySpaceportFilters();
    });
}

function applySpaceportFilters() {
    const search =
        document
            .getElementById("spaceport-search")
            ?.value.trim()
            .toLowerCase() ?? "";

    const type =
        document.getElementById("spaceport-type-filter")?.value ?? "";

    const code =
        document
            .getElementById("spaceport-code-filter")
            ?.value.trim()
            .toLowerCase() ?? "";

    const filteredSpaceports = spaceports.filter((spaceport) => {
        const matchesSearch =
            !search ||
            spaceport.name?.toLowerCase().includes(search) ||
            spaceport.code?.toLowerCase().includes(search) ||
            spaceport.description?.toLowerCase().includes(search);

        const matchesType =
            !type ||
            spaceport.type === type;

        const matchesCode =
            !code ||
            spaceport.code?.toLowerCase().includes(code);

        return (
            matchesSearch &&
            matchesType &&
            matchesCode
        );
    });

    renderSpaceports(filteredSpaceports);
}

/* ================================================================
   SPACEPORT TABLE
================================================================ */

function renderSpaceports(spaceportList) {
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
            `${spaceportList.length} ${spaceportList.length === 1
                ? "spaceport"
                : "spaceports"
            }`;
    }

    if (spaceportList.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="admin-table-empty">
                    No spaceports found.
                </td>
            </tr>
        `;

        return;
    }

    tableBody.innerHTML = spaceportList
        .map(createSpaceportRow)
        .join("");
}

function createSpaceportRow(spaceport) {
    return `
        <tr>
            <td>
                <strong>${escapeHtml(spaceport.name)}</strong>
                <small>
                    Spaceport ID ${escapeHtml(spaceport.id)}
                </small>
            </td>

            <td>
                <strong>${escapeHtml(spaceport.code)}</strong>
            </td>

            <td>
                <span class="${getSpaceportTypeClass(spaceport.type)}">
                    ${escapeHtml(formatSpaceportType(spaceport.type))}
                </span>
            </td>

            <td>
                <span>
                    ${escapeHtml(
        spaceport.description || "No description",
    )}
                </span>
            </td>

            <td>
                ${createNetworkCell(spaceport)}
            </td>

            <td>
                <button
                    type="button"
                    class="admin-row-action"
                    aria-label="View ${escapeHtml(spaceport.name)}"
                    data-spaceport-id="${escapeHtml(spaceport.id)}"
                >
                    →
                </button>
            </td>
        </tr>
    `;
}

function createNetworkCell(spaceport) {
    const routeCount = getRouteCount(spaceport);

    if (routeCount === null) {
        return `
            <strong>—</strong>
            <small>Network data unavailable</small>
        `;
    }

    return `
        <strong>
            ${routeCount}
            ${routeCount === 1 ? "route" : "routes"}
        </strong>

        <small>
            ${routeCount > 0 ? "Connected" : "No routes"}
        </small>
    `;
}

function getRouteCount(spaceport) {
    if (Number.isFinite(Number(spaceport.routeCount))) {
        return Number(spaceport.routeCount);
    }

    if (Array.isArray(spaceport.routes)) {
        return spaceport.routes.length;
    }

    return null;
}

/* ================================================================
   SPACEPORT STATISTICS
================================================================ */

function renderSpaceportStats(spaceportList) {
    const totalElement = document.querySelector(
        '[data-spaceport-stat="total"]',
    );

    const stationsElement = document.querySelector(
        '[data-spaceport-stat="stations"]',
    );

    const planetsElement = document.querySelector(
        '[data-spaceport-stat="planets"]',
    );

    const moonsElement = document.querySelector(
        '[data-spaceport-stat="moons"]',
    );

    if (totalElement) {
        totalElement.textContent = spaceportList.length;
    }

    if (stationsElement) {
        stationsElement.textContent =
            countSpaceportsByType(
                spaceportList,
                "STATION",
            );
    }

    if (planetsElement) {
        planetsElement.textContent =
            countSpaceportsByType(
                spaceportList,
                "PLANET",
            );
    }

    if (moonsElement) {
        moonsElement.textContent =
            countSpaceportsByType(
                spaceportList,
                "MOON",
            );
    }
}

function countSpaceportsByType(spaceportList, type) {
    return spaceportList.filter(
        (spaceport) => spaceport.type === type,
    ).length;
}

/* ================================================================
   CREATE SPACEPORT PAGE
================================================================ */

export function initCreateSpaceportPage() {
    const form = document.getElementById(
        "create-spaceport-form",
    );

    if (!form) {
        return;
    }

    bindCreateSpaceportEvents(form);
    updateSpaceportPreview();
}

function bindCreateSpaceportEvents(form) {
    form.addEventListener(
        "submit",
        handleCreateSpaceport,
    );

    form.addEventListener(
        "input",
        updateSpaceportPreview,
    );

    form.addEventListener(
        "change",
        updateSpaceportPreview,
    );

    const codeInput =
        document.getElementById("spaceport-code");

    codeInput?.addEventListener("input", () => {
        const selectionStart =
            codeInput.selectionStart;

        const selectionEnd =
            codeInput.selectionEnd;

        codeInput.value =
            codeInput.value.toUpperCase();

        codeInput.setSelectionRange(
            selectionStart,
            selectionEnd,
        );
    });
}

/* ================================================================
   CREATE SPACEPORT
================================================================ */

async function handleCreateSpaceport(event) {
    event.preventDefault();

    const form = event.currentTarget;

    const submitButton =
        document.getElementById(
            "create-spaceport-submit",
        );

    clearCreateSpaceportMessage();

    if (!form.reportValidity()) {
        return;
    }

    const formData = new FormData(form);

    const spaceport = {
        name: formData.get("name").trim(),
        code: formData
            .get("code")
            .trim()
            .toUpperCase(),
        type: formData.get("type"),
        description:
            formData.get("description").trim() || null,
        imageUrl:
            formData.get("imageUrl").trim() || null,
    };

    try {
        setSubmitting(submitButton, true);

        await apiPost(
            "/admin/spaceports",
            spaceport,
        );

        window.location.hash = "spaceports";
    } catch (error) {
        console.error(
            "Could not create spaceport:",
            error,
        );

        showCreateSpaceportMessage(
            error.message ||
            "Could not create spaceport.",
        );
    } finally {
        setSubmitting(
            submitButton,
            false,
        );
    }
}

function setSubmitting(button, submitting) {
    if (!button) {
        return;
    }

    button.disabled = submitting;

    button.innerHTML = submitting
        ? "Adding..."
        : `
            <span>+</span>
            Add spaceport
        `;
}

/* ================================================================
   CREATE SPACEPORT PREVIEW
================================================================ */

function updateSpaceportPreview() {
    const name =
        document
            .getElementById("spaceport-name")
            ?.value.trim() ?? "";

    const code =
        document
            .getElementById("spaceport-code")
            ?.value.trim()
            .toUpperCase() ?? "";

    const type =
        document.getElementById(
            "spaceport-type",
        )?.value ?? "";

    setText(
        "preview-spaceport-code",
        code || "---",
    );

    setText(
        "preview-spaceport-name",
        name || "Not set",
    );

    setText(
        "preview-spaceport-code-detail",
        code || "Not set",
    );

    setText(
        "preview-spaceport-type",
        type
            ? formatSpaceportType(type)
            : "Not set",
    );
}

/* ================================================================
   ERROR HANDLING
================================================================ */

function showSpaceportsError(message) {
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

function showCreateSpaceportMessage(message) {
    const messageElement =
        document.getElementById(
            "create-spaceport-message",
        );

    if (messageElement) {
        messageElement.textContent = message;
    }
}

function clearCreateSpaceportMessage() {
    showCreateSpaceportMessage("");
}

/* ================================================================
   FORMATTING
================================================================ */

function formatSpaceportType(type) {
    const types = {
        PLANET: "Planet",
        MOON: "Moon",
        STATION: "Station",
    };

    return types[type] ?? type ?? "Unknown";
}

function getSpaceportTypeClass(type) {
    const classes = {
        STATION:
            "admin-status admin-status-active",

        MOON:
            "admin-status admin-status-scheduled",

        PLANET:
            "admin-status admin-status-scheduled",
    };

    return (
        classes[type] ??
        "admin-status admin-status-scheduled"
    );
}

function setText(id, value) {
    const element =
        document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}

function escapeHtml(value) {
    const element =
        document.createElement("div");

    element.textContent = value ?? "";

    return element.innerHTML;
}