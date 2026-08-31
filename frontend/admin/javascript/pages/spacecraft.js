import {
    apiGet,
    apiPost,
} from "../../../javascript/api.js";

let spacecraft = [];
let spacecraftModels = [];

/* ================================================================
   SPACECRAFT PAGE
================================================================ */

export async function initSpacecraftPage() {
    const tableBody = document.querySelector(
        ".admin-flight-table tbody",
    );

    if (!tableBody) {
        return;
    }

    bindSpacecraftFilters();
    await loadSpacecraft();
}

async function loadSpacecraft() {
    try {
        const response = await apiGet("/admin/spacecraft");

        spacecraft = await response.json();

        renderSpacecraftStats(spacecraft);
        renderSpacecraft(spacecraft);
    } catch (error) {
        console.error("Could not load spacecraft:", error);

        showSpacecraftError(
            error.message || "Could not load spacecraft.",
        );
    }
}

/* ================================================================
   FILTERING
================================================================ */

function bindSpacecraftFilters() {
    const form = document.querySelector(
        ".admin-flight-filters",
    );

    if (!form) {
        return;
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        applySpacecraftFilters();
    });
}

function applySpacecraftFilters() {
    const search =
        document
            .getElementById("spacecraft-search")
            ?.value.trim()
            .toLowerCase() ?? "";

    const status =
        document.getElementById(
            "spacecraft-status-filter",
        )?.value ?? "";

    const operational =
        document.getElementById(
            "spacecraft-operation-filter",
        )?.value ?? "";

    const filteredSpacecraft = spacecraft.filter((craft) => {
        const matchesSearch =
            !search ||
            craft.name?.toLowerCase().includes(search) ||
            craft.model?.toLowerCase().includes(search) ||
            craft.manufacturer?.toLowerCase().includes(search);

        const matchesStatus =
            !status ||
            craft.status === status;

        const matchesOperational =
            !operational ||
            String(craft.operational) === operational;

        return (
            matchesSearch &&
            matchesStatus &&
            matchesOperational
        );
    });

    renderSpacecraft(filteredSpacecraft);
}

/* ================================================================
   SPACECRAFT TABLE
================================================================ */

function renderSpacecraft(spacecraftList) {
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
            `${spacecraftList.length} spacecraft`;
    }

    if (spacecraftList.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="admin-table-empty">
                    No spacecraft found.
                </td>
            </tr>
        `;

        return;
    }

    tableBody.innerHTML = spacecraftList
        .map(createSpacecraftRow)
        .join("");
}

function createSpacecraftRow(craft) {
    return `
        <tr>
            <td>
                <strong>${escapeHtml(craft.name)}</strong>
                <small>
                    Craft ID ${escapeHtml(craft.id)}
                </small>
            </td>

            <td>
                <strong>${escapeHtml(craft.model)}</strong>
            </td>

            <td>
                <span>${escapeHtml(craft.manufacturer)}</span>
            </td>

            <td>
                <strong>${formatCapacity(craft.seatCapacity)}</strong>
                <small>Passenger seats</small>
            </td>

            <td>
                <span class="${getStatusClass(craft.status)}">
                    ${escapeHtml(formatStatus(craft.status))}
                </span>
            </td>

            <td>
                ${createOperationalStatus(craft.operational)}
            </td>

            <td>
                <button
                    type="button"
                    class="admin-row-action"
                    aria-label="View ${escapeHtml(craft.name)}"
                    data-spacecraft-id="${escapeHtml(craft.id)}"
                >
                    →
                </button>
            </td>
        </tr>
    `;
}

function createOperationalStatus(operational) {
    if (operational) {
        return `
            <span class="admin-status admin-status-confirmed">
                Operational
            </span>
        `;
    }

    return `
        <span class="admin-status admin-status-cancelled">
            Unavailable
        </span>
    `;
}

/* ================================================================
   STATISTICS
================================================================ */

function renderSpacecraftStats(spacecraftList) {
    setStat(
        "total",
        spacecraftList.length,
    );

    setStat(
        "operational",
        spacecraftList.filter(
            (craft) => craft.operational,
        ).length,
    );

    setStat(
        "service",
        spacecraftList.filter(
            (craft) => isInService(craft.status),
        ).length,
    );

    setStat(
        "maintenance",
        spacecraftList.filter(
            (craft) =>
                craft.status === "UNDER_MAINTENANCE",
        ).length,
    );
}

function setStat(name, value) {
    const element = document.querySelector(
        `[data-spacecraft-stat="${name}"]`,
    );

    if (element) {
        element.textContent = value;
    }
}

function isInService(status) {
    const activeStatuses = [
        "LAUNCHING",
        "EXITING",
        "ORBITING",
        "CRUISING",
        "ENTERING",
        "LANDING",
        "BOARDING",
    ];

    return activeStatuses.includes(status);
}

/* ================================================================
   CREATE SPACECRAFT PAGE
================================================================ */

export async function initCreateSpacecraftPage() {
    const form = document.getElementById(
        "create-spacecraft-form",
    );

    if (!form) {
        return;
    }

    bindCreateSpacecraftEvents(form);
    await loadSpacecraftModels();
    updateSpacecraftPreview();
}

async function loadSpacecraftModels() {
    const select = document.getElementById(
        "spacecraft-model",
    );

    try {
        const response = await apiGet(
            "/admin/spacecraft-models",
        );

        spacecraftModels = await response.json();

        renderSpacecraftModels(select);
    } catch (error) {
        console.error(
            "Could not load spacecraft models:",
            error,
        );

        showCreateSpacecraftMessage(
            error.message ||
            "Could not load spacecraft models.",
        );

        if (select) {
            select.innerHTML = `
                <option value="">
                    Could not load models
                </option>
            `;

            select.disabled = true;
        }
    }
}

function renderSpacecraftModels(select) {
    if (!select) {
        return;
    }

    select.innerHTML = `
        <option value="">Select model</option>

        ${spacecraftModels
            .map((model) => `
                <option value="${escapeHtml(model.id)}">
                    ${escapeHtml(model.name)}
                    ·
                    ${escapeHtml(model.manufacturer)}
                </option>
            `)
            .join("")}
    `;
}

/* ================================================================
   CREATE SPACECRAFT EVENTS
================================================================ */

function bindCreateSpacecraftEvents(form) {
    form.addEventListener(
        "submit",
        handleCreateSpacecraft,
    );

    form.addEventListener(
        "input",
        updateSpacecraftPreview,
    );

    form.addEventListener(
        "change",
        updateSpacecraftPreview,
    );
}

async function handleCreateSpacecraft(event) {
    event.preventDefault();

    const form = event.currentTarget;

    const submitButton =
        document.getElementById(
            "create-spacecraft-submit",
        );

    clearCreateSpacecraftMessage();

    if (!form.reportValidity()) {
        return;
    }

    const formData = new FormData(form);

    const request = {
        name: formData.get("name").trim(),
        modelId: Number(formData.get("modelId")),
        seatCapacity: Number(
            formData.get("seatCapacity"),
        ),
        status: formData.get("status"),
        operational:
            formData.get("operational") === "true",
    };

    try {
        setSubmitting(submitButton, true);

        await apiPost(
            "/admin/spacecraft",
            request,
        );

        window.location.hash = "spacecrafts";
    } catch (error) {
        console.error(
            "Could not create spacecraft:",
            error,
        );

        showCreateSpacecraftMessage(
            error.message ||
            "Could not create spacecraft.",
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
            Add spacecraft
        `;
}

/* ================================================================
   CREATE SPACECRAFT PREVIEW
================================================================ */

function updateSpacecraftPreview() {
    const name =
        document
            .getElementById("spacecraft-name")
            ?.value.trim() ?? "";

    const modelId =
        document.getElementById(
            "spacecraft-model",
        )?.value ?? "";

    const capacity =
        document.getElementById(
            "spacecraft-capacity",
        )?.value ?? "";

    const status =
        document.getElementById(
            "spacecraft-status",
        )?.value ?? "";

    const operational =
        document.getElementById(
            "spacecraft-operational",
        )?.value ?? "true";

    const model = spacecraftModels.find(
        (item) =>
            String(item.id) === String(modelId),
    );

    setText(
        "preview-spacecraft-name",
        name || "Not set",
    );

    setText(
        "preview-spacecraft-model",
        model
            ? `${model.name} · ${model.manufacturer}`
            : "Not assigned",
    );

    setText(
        "preview-spacecraft-capacity",
        capacity
            ? `${Number(capacity).toLocaleString("en-US")} seats`
            : "Not set",
    );

    setText(
        "preview-spacecraft-operational",
        operational === "true"
            ? "Yes"
            : "No",
    );

    const statusElement = document.getElementById(
        "preview-spacecraft-status",
    );

    if (statusElement) {
        statusElement.textContent =
            formatStatus(status);

        statusElement.className =
            getStatusClass(status);
    }
}

/* ================================================================
   ERROR HANDLING
================================================================ */

function showSpacecraftError(message) {
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
                <td colspan="7" class="admin-table-empty">
                    ${escapeHtml(message)}
                </td>
            </tr>
        `;
    }
}

function showCreateSpacecraftMessage(message) {
    const element = document.getElementById(
        "create-spacecraft-message",
    );

    if (element) {
        element.textContent = message;
    }
}

function clearCreateSpacecraftMessage() {
    showCreateSpacecraftMessage("");
}

/* ================================================================
   FORMATTING
================================================================ */

function formatStatus(status) {
    if (!status) {
        return "Unknown";
    }

    return status
        .toLowerCase()
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase(),
        );
}

function getStatusClass(status) {
    if (status === "UNDER_MAINTENANCE") {
        return "admin-status admin-status-cancelled";
    }

    if (status === "RETIRED") {
        return "admin-status admin-status-cancelled";
    }

    if (
        status === "BOARDING" ||
        status === "LAUNCHING" ||
        status === "CRUISING" ||
        status === "ORBITING" ||
        status === "EXITING" ||
        status === "ENTERING" ||
        status === "LANDING"
    ) {
        return "admin-status admin-status-active";
    }

    return "admin-status admin-status-scheduled";
}

function formatCapacity(capacity) {
    const value = Number(capacity);

    if (!Number.isFinite(value)) {
        return "—";
    }

    return value.toLocaleString("en-US");
}

function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}

function escapeHtml(value) {
    const element = document.createElement("div");

    element.textContent = value ?? "";

    return element.innerHTML;
}