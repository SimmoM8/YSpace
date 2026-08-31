import { apiGet, apiPost } from "../../../javascript/api.js";

let routes = [];
let spacecraft = [];

export async function initCreateFlightPage() {
    const form = document.getElementById("schedule-flight-form");

    if (!form) {
        return;
    }

    bindFormEvents(form);
    await loadFormOptions();
}

async function loadFormOptions() {
    const routeSelect = document.getElementById("schedule-route");
    const spacecraftSelect = document.getElementById("schedule-spacecraft");

    try {
        const [routeResponse, spacecraftResponse] = await Promise.all([
            apiGet("/admin/routes"),
            apiGet("/admin/spacecraft"),
        ]);

        routes = await routeResponse.json();

        const allSpacecraft = await spacecraftResponse.json();

        spacecraft = getAvailableSpacecraft(allSpacecraft);

        renderRoutes(routeSelect);
        renderSpacecraft(spacecraftSelect);
    } catch (error) {
        console.error("Could not load scheduling options:", error);

        showMessage(error.message || "Could not load scheduling options.");

        disableSelect(routeSelect, "Routes unavailable");
        disableSelect(spacecraftSelect, "Spacecraft unavailable");
    }
}

function getAvailableSpacecraft(spacecraftOptions) {
    return spacecraftOptions.filter((craft) => {
        if (craft.operational === false) {
            return false;
        }

        return craft.status !== "RETIRED" && craft.status !== "UNDER_MAINTENANCE";
    });
}

function renderRoutes(select) {
    if (!select) {
        return;
    }

    if (!routes.length) {
        disableSelect(select, "No routes available");
        return;
    }

    select.disabled = false;

    select.innerHTML = `
        <option value="">Select route</option>

        ${routes
            .map(
                (route) => `
                    <option value="${route.id}">
                        ${escapeHtml(createRouteLabel(route))}
                    </option>
                `,
            )
            .join("")}
    `;
}

function renderSpacecraft(select) {
    if (!select) {
        return;
    }

    if (!spacecraft.length) {
        disableSelect(select, "No operational spacecraft available");
        return;
    }

    select.disabled = false;

    select.innerHTML = `
        <option value="">Select spacecraft</option>

        ${spacecraft
            .map(
                (craft) => `
                    <option value="${craft.id}">
                        ${escapeHtml(createSpacecraftLabel(craft))}
                    </option>
                `,
            )
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

function bindFormEvents(form) {
    form.addEventListener("submit", handleSubmit);

    document
        .getElementById("schedule-route")
        ?.addEventListener("change", updateRoutePreview);

    document
        .getElementById("schedule-spacecraft")
        ?.addEventListener("change", updateSpacecraftPreview);

    document
        .getElementById("schedule-departure")
        ?.addEventListener("change", updateSchedulePreview);

    document
        .getElementById("schedule-arrival")
        ?.addEventListener("change", updateSchedulePreview);

    document
        .getElementById("schedule-base-price")
        ?.addEventListener("input", updatePricePreview);
}

async function handleSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const submitButton = document.getElementById("schedule-flight-submit");

    clearMessage();

    if (!validateFlight(form)) {
        return;
    }

    const request = createFlightRequest(form);

    try {
        setSubmitting(submitButton, true);

        const response = await apiPost("/admin/flights", request);

        await response.json();

        window.location.hash = "flights";
    } catch (error) {
        console.error("Could not schedule flight:", error);

        showMessage(error.message || "Could not schedule flight.");
    } finally {
        setSubmitting(submitButton, false);
    }
}

function createFlightRequest(form) {
    const formData = new FormData(form);

    return {
        routeId: Number(formData.get("routeId")),
        spacecraftId: Number(formData.get("spacecraftId")),
        basePrice: Number(formData.get("basePrice")),
        departureTime: formData.get("departureTime"),
        arrivalTime: formData.get("arrivalTime"),
    };
}

function validateFlight(form) {
    if (!form.reportValidity()) {
        return false;
    }

    const formData = new FormData(form);

    const departure = new Date(formData.get("departureTime"));

    const arrival = new Date(formData.get("arrivalTime"));

    const basePrice = Number(formData.get("basePrice"));

    if (Number.isNaN(departure.getTime()) || Number.isNaN(arrival.getTime())) {
        showMessage("Enter a valid departure and arrival time.");

        return false;
    }

    if (departure <= new Date()) {
        showMessage("Departure time must be in the future.");

        return false;
    }

    if (arrival <= departure) {
        showMessage("Arrival time must be after departure time.");

        return false;
    }

    if (!Number.isFinite(basePrice) || basePrice < 0) {
        showMessage("Base price must be zero or greater.");

        return false;
    }

    return true;
}

function updateRoutePreview() {
    const routeId = Number(document.getElementById("schedule-route")?.value);

    const route = routes.find((item) => item.id === routeId);

    setText("preview-origin-code", route?.originCode ?? "—");

    setText("preview-destination-code", route?.destinationCode ?? "—");

    const meta = document.getElementById("schedule-route-meta");

    if (meta) {
        meta.textContent = route
            ? createRouteDescription(route)
            : "Select an available route.";
    }
}

function updateSpacecraftPreview() {
    const spacecraftId = Number(
        document.getElementById("schedule-spacecraft")?.value,
    );

    const craft = spacecraft.find((item) => item.id === spacecraftId);

    setText(
        "preview-spacecraft",
        craft ? createSpacecraftLabel(craft) : "Not assigned",
    );

    setText("preview-capacity", craft?.seatCapacity ?? "—");

    const meta = document.getElementById("schedule-spacecraft-meta");

    if (meta) {
        meta.textContent = craft
            ? createSpacecraftDescription(craft)
            : "Select an operational spacecraft.";
    }
}

function updateSchedulePreview() {
    const departure = document.getElementById("schedule-departure")?.value;

    const arrival = document.getElementById("schedule-arrival")?.value;

    setText(
        "preview-departure",
        departure ? formatDateTime(departure) : "Not set",
    );

    setText("preview-arrival", arrival ? formatDateTime(arrival) : "Not set");
}

function updatePricePreview() {
    const value = document.getElementById("schedule-base-price")?.value;

    if (value === "" || value == null) {
        setText("preview-base-price", "Not set");

        return;
    }

    const price = Number(value);

    if (!Number.isFinite(price)) {
        setText("preview-base-price", "Not set");

        return;
    }

    const formattedPrice = new Intl.NumberFormat("sv-SE", {
        style: "currency",
        currency: "SEK",
    }).format(price);

    setText("preview-base-price", formattedPrice);
}

function createRouteLabel(route) {
    return (
        `${route.originCode} → ` + `${route.destinationCode} · ` + `${route.name}`
    );
}

function createRouteDescription(route) {
    const description = `${route.originName} → ${route.destinationName}`;

    if (route.distance == null) {
        return description;
    }

    return `${description} · ${route.distance} km`;
}

function createSpacecraftLabel(craft) {
    return `${craft.name} · ${craft.model}`;
}

function createSpacecraftDescription(craft) {
    const parts = [
        craft.manufacturer,
        craft.model,
        craft.seatCapacity != null ? `${craft.seatCapacity} seats` : null,
    ];

    return parts.filter(Boolean).join(" · ");
}

function formatDateTime(value) {
    const [datePart, timePart] = value.split("T");

    if (!datePart || !timePart) {
        return value;
    }

    const [year, month, day] = datePart.split("-").map(Number);

    const [hour, minute] = timePart.split(":").map(Number);

    const date = new Date(year, month - 1, day, hour, minute);

    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

function setSubmitting(button, submitting) {
    if (!button) {
        return;
    }

    button.disabled = submitting;

    button.innerHTML = submitting
        ? "Scheduling..."
        : "<span>+</span> Schedule flight";
}

function showMessage(message) {
    const element = document.getElementById("schedule-flight-message");

    if (!element) {
        return;
    }

    element.textContent = message;

    element.classList.add("admin-form-message-error");
}

function clearMessage() {
    const element = document.getElementById("schedule-flight-message");

    if (!element) {
        return;
    }

    element.textContent = "";

    element.classList.remove("admin-form-message-error");
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
