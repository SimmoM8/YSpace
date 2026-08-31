import { apiGet } from "../../../javascript/api.js";

let modalElement = null;
let activeConfig = null;
let activeDetailUrl = null;
let activeEntity = null;
let keydownBound = false;

export function bindAdminEditActions({
    selector,
    getId,
    config,
}) {
    const content = document.getElementById("admin-content");

    if (!content) {
        return;
    }

    content.addEventListener("click", async (event) => {
        const action = event.target.closest(selector);

        if (!action || !content.contains(action)) {
            return;
        }

        event.preventDefault();

        const id = getId(action);

        if (id == null || id === "") {
            return;
        }

        await openAdminEditModal(config, id);
    });
}

export async function openAdminEditModal(config, id) {
    ensureModal();

    activeConfig = config;
    activeDetailUrl = null;
    activeEntity = null;

    openModalShell(config, id);

    try {
        const [detailResponse, optionData] = await Promise.all([
            apiGet(`${config.endpoint}/${encodeURIComponent(id)}`),
            loadOptionData(config.fields),
        ]);

        activeDetailUrl = detailResponse.url;
        activeEntity = await detailResponse.json();

        renderEntityForm(config, activeEntity, optionData);
    } catch (error) {
        console.error(`Could not load ${config.singular}:`, error);
        renderLoadError(
            error.message || `Could not load ${config.singular}.`,
        );
    }
}

function ensureModal() {
    if (modalElement) {
        return;
    }

    modalElement = document.createElement("div");
    modalElement.className = "admin-edit-modal";
    modalElement.hidden = true;
    modalElement.innerHTML = `
        <button
            type="button"
            class="admin-edit-modal-backdrop"
            data-modal-close
            aria-label="Close editor"
            tabindex="-1"
        ></button>

        <section
            class="admin-edit-modal-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-edit-modal-title"
        >
            <header class="admin-edit-modal-header">
                <div>
                    <p class="admin-edit-modal-kicker" id="admin-edit-modal-kicker">
                        EDIT RECORD
                    </p>
                    <h2 id="admin-edit-modal-title">Loading...</h2>
                </div>

                <button
                    type="button"
                    class="admin-edit-modal-close"
                    data-modal-close
                    aria-label="Close"
                >
                    ×
                </button>
            </header>

            <div class="admin-edit-modal-body" id="admin-edit-modal-body"></div>
        </section>
    `;

    document.body.append(modalElement);

    modalElement.addEventListener("click", (event) => {
        if (event.target.closest("[data-modal-close]")) {
            closeAdminEditModal();
        }
    });

    if (!keydownBound) {
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && !modalElement?.hidden) {
                closeAdminEditModal();
            }
        });

        keydownBound = true;
    }
}

function openModalShell(config, id) {
    modalElement.hidden = false;
    document.body.classList.add("admin-modal-open");

    setText("admin-edit-modal-kicker", `${config.singular.toUpperCase()} DETAILS`);
    setText("admin-edit-modal-title", `${config.title} ${id}`);

    getBody().innerHTML = `
        <div class="admin-edit-modal-loading">
            Loading ${escapeHtml(config.singular)} details...
        </div>
    `;
}

function closeAdminEditModal() {
    if (!modalElement) {
        return;
    }

    modalElement.hidden = true;
    document.body.classList.remove("admin-modal-open");

    activeConfig = null;
    activeDetailUrl = null;
    activeEntity = null;
}

async function loadOptionData(fields) {
    const optionFields = fields.filter((field) => field.optionsEndpoint);
    const uniqueEndpoints = [...new Set(
        optionFields.map((field) => field.optionsEndpoint),
    )];

    const entries = await Promise.all(
        uniqueEndpoints.map(async (endpoint) => {
            const response = await apiGet(endpoint);
            return [endpoint, await response.json()];
        }),
    );

    return Object.fromEntries(entries);
}

function renderEntityForm(config, entity, optionData) {
    const body = getBody();

    const meta = (config.meta ?? [])
        .map((item) => createMetaItem(item, entity))
        .join("");

    body.innerHTML = `
        ${meta ? `<div class="admin-edit-modal-meta">${meta}</div>` : ""}

        <form class="admin-edit-modal-form" id="admin-edit-form">
            ${config.fields
                .map((field) => createField(field, entity, optionData))
                .join("")}

            <p class="admin-edit-modal-message" id="admin-edit-modal-message"></p>
        </form>
    `;

    const dialog = modalElement.querySelector(".admin-edit-modal-dialog");
    const oldFooter = dialog.querySelector(".admin-edit-modal-footer");

    oldFooter?.remove();

    dialog.insertAdjacentHTML("beforeend", `
        <footer class="admin-edit-modal-footer">
            <span class="admin-edit-modal-footer-copy">
                Changes are saved to this ${escapeHtml(config.singular)} record.
            </span>

            <div class="admin-edit-modal-actions">
                <button
                    type="button"
                    class="admin-button admin-button-secondary"
                    data-modal-close
                >
                    Close
                </button>

                <button
                    type="submit"
                    form="admin-edit-form"
                    class="admin-button admin-button-primary"
                    id="admin-edit-save"
                >
                    Save changes
                </button>
            </div>
        </footer>
    `);

    const form = document.getElementById("admin-edit-form");
    form.addEventListener("submit", handleSave);

    setText(
        "admin-edit-modal-title",
        config.getTitle?.(entity) || `${config.title} ${entity.id ?? ""}`.trim(),
    );

    form.querySelector("input, select, textarea")?.focus();
}

function createMetaItem(item, entity) {
    const value = item.getValue
        ? item.getValue(entity)
        : getValue(entity, item.path);

    return `
        <div>
            <span>${escapeHtml(item.label)}</span>
            <strong>${escapeHtml(formatDisplayValue(value, item.format))}</strong>
        </div>
    `;
}

function createField(field, entity, optionData) {
    const rawValue = field.getValue
        ? field.getValue(entity)
        : getValue(entity, field.path ?? field.name);

    const value = normalizeInputValue(rawValue, field.type);
    const fullClass = field.fullWidth ? " admin-form-field-full" : "";
    const required = field.required ? " required" : "";
    const disabled = field.disabled ? " disabled" : "";

    let control = "";

    if (field.type === "textarea") {
        control = `
            <textarea
                id="edit-${escapeHtml(field.name)}"
                name="${escapeHtml(field.name)}"
                ${required}
                ${disabled}
            >${escapeHtml(value)}</textarea>
        `;
    } else if (field.type === "select") {
        const options = field.optionsEndpoint
            ? optionData[field.optionsEndpoint] ?? []
            : field.options ?? [];

        control = `
            <select
                id="edit-${escapeHtml(field.name)}"
                name="${escapeHtml(field.name)}"
                ${required}
                ${disabled}
            >
                ${field.placeholder ? `
                    <option value="">${escapeHtml(field.placeholder)}</option>
                ` : ""}
                ${options.map((option) => createOption(field, option, value)).join("")}
            </select>
        `;
    } else {
        const inputType = field.type ?? "text";
        const min = field.min != null ? ` min="${field.min}"` : "";
        const step = field.step != null ? ` step="${field.step}"` : "";

        control = `
            <input
                type="${escapeHtml(inputType)}"
                id="edit-${escapeHtml(field.name)}"
                name="${escapeHtml(field.name)}"
                value="${escapeHtml(value)}"
                ${required}
                ${disabled}
                ${min}
                ${step}
            >
        `;
    }

    return `
        <div class="admin-form-field${fullClass}">
            <label for="edit-${escapeHtml(field.name)}">
                ${escapeHtml(field.label)}
            </label>
            ${control}
            ${field.help ? `<p class="admin-field-meta">${escapeHtml(field.help)}</p>` : ""}
        </div>
    `;
}

function createOption(field, option, selectedValue) {
    const optionValue = field.getOptionValue
        ? field.getOptionValue(option)
        : option.value ?? option.id ?? option;

    const optionLabel = field.getOptionLabel
        ? field.getOptionLabel(option)
        : option.label ?? option.name ?? option;

    const selected = String(optionValue) === String(selectedValue)
        ? " selected"
        : "";

    return `
        <option value="${escapeHtml(optionValue)}"${selected}>
            ${escapeHtml(optionLabel)}
        </option>
    `;
}

async function handleSave(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const saveButton = document.getElementById("admin-edit-save");
    const message = document.getElementById("admin-edit-modal-message");

    if (!form.reportValidity()) {
        return;
    }

    message.textContent = "";
    setSaving(saveButton, true);

    try {
        const payload = buildPayload(activeConfig, activeEntity, new FormData(form));
        const response = await authenticatedPut(activeDetailUrl, payload);

        if (!response.ok) {
            throw await createResponseError(response);
        }

        closeAdminEditModal();
        window.dispatchEvent(new Event("hashchange"));
    } catch (error) {
        console.error(`Could not update ${activeConfig?.singular}:`, error);
        message.textContent = error.message || "Could not save changes.";
    } finally {
        setSaving(saveButton, false);
    }
}

function buildPayload(config, entity, formData) {
    if (config.buildPayload) {
        return config.buildPayload(formData, entity);
    }

    return Object.fromEntries(formData.entries());
}

async function authenticatedPut(url, body) {
    if (!url) {
        throw new Error("The detail endpoint did not provide a save URL.");
    }

    const token = localStorage.getItem("token");

    return fetch(url, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
    });
}

async function createResponseError(response) {
    let message = `Request failed with status ${response.status}.`;

    try {
        const contentType = response.headers.get("content-type") ?? "";

        if (contentType.includes("application/json")) {
            const data = await response.json();
            message = data.message || data.error || message;
        } else {
            const text = await response.text();
            message = text || message;
        }
    } catch {
        // Keep the fallback message.
    }

    const error = new Error(message);
    error.status = response.status;

    return error;
}

function setSaving(button, saving) {
    if (!button) {
        return;
    }

    button.disabled = saving;
    button.textContent = saving ? "Saving..." : "Save changes";
}

function renderLoadError(message) {
    getBody().innerHTML = `
        <div class="admin-edit-modal-error">
            ${escapeHtml(message)}
        </div>
    `;
}

function getBody() {
    return document.getElementById("admin-edit-modal-body");
}

function getValue(object, path) {
    if (!path) {
        return undefined;
    }

    return path
        .split(".")
        .reduce((value, key) => value?.[key], object);
}

function normalizeInputValue(value, type) {
    if (value == null) {
        return "";
    }

    if (type === "datetime-local") {
        return String(value).slice(0, 16);
    }

    return String(value);
}

function formatDisplayValue(value, formatter) {
    if (formatter) {
        return formatter(value);
    }

    if (value == null || value === "") {
        return "—";
    }

    return value;
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
