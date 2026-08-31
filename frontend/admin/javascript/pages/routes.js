import {
    apiGet,
    apiPost
} from "../../../javascript/api.js";


export async function initRoutesPage() {

    await loadRoutes();

    initCreateRouteForm();
}


async function loadRoutes() {

    const tableBody =
        document.querySelector(
            "#routes-table tbody"
        );


    try {

        tableBody.innerHTML = `
            <tr>
                <td colspan="6"
                    class="admin-table-empty"
                >
                    Loading routes...
                </td>
            </tr>
        `;


        const response =
            await apiGet(
                "/admin/routes"
            );

        const routes =
            await response.json();


        const count =
            document.getElementById(
                "routes-count"
            );

        count.textContent =
            `${routes.length} routes`;


        if (!routes.length) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="6"
                        class="admin-table-empty"
                    >
                        No routes found.
                    </td>
                </tr>
            `;

            return;
        }


        tableBody.innerHTML =
            routes
                .map(createRouteRow)
                .join("");

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
                    ${escapeHtml(
        error.message ||
        "Could not load routes."
    )}
                </td>
            </tr>
        `;
    }
}


function createRouteRow(route) {

    return `
        <tr>
            <td>
                <div class="admin-flight-identity">
                    <strong>${route.id}</strong>
                </div>
            </td>

            <td>
                <strong>${escapeHtml(route.name)}</strong>
            </td>

            <td>
                <div class="admin-route">
                    <strong>${escapeHtml(route.originSpaceportCode)}</strong>
                    <span aria-hidden="true">·</span>
                    <span>${escapeHtml(route.originSpaceportName)}</span>
                </div>
            </td>

            <td>
                <div class="admin-route">
                    <strong>${escapeHtml(route.destinationSpaceportCode)}</strong>
                    <span aria-hidden="true">·</span>
                    <span>${escapeHtml(route.destinationSpaceportName)}</span>
                </div>
            </td>

            <td>
                ${route.distance != null
        ? `${formatDistance(route.distance)} km`
        : "—"}
            </td>

            <td>
                <span class="admin-table-description">
                    ${escapeHtml(route.description || "—")}
                </span>
            </td>
        </tr>
    `;
}


function initCreateRouteForm() {

    const showBtn =
        document.getElementById(
            "show-create-route-btn"
        );

    const panel =
        document.getElementById(
            "create-route-panel"
        );

    const form =
        document.getElementById(
            "create-route-form"
        );

    if (!showBtn || !panel || !form) {
        return;
    }


    showBtn.addEventListener(
        "click",
        () => {
            panel.style.display = "";
            loadSpaceportsIntoForm();
        }
    );


    document.getElementById(
        "cancel-create-route"
    )?.addEventListener(
        "click",
        () => {
            panel.style.display = "none";
            form.reset();
        }
    );


    form.addEventListener(
        "submit",
        async (event) => {
            event.preventDefault();

            const submitBtn =
                form.querySelector(
                    "button[type='submit']"
                );

            submitBtn.disabled = true;
            submitBtn.textContent =
                "Creating...";

            try {

                const formData =
                    new FormData(form);

                const payload = {
                    name: formData.get("name"),
                    originSpaceportId: Number(
                        formData.get(
                            "originSpaceportId"
                        )
                    ),
                    destinationSpaceportId: Number(
                        formData.get(
                            "destinationSpaceportId"
                        )
                    ),
                    distance: formData.get("distance")
                        ? Number(formData.get("distance"))
                        : null,
                    description: formData.get(
                        "description"
                    ) || null
                };

                await apiPost(
                    "/admin/routes",
                    payload
                );


                panel.style.display =
                    "none";

                form.reset();

                await loadRoutes();

            } catch (error) {

                alert(
                    error.message ||
                    "Could not create the route."
                );

            } finally {

                submitBtn.disabled = false;
                submitBtn.textContent =
                    "Create route";
            }
        }
    );
}


async function loadSpaceportsIntoForm() {

    try {

        const response =
            await apiGet(
                "/admin/spaceports"
            );

        const spaceports =
            await response.json();

        const options =
            spaceports
                .map(sp => `
                    <option value="${sp.id}">
                        ${escapeHtml(sp.code)}
                        · ${escapeHtml(sp.name)}
                    </option>
                `)
                .join("");

        document.getElementById(
            "cr-origin"
        ).innerHTML =
            `<option value="">Select origin...</option>` +
            options;

        document.getElementById(
            "cr-destination"
        ).innerHTML =
            `<option value="">Select destination...</option>` +
            options;

    } catch (error) {

        console.error(error);
    }
}


function formatDistance(distance) {

    if (distance >= 1000) {
        return (distance / 1000).toLocaleString();
    }

    return Math.round(distance).toLocaleString();
}


function escapeHtml(value) {

    const element =
        document.createElement("div");

    element.textContent =
        value ?? "";

    return element.innerHTML;
}
