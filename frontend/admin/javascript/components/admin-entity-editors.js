import { bindAdminEditActions } from "./admin-edit-modal.js";

const flightConfig = {
    endpoint: "/admin/flights",
    singular: "flight",
    title: "Flight",
    getTitle: (flight) => flight.code || `Flight ${flight.id}`,
    meta: [
        { label: "Record ID", path: "id" },
        { label: "Flight code", path: "code" },
        { label: "Booked seats", path: "bookedSeats" },
    ],
    fields: [
        {
            name: "code",
            label: "Flight code",
            required: true,
        },
        {
            name: "routeId",
            label: "Route",
            type: "select",
            required: true,
            optionsEndpoint: "/admin/routes",
            getValue: (flight) => flight.routeId ?? flight.route?.id,
            getOptionLabel: (route) => `${route.name} · ${route.originSpaceport?.code ?? "?"} → ${route.destinationSpaceport?.code ?? "?"}`,
        },
        {
            name: "spacecraftId",
            label: "Spacecraft",
            type: "select",
            required: true,
            optionsEndpoint: "/admin/spacecraft",
            getValue: (flight) => flight.spacecraftId ?? flight.spacecraft?.id,
            getOptionLabel: (craft) => `${craft.name} · ${craft.model ?? craft.spacecraftModel?.name ?? "Unknown model"}`,
        },
        {
            name: "status",
            label: "Status",
            type: "select",
            required: true,
            options: ["SCHEDULED", "BOARDING", "DEPARTED", "IN_FLIGHT", "ARRIVED", "CANCELLED"],
        },
        {
            name: "departureTime",
            label: "Departure",
            type: "datetime-local",
            required: true,
        },
        {
            name: "arrivalTime",
            label: "Arrival",
            type: "datetime-local",
            required: true,
        },
        {
            name: "price",
            label: "Price (SEK)",
            type: "number",
            min: 0,
            step: "0.01",
            getValue: (flight) => flight.price ?? flight.ticketPrice,
        },
    ],
    buildPayload: (formData) => ({
        code: text(formData, "code"),
        routeId: number(formData, "routeId"),
        spacecraftId: number(formData, "spacecraftId"),
        status: text(formData, "status"),
        departureTime: nullableText(formData, "departureTime"),
        arrivalTime: nullableText(formData, "arrivalTime"),
        price: nullableNumber(formData, "price"),
    }),
};

const routeConfig = {
    endpoint: "/admin/routes",
    singular: "route",
    title: "Route",
    getTitle: (route) => route.name || `Route ${route.id}`,
    meta: [
        { label: "Record ID", path: "id" },
        { label: "Origin", getValue: (route) => route.originSpaceport?.code },
        { label: "Destination", getValue: (route) => route.destinationSpaceport?.code },
    ],
    fields: [
        { name: "name", label: "Route name", required: true },
        {
            name: "originSpaceportId",
            label: "Origin",
            type: "select",
            required: true,
            optionsEndpoint: "/admin/spaceports",
            getValue: (route) => route.originSpaceportId ?? route.originSpaceport?.id,
            getOptionLabel: (spaceport) => `${spaceport.code} · ${spaceport.name}`,
        },
        {
            name: "destinationSpaceportId",
            label: "Destination",
            type: "select",
            required: true,
            optionsEndpoint: "/admin/spaceports",
            getValue: (route) => route.destinationSpaceportId ?? route.destinationSpaceport?.id,
            getOptionLabel: (spaceport) => `${spaceport.code} · ${spaceport.name}`,
        },
        {
            name: "distance",
            label: "Distance (km)",
            type: "number",
            min: 0,
            step: "0.01",
            required: true,
        },
        {
            name: "description",
            label: "Description",
            type: "textarea",
            fullWidth: true,
        },
    ],
    buildPayload: (formData) => ({
        name: text(formData, "name"),
        originSpaceportId: number(formData, "originSpaceportId"),
        destinationSpaceportId: number(formData, "destinationSpaceportId"),
        distance: number(formData, "distance"),
        description: nullableText(formData, "description"),
    }),
};

const spaceportConfig = {
    endpoint: "/admin/spaceports",
    singular: "spaceport",
    title: "Spaceport",
    getTitle: (spaceport) => `${spaceport.code ?? ""} ${spaceport.name ?? ""}`.trim(),
    meta: [
        { label: "Record ID", path: "id" },
        { label: "Code", path: "code" },
        { label: "Routes", getValue: (spaceport) => spaceport.routeCount ?? spaceport.routes?.length },
    ],
    fields: [
        { name: "name", label: "Name", required: true },
        { name: "code", label: "Code", required: true },
        {
            name: "type",
            label: "Type",
            type: "select",
            required: true,
            options: ["PLANET", "MOON", "STATION"],
        },
        {
            name: "imageUrl",
            label: "Image URL",
            getValue: (spaceport) => spaceport.imageUrl,
        },
        {
            name: "description",
            label: "Description",
            type: "textarea",
            fullWidth: true,
        },
    ],
    buildPayload: (formData) => ({
        name: text(formData, "name"),
        code: text(formData, "code").toUpperCase(),
        type: text(formData, "type"),
        description: nullableText(formData, "description"),
        imageUrl: nullableText(formData, "imageUrl"),
    }),
};

const spacecraftConfig = {
    endpoint: "/admin/spacecraft",
    singular: "spacecraft",
    title: "Spacecraft",
    getTitle: (craft) => craft.name || `Spacecraft ${craft.id}`,
    meta: [
        { label: "Record ID", path: "id" },
        { label: "Model", getValue: (craft) => craft.model ?? craft.spacecraftModel?.name },
        { label: "Manufacturer", getValue: (craft) => craft.manufacturer ?? craft.spacecraftModel?.manufacturer },
    ],
    fields: [
        { name: "name", label: "Name", required: true },
        {
            name: "modelId",
            label: "Model",
            type: "select",
            required: true,
            optionsEndpoint: "/admin/spacecraft-models",
            getValue: (craft) => craft.modelId ?? craft.spacecraftModel?.id,
            getOptionLabel: (model) => `${model.name} · ${model.manufacturer}`,
        },
        {
            name: "seatCapacity",
            label: "Seat capacity",
            type: "number",
            min: 1,
            required: true,
        },
        {
            name: "status",
            label: "Status",
            type: "select",
            required: true,
            options: [
                "AVAILABLE",
                "BOARDING",
                "LAUNCHING",
                "EXITING",
                "ORBITING",
                "CRUISING",
                "ENTERING",
                "LANDING",
                "UNDER_MAINTENANCE",
                "RETIRED",
            ],
        },
        {
            name: "operational",
            label: "Operational",
            type: "select",
            required: true,
            options: [
                { value: "true", label: "Yes" },
                { value: "false", label: "No" },
            ],
        },
    ],
    buildPayload: (formData) => ({
        name: text(formData, "name"),
        modelId: number(formData, "modelId"),
        seatCapacity: number(formData, "seatCapacity"),
        status: text(formData, "status"),
        operational: text(formData, "operational") === "true",
    }),
};

const bookingConfig = {
    endpoint: "/admin/bookings",
    singular: "booking",
    title: "Booking",
    getTitle: (booking) => `Booking YSB-${String(booking.id ?? "").padStart(6, "0")}`,
    meta: [
        { label: "Record ID", path: "id" },
        { label: "Passenger", path: "userName" },
        { label: "Total price", path: "totalPrice" },
    ],
    fields: [
        {
            name: "status",
            label: "Booking status",
            type: "select",
            required: true,
            options: ["OPEN", "CLOSED", "CANCELLED"],
            help: "Only change status if this is allowed by your booking rules.",
        },
    ],
    buildPayload: (formData) => ({
        status: text(formData, "status"),
    }),
};

const userConfig = {
    endpoint: "/admin/users",
    singular: "member",
    title: "Member",
    getTitle: (user) => [user.firstName, user.lastName].filter(Boolean).join(" ") || `Member ${user.id}`,
    meta: [
        { label: "Member ID", path: "id" },
        { label: "Created", path: "createdAt" },
        { label: "Bookings", path: "bookingCount" },
    ],
    fields: [
        { name: "firstName", label: "First name", required: true },
        { name: "lastName", label: "Last name", required: true },
        { name: "email", label: "Email", type: "email", required: true },
        {
            name: "role",
            label: "Role",
            type: "select",
            required: true,
            options: [
                { value: "SPACE_TOURIST", label: "Space tourist" },
                { value: "ADMIN", label: "Administrator" },
            ],
        },
    ],
    buildPayload: (formData) => ({
        firstName: text(formData, "firstName"),
        lastName: text(formData, "lastName"),
        email: text(formData, "email"),
        role: text(formData, "role"),
    }),
};

export function bindFlightEditor() {
    bindAdminEditActions({
        selector: "[data-flight-id], a[href^=\"#flight/\"]",
        getId: (element) => element.dataset.flightId ?? element.getAttribute("href")?.split("/").pop(),
        config: flightConfig,
    });
}

export function bindRouteEditor() {
    bindAdminEditActions({
        selector: "[data-route-id]",
        getId: (element) => element.dataset.routeId,
        config: routeConfig,
    });
}

export function bindSpaceportEditor() {
    bindAdminEditActions({
        selector: "[data-spaceport-id]",
        getId: (element) => element.dataset.spaceportId,
        config: spaceportConfig,
    });
}

export function bindSpacecraftEditor() {
    bindAdminEditActions({
        selector: "[data-spacecraft-id]",
        getId: (element) => element.dataset.spacecraftId,
        config: spacecraftConfig,
    });
}

export function bindBookingEditor() {
    bindAdminEditActions({
        selector: "[data-booking-id]",
        getId: (element) => element.dataset.bookingId,
        config: bookingConfig,
    });
}

export function bindUserEditor() {
    bindAdminEditActions({
        selector: "[data-user-id]",
        getId: (element) => element.dataset.userId,
        config: userConfig,
    });
}

function text(formData, name) {
    return String(formData.get(name) ?? "").trim();
}

function nullableText(formData, name) {
    return text(formData, name) || null;
}

function number(formData, name) {
    return Number(formData.get(name));
}

function nullableNumber(formData, name) {
    const value = text(formData, name);
    return value === "" ? null : Number(value);
}
