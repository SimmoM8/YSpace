import {
    apiGet,
    apiPost
} from "../../../javascript/api.js";


export async function initScheduleFlightPage() {

    const form =
        document.getElementById(
            "schedule-flight-form"
        );

    if (!form) {
        return;
    }


    const [
        routes,
        spacecraft
    ] = await Promise.all([
        loadRoutes(),
        loadSpacecraft()
    ]);


    populateRoutes(routes);
    populateSpacecraft(spacecraft);


    form.addEventListener(
        "submit",
        handleSubmit
    );


    const successMessage =
        document.getElementById(
            "sf-success-message"
        );

    if (successMessage) {
        const existing =
            sessionStorage.getItem(
                "sf_scheduled"
            );

        if (existing) {
            showSuccess(existing);
        }
    }


    const scheduleAnother =
        document.getElementById(
            "sf-schedule-another"
        );

    scheduleAnother?.addEventListener(
        "click",
        () => {
            sessionStorage.removeItem(
                "sf_scheduled"
            );

            document.getElementById(
                "sf-success-panel"
            ).style.display =
                "none";

            document.getElementById(
                "schedule-flight-form"
            ).style.display =
                "";
        }
    );
}


async function loadRoutes() {
    try {
        const response =
            await apiGet(
                "/admin/routes"
            );

        return await response.json();
    } catch (error) {
        console.error(
            "Could not load routes:",
            error
        );
        return [];
    }
}


async function loadSpacecraft() {
    try {
        const response =
            await apiGet(
                "/admin/spacecraft"
            );

        return await response.json();
    } catch (error) {
        console.error(
            "Could not load spacecraft:",
            error
        );
        return [];
    }
}


function populateRoutes(routes) {

    const select =
        document.getElementById(
            "sf-route"
        );

    select.innerHTML =
        routes
            .map(route => `
                <option value="${route.id}">
                    ${escapeHtml(route.name)}
                    (${escapeHtml(route.originSpaceportCode)}
                    → ${escapeHtml(route.destinationSpaceportCode)})
                </option>
            `)
            .join("");

    if (!routes.length) {
        select.innerHTML =
            `<option value="">No routes available</option>`;
    }
}


function populateSpacecraft(spacecraft) {

    const select =
        document.getElementById(
            "sf-spacecraft"
        );

    const operational =
        spacecraft.filter(
            sc =>
                sc.operational &&
                sc.status !== "RETIRED" &&
                sc.status !== "UNDER_MAINTENANCE"
        );

    const list =
        operational.length
            ? operational
            : spacecraft;

    select.innerHTML =
        list
            .map(sc => `
                <option value="${sc.id}">
                    ${escapeHtml(sc.name)}
                    (${escapeHtml(sc.modelName)} · ${sc.seatCapacity} seats)
                </option>
            `)
            .join("");

    if (!list.length) {
        select.innerHTML =
            `<option value="">No spacecraft available</option>`;
    }
}


async function handleSubmit(event) {

    event.preventDefault();

    const form =
        event.target;

    const submitButton =
        document.getElementById(
            "sf-submit"
        );

    submitButton.disabled = true;
    submitButton.textContent =
        "Scheduling...";


    const formData =
        new FormData(form);

    const departure =
        formData.get(
            "departureTime"
        );

    const arrival =
        formData.get(
            "arrivalTime"
        );


    const payload = {
        routeId: Number(
            formData.get("routeId")
        ),
        spacecraftId: Number(
            formData.get(
                "spacecraftId"
            )
        ),
        basePrice: Number(
            formData.get("basePrice")
        ),
        departureTime:
            localToApiDateTime(
                departure
            ),
        arrivalTime:
            localToApiDateTime(
                arrival
            )
    };


    try {

        const response =
            await apiPost(
                "/admin/flights",
                payload
            );

        const flight =
            await response.json();

        const message =
            `${flight.code} scheduled from ` +
            `${flight.originName} to ${flight.destinationName}.`;

        sessionStorage.setItem(
            "sf_scheduled",
            message
        );

        showSuccess(message);

    } catch (error) {

        alert(
            error.message ||
            "Could not schedule the flight."
        );

    } finally {

        submitButton.disabled = false;
        submitButton.textContent =
            "Schedule flight";
    }
}


function showSuccess(message) {

    document.getElementById(
        "schedule-flight-form"
    ).style.display =
        "none";

    document.getElementById(
        "sf-success-panel"
    ).style.display =
        "";

    document.getElementById(
        "sf-success-message"
    ).textContent =
        message;
}


function localToApiDateTime(value) {

    if (!value) {
        return null;
    }

    return value.replace(
        "T",
        "T"
    ) + ":00";
}


function escapeHtml(value) {

    const element =
        document.createElement("div");

    element.textContent =
        value ?? "";

    return element.innerHTML;
}
