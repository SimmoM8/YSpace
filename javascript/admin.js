import { apiPost, apiGet, apiPut, apiPatch, apiDelete, ApiError } from "./api.js";
import { isLoggedIn, applyAuthState, getUserEmail } from "./auth-utils.js";
import { openModal, closeModal, confirmDialog } from "./modal.js";

applyAuthState();

const loadingEl = document.getElementById("admin-loading");
const shellEl = document.getElementById("admin-shell");

let allSpaceports = [];
let allRoutes = [];
let allSpacecraft = [];
let allModels = [];
let allFlights = [];
let allBookingsCache = [];

let wizardStep = 1;

init();

/* =====================================================================
   Init
===================================================================== */
async function init() {
    if (!isLoggedIn()) {
        window.location.href = "/login.html?redirect=/admin.html";
        return;
    }

    try {
        await withTimeout(apiGet("/admin/spacecraft"), 8000);
        await bootstrapAdmin();
    } catch (error) {
        if (error && (error.status === 403 || error.status === 401)) {
            redirectNotAdmin();
        } else {
            showBootstrapError(error);
        }
    }
}

async function bootstrapAdmin() {
    try {
        await Promise.all([
            loadSpaceports(),
            loadRoutes(),
            loadSpacecraft(),
            loadModels()
        ]);

        renderSession();
        setupTabs();
        setupForms();
        setupWizard();
        await loadDashboard();
        switchPanel("dashboard");

        loadingEl.hidden = true;
        shellEl.hidden = false;
        showToast("Admin console ready");
    } catch (error) {
        showBootstrapError(error);
    }
}

function withTimeout(promise, ms) {
    let timer;
    const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new ApiError("Request timed out", null, "TIMEOUT")), ms);
    });
    return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function showBootstrapError(error) {
    console.error("Admin bootstrap failed:", error);
    loadingEl.hidden = true;
    const message = error && error.message
        ? error.message
        : "Check that the YSpace backend is running on port 8081.";
    loadingEl.innerHTML = `
        <div class="flights-empty">
            <p class="admin-boot-title">The control console could not be reached.</p>
            <p>${message}</p>
            <button class="button button-primary" onclick="location.reload()">
                Try again <span aria-hidden="true">→</span>
            </button>
        </div>
    `;
}

function redirectNotAdmin() {
    loadingEl.hidden = true;
    openModal({
        title: "Admin access required",
        body: `<p>Your account does not have administrator privileges.</p>
               <p>Please log in with an admin account to access the console.</p>`,
        footer: `<a class="btn btn-primary" href="/login.html?redirect=/admin.html">Log in as admin</a>`
    });
}

/* =====================================================================
   Data loads
===================================================================== */
async function loadSpaceports() {
    try {
        const response = await apiGet("/spaceports?keyword=");
        allSpaceports = await response.json();
    } catch (e) {
        allSpaceports = [];
    }
}

async function loadRoutes() {
    try {
        const response = await apiGet("/admin/routes");
        allRoutes = await response.json();
    } catch (e) {
        allRoutes = [];
    }
}

async function loadSpacecraft() {
    try {
        const response = await apiGet("/admin/spacecraft");
        allSpacecraft = await response.json();
    } catch (e) {
        allSpacecraft = [];
    }
}

async function loadModels() {
    try {
        const response = await apiGet("/admin/spacecraft/models");
        allModels = await response.json();
    } catch (e) {
        allModels = [];
    }
    renderSpacecraftModelsList();
}

async function loadAllFlights() {
    try {
        const response = await apiGet("/admin/flights");
        allFlights = await response.json();
    } catch (e) {
        allFlights = [];
    }
}

async function loadAllBookings() {
    try {
        const response = await apiGet("/admin/bookings");
        allBookingsCache = await response.json();
    } catch (e) {
        allBookingsCache = [];
    }
}

/* =====================================================================
   Session
===================================================================== */
function renderSession() {
    const session = document.getElementById("admin-session");
    if (!session) return;
    session.hidden = false;

    const email = getUserEmail();
    const name = document.getElementById("admin-name");
    const avatar = document.getElementById("admin-avatar");
    const role = document.getElementById("admin-role");

    if (name && email) name.textContent = email.split("@")[0];
    if (avatar && email) avatar.textContent = (email[0] || "A").toUpperCase();
    if (role) role.textContent = "Administrator";
}

/* =====================================================================
   Tabs / navigation
===================================================================== */
function setupTabs() {
    document.querySelectorAll(".admin-tab").forEach((btn) => {
        btn.addEventListener("click", () => switchPanel(btn.dataset.panel));
    });

    document.querySelectorAll(".admin-quickaction").forEach((btn) => {
        btn.addEventListener("click", () => switchPanel(btn.dataset.go));
    });

    const flightFilter = document.getElementById("flight-filter");
    if (flightFilter) {
        flightFilter.addEventListener("input", () => renderFlightAdminList(allFlights));
    }
    const flightStatusFilter = document.getElementById("flight-status-filter");
    if (flightStatusFilter) {
        flightStatusFilter.addEventListener("change", () => renderFlightAdminList(allFlights));
    }
    const bookingStatusFilter = document.getElementById("booking-status-filter");
    if (bookingStatusFilter) {
        bookingStatusFilter.addEventListener("change", () => renderBookingsAdminList());
    }
}

function switchPanel(name) {
    document.querySelectorAll(".admin-tab").forEach((b) => {
        b.classList.toggle("is-active", b.dataset.panel === name);
    });
    document.querySelectorAll(".admin-panel").forEach((p) => {
        p.classList.toggle("is-active", p.id === `panel-${name}`);
    });

    switch (name) {
        case "dashboard": loadDashboard(); break;
        case "spaceports": renderSpaceportAdminList(); break;
        case "routes": populateRouteForm(); renderRouteAdminList(); break;
        case "spacecraft": populateSpacecraftForm(); renderSpacecraftAdminList(); renderSpacecraftModelsList(); break;
        case "flights": populateFlightForm(); loadAllFlights().then(() => renderFlightAdminList()); break;
        case "bookings": renderBookingsAdminList(); break;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
}

/* =====================================================================
   Dashboard
===================================================================== */
async function loadDashboard() {
    const statsEl = document.getElementById("admin-stats");
    if (!statsEl) return;

    let bookingCount = null;
    try {
        const response = await apiGet("/admin/bookings");
        const bookings = await response.json();
        bookingCount = bookings.length;
    } catch (e) {
        bookingCount = null;
    }

    const operational = allSpacecraft.filter((s) => s.operational).length;

    statsEl.innerHTML = `
        <div class="admin-stat"><span>Spaceports</span><strong>${allSpaceports.length}</strong></div>
        <div class="admin-stat"><span>Routes</span><strong>${allRoutes.length}</strong></div>
        <div class="admin-stat"><span>Operational fleet</span><strong>${operational}</strong></div>
        <div class="admin-stat"><span>Bookings</span><strong>${bookingCount !== null ? bookingCount : "—"}</strong></div>
    `;
}

/* =====================================================================
   Form population
===================================================================== */
function spaceportOptions() {
    return allSpaceports
        .map((s) => `<option value="${s.spaceportId}">${s.spaceportName} (${s.spaceportCode})</option>`)
        .join("");
}

function populateRouteForm() {
    const origin = document.getElementById("ar-origin");
    const dest = document.getElementById("ar-destination");
    const opts = spaceportOptions();
    origin.innerHTML = `<option value="">Select origin...</option>${opts}`;
    dest.innerHTML = `<option value="">Select destination...</option>${opts}`;
}

function populateSpacecraftForm() {
    const model = document.getElementById("sc-model");
    model.innerHTML = `<option value="">Select model...</option>` +
        allModels.map((m) => `<option value="${m.modelId}">${m.name} (${m.manufacturer})</option>`).join("");
}

function populateFlightForm() {
    const route = document.getElementById("sf-route");
    route.innerHTML = `<option value="">Select a route...</option>` +
        allRoutes.map((r) =>
            `<option value="${r.id}">${r.originSpaceportName} → ${r.destinationSpaceportName}</option>`
        ).join("");

    const craft = document.getElementById("sf-spacecraft");
    craft.innerHTML = `<option value="">Select a vessel...</option>` +
        allSpacecraft
            .filter((s) => s.operational)
            .map((s) => `<option value="${s.spacecraftId}">${s.name} (${s.seatCapacity} seats)</option>`)
            .join("");
}

function routeLabel(r) {
    return `${r.originSpaceportName} → ${r.destinationSpaceportName}`;
}

/* =====================================================================
   Flight Wizard
===================================================================== */
function setupWizard() {
    document.querySelectorAll("[data-next]").forEach((btn) => {
        btn.addEventListener("click", () => {
            const from = Number(btn.dataset.next);
            if (validateWizardStage(from)) goWizardStep(from + 1);
        });
    });
    document.querySelectorAll("[data-prev]").forEach((btn) => {
        btn.addEventListener("click", () => goWizardStep(Number(btn.dataset.prev)));
    });

    document.querySelectorAll(".wizard-step").forEach((step) => {
        step.addEventListener("click", () => {
            const target = Number(step.dataset.step);
            if (target < wizardStep) goWizardStep(target);
        });
    });
}

function goWizardStep(step) {
    wizardStep = step;
    document.querySelectorAll(".wizard-step").forEach((s) => {
        const n = Number(s.dataset.step);
        s.classList.toggle("is-active", n === step);
        s.classList.toggle("is-done", n < step);
    });
    document.querySelectorAll(".wizard-stage").forEach((s) => {
        s.classList.toggle("is-active", Number(s.dataset.stage) === step);
    });
    if (step === 3) updateReview();
}

function validateWizardStage(stage) {
    clearFormMsg("sf-message");
    if (stage === 1) {
        const route = document.getElementById("sf-route").value;
        if (!route) { showFormMsg("sf-message", "Please select a route to continue."); return false; }
        return true;
    }
    if (stage === 2) {
        const craft = document.getElementById("sf-spacecraft").value;
        const price = document.getElementById("sf-price").value;
        if (!craft) { showFormMsg("sf-message", "Please select a spacecraft."); return false; }
        if (price === "" || Number(price) < 0) { showFormMsg("sf-message", "Please enter a valid base price (0 or more)."); return false; }
        return true;
    }
    return true;
}

function updateReview() {
    const route = allRoutes.find((r) => String(r.id) === document.getElementById("sf-route").value);
    const craft = allSpacecraft.find((s) => String(s.spacecraftId) === document.getElementById("sf-spacecraft").value);
    const price = document.getElementById("sf-price").value;
    const dep = document.getElementById("sf-departure").value;
    const arr = document.getElementById("sf-arrival").value;

    set('rv-route', route ? routeLabel(route) : "—");
    set('rv-spacecraft', craft ? `${craft.name} (${craft.seatCapacity} seats)` : "—");
    set('rv-price', price !== "" ? `${new Intl.NumberFormat("en-US").format(Number(price))} kr` : "—");
    set('rv-departure', dep ? formatDateTimeLocal(dep) : "—");
    set('rv-arrival', arr ? formatDateTimeLocal(arr) : "—");

    function set(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    }
}

function formatDateTimeLocal(value) {
    if (!value) return "—";
    return new Date(value).toLocaleString("en-US", {
        dateStyle: "medium", timeStyle: "short"
    });
}

/* =====================================================================
   Spaceport admin list
===================================================================== */
function renderSpaceportAdminList() {
    const list = document.getElementById("spaceport-admin-list");
    const count = document.getElementById("spaceport-count");
    if (count) count.textContent = `${allSpaceports.length} port${allSpaceports.length === 1 ? "" : "s"}`;

    list.innerHTML = allSpaceports.length === 0
        ? `<div class="admin-empty">No spaceports loaded. Add your first one above.</div>`
        : allSpaceports.map((s) => `
            <div class="admin-row">
                <div class="row-main">
                    <span class="row-title">${s.spaceportName}</span>
                    <span class="row-sub">${s.spaceportCode} · ${s.spaceportType}</span>
                </div>
                <div class="row-end">
                    <span class="pill ${typePill(s.spaceportType)}">${s.spaceportType}</span>
                    <div class="row-actions">
                        <button class="btn btn-ghost btn-sm" data-edit-spaceport="${s.spaceportId}">Edit name</button>
                        <button class="btn btn-danger btn-sm" data-delete-spaceport="${s.spaceportId}">Delete</button>
                    </div>
                </div>
            </div>
        `).join("");

    list.querySelectorAll("[data-edit-spaceport]").forEach((btn) => {
        btn.addEventListener("click", () => handleEditSpaceportName(btn.dataset.editSpaceport, allSpaceports.find((s) => String(s.spaceportId) === btn.dataset.editSpaceport)?.spaceportName));
    });
    list.querySelectorAll("[data-delete-spaceport]").forEach((btn) => {
        btn.addEventListener("click", () => handleDeleteSpaceport(btn.dataset.deleteSpaceport, allSpaceports.find((s) => String(s.spaceportId) === btn.dataset.deleteSpaceport)?.spaceportName));
    });
}

function typePill(type) {
    const t = (type || "").toUpperCase();
    if (t === "PLANET") return "pill--accent";
    if (t === "MOON") return "pill--cyan";
    return "pill--violet";
}

/* =====================================================================
   Route admin list
===================================================================== */
function renderRouteAdminList() {
    const list = document.getElementById("route-admin-list");
    const count = document.getElementById("route-count");
    if (count) count.textContent = `${allRoutes.length} route${allRoutes.length === 1 ? "" : "s"}`;

    list.innerHTML = allRoutes.length === 0
        ? `<div class="admin-empty">No routes yet. Create your first connection above.</div>`
        : allRoutes.map((r) => `
            <div class="admin-row">
                <div class="row-main">
                    <span class="row-title">${r.originSpaceportName} → ${r.destinationSpaceportName}</span>
                    <span class="row-sub">${r.name} · ${r.distance ? formatNumber(r.distance) + " km" : "distance n/a"}</span>
                </div>
                <div class="row-end">
                    <span class="pill pill--violet">${r.name.split(" ")[0].toUpperCase()}</span>
                    <button class="btn btn-danger btn-sm" data-delete-route="${r.id}">Delete</button>
                </div>
            </div>
        `).join("");

    list.querySelectorAll("[data-delete-route]").forEach((btn) => {
        btn.addEventListener("click", () => handleDeleteRoute(btn.dataset.deleteRoute, allRoutes.find((r) => String(r.id) === btn.dataset.deleteRoute)));
    });
}

/* =====================================================================
   Spacecraft admin list
===================================================================== */
function renderSpacecraftAdminList() {
    const list = document.getElementById("spacecraft-admin-list");
    const count = document.getElementById("spacecraft-count");
    if (count) count.textContent = `${allSpacecraft.length} vessel${allSpacecraft.length === 1 ? "" : "s"}`;

    list.innerHTML = allSpacecraft.length === 0
        ? `<div class="admin-empty">No spacecraft in the fleet yet.</div>`
        : allSpacecraft.map((s) => {
            const retired = s.status === "RETIRED" || s.operational === false;
            return `
                <div class="admin-row">
                    <div class="row-main">
                        <span class="row-title">${s.name}</span>
                        <span class="row-sub">${s.modelName || "—"} · ${s.seatCapacity} seats</span>
                    </div>
                    <div class="row-end">
                        <span class="pill ${statusPill(s.status)}">${s.status}</span>
                        <div class="row-actions">
                            ${!retired
                                ? `<button class="btn btn-ghost btn-sm" data-retire="${s.spacecraftId}">Retire</button>`
                                : ""}
                            <button class="btn btn-danger btn-sm" data-delete-spacecraft="${s.spacecraftId}">Delete</button>
                        </div>
                    </div>
                </div>
            `;
        }).join("");

    list.querySelectorAll("[data-retire]").forEach((btn) => {
        btn.addEventListener("click", () => handleRetireSpacecraft(btn.dataset.retire));
    });
    list.querySelectorAll("[data-delete-spacecraft]").forEach((btn) => {
        btn.addEventListener("click", () => handleDeleteSpacecraft(btn.dataset.deleteSpacecraft, allSpacecraft.find((s) => String(s.spacecraftId) === btn.dataset.deleteSpacecraft)?.name));
    });
}

function statusPill(status) {
    const s = (status || "").toUpperCase();
    if (s === "RETIRED") return "pill--muted";
    if (s === "UNDER_MAINTENANCE") return "pill--amber";
    if (s === "BOARDING") return "pill--green";
    return "pill--cyan";
}

/* --- Spacecraft models list --- */
function renderSpacecraftModelsList() {
    const list = document.getElementById("spacecraft-models-list");
    const count = document.getElementById("spacecraft-model-count");
    if (!list) return;
    if (count) count.textContent = `${allModels.length} model${allModels.length === 1 ? "" : "s"}`;

    list.innerHTML = allModels.length === 0
        ? `<div class="admin-empty">No spacecraft models in the database.</div>`
        : allModels.map((m) => `
            <div class="admin-row">
                <div class="row-main">
                    <span class="row-title">${m.name || "Unnamed model"}</span>
                    <span class="row-sub">${m.manufacturer || "Unknown manufacturer"}</span>
                </div>
                <div class="row-end">
                    <span class="pill pill--violet">${m.modelId}</span>
                    <div class="row-actions">
                        <button class="btn btn-ghost btn-sm" data-edit-model="${m.modelId}">Edit name</button>
                        <button class="btn btn-danger btn-sm" data-delete-model="${m.modelId}">Delete</button>
                    </div>
                </div>
            </div>
        `).join("");

    list.querySelectorAll("[data-edit-model]").forEach((btn) => {
        btn.addEventListener("click", () => handleEditSpacecraftModelName(btn.dataset.editModel, allModels.find((m) => String(m.modelId) === btn.dataset.editModel)?.name));
    });
    list.querySelectorAll("[data-delete-model]").forEach((btn) => {
        btn.addEventListener("click", () => handleDeleteSpacecraftModel(btn.dataset.deleteModel, allModels.find((m) => String(m.modelId) === btn.dataset.deleteModel)?.name));
    });
}

/* =====================================================================
   Flights admin list
===================================================================== */
function renderFlightAdminList(flights) {
    const list = document.getElementById("flight-admin-list");
    const count = document.getElementById("flight-count");
    const source = flights || allFlights;
    if (count) count.textContent = `${source.length} flight${source.length === 1 ? "" : "s"}`;

    list.innerHTML = '<div class="admin-loading"><div class="spinner"></div></div>';

    const filterInput = document.getElementById("flight-filter");
    const statusFilter = document.getElementById("flight-status-filter");
    const text = (filterInput ? filterInput.value : "").toLowerCase();
    const status = statusFilter ? statusFilter.value : "";

    const filtered = source.filter((f) => {
        const matchesText = !text ||
            (f.code || "").toLowerCase().includes(text) ||
            (f.routeName || "").toLowerCase().includes(text) ||
            ((f.originName || "") + " " + (f.destinationName || "")).toLowerCase().includes(text);
        const matchesStatus = !status || f.status === status;
        return matchesText && matchesStatus;
    });

    const sorted = [...filtered].sort((a, b) =>
        (new Date(a.departureTime) || 0) - (new Date(b.departureTime) || 0)
    );

    if (sorted.length === 0) {
        list.innerHTML = `<div class="admin-empty">No flights match your filters.</div>`;
        return;
    }

    list.innerHTML = sorted.map((f) => {
        const editable = f.status === "SCHEDULED" || f.status === "BOARDING";
        const canCancel = f.status === "SCHEDULED" || f.status === "BOARDING";
        return `
            <div class="admin-row">
                <div class="row-main">
                    <span class="row-title">${f.code || "—"} · <span class="chip">${f.originName || "?"} → ${f.destinationName || "?"}</span></span>
                    <span class="row-sub">${f.departureTime ? formatDateTimeLocal(f.departureTime) : "TBD"}
                        · ${f.spacecraftName || "—"}</span>
                </div>
                <div class="row-end">
                    <span class="pill ${flightPill(f.status)}">${f.status}</span>
                    <span class="admin-price">${formatNumber(f.price)} kr</span>
                    <div class="row-actions">
                        ${editable ? `<button class="btn btn-ghost btn-sm" data-edit="${f.id}">Edit</button>` : ""}
                        ${canCancel ? `<button class="btn btn-danger btn-sm" data-cancel="${f.id}">Cancel</button>` : ""}
                    </div>
                </div>
            </div>
        `;
    }).join("");

    list.querySelectorAll("[data-edit]").forEach((btn) => {
        const flight = allFlights.find((f) => String(f.id) === btn.dataset.edit);
        if (flight) btn.addEventListener("click", () => openEditFlight(flight));
    });
    list.querySelectorAll("[data-cancel]").forEach((btn) => {
        const flight = allFlights.find((f) => String(f.id) === btn.dataset.cancel);
        if (flight) btn.addEventListener("click", () => handleCancelFlight(flight.id, flight.code));
    });
}

function flightPill(status) {
    const s = (status || "").toUpperCase();
    if (s === "CANCELLED") return "pill--red";
    if (s === "BOARDING") return "pill--green";
    if (s === "DELAYED" || s === "IN_FLIGHT") return "pill--amber";
    if (s === "ARRIVED") return "pill--muted";
    return "pill--cyan";
}

async function refreshFlights() {
    await loadAllFlights();
    renderFlightAdminList(allFlights);
}

/* =====================================================================
   Bookings admin list
===================================================================== */
async function renderBookingsAdminList() {
    const list = document.getElementById("bookings-admin-list");
    const count = document.getElementById("admin-bookings-count");
    list.innerHTML = '<div class="admin-loading"><div class="spinner"></div></div>';

    if (allBookingsCache.length === 0) await loadAllBookings();

    const statusFilter = document.getElementById("booking-status-filter");
    const status = statusFilter ? statusFilter.value : "";
    const bookings = status ? allBookingsCache.filter((b) => b.status === status) : allBookingsCache;

    if (count) count.textContent = `${bookings.length} booking${bookings.length === 1 ? "" : "s"}`;

    if (bookings.length === 0) {
        list.innerHTML = `<div class="admin-empty">No bookings match your filters.</div>`;
        return;
    }

    const sorted = [...bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    list.innerHTML = sorted.map((b) => `
        <div class="admin-row">
            <div class="row-main">
                <span class="row-title">#${b.bookingId} — ${b.userFirstName} ${b.userLastName}</span>
                <span class="row-sub">${b.userEmail} · ${b.routeName || "—"} ·
                    ${b.departureTime ? new Date(b.departureTime).toLocaleDateString("en-US", { dateStyle: "medium" }) : "TBD"}</span>
            </div>
            <div class="row-end">
                <span class="pill ${bookingPill(b.status)}">${b.status}</span>
                <span class="admin-price">${formatNumber(b.totalPrice)} kr</span>
            </div>
        </div>
    `).join("");
}

function bookingPill(status) {
    if (status === "OPEN") return "pill--green";
    if (status === "CANCELLED") return "pill--red";
    return "pill--muted";
}

/* =====================================================================
   Forms
===================================================================== */
function setupForms() {
    document.getElementById("create-route-form").addEventListener("submit", handleCreateRoute);
    document.getElementById("schedule-flight-form").addEventListener("submit", handleScheduleFlight);
    document.getElementById("create-spacecraft-form").addEventListener("submit", handleCreateSpacecraft);
    document.getElementById("create-spaceport-form").addEventListener("submit", handleCreateSpaceport);
}

function showFormMsg(id, text, ok = false) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = text;
    el.className = "form-msg" + (ok ? " form-msg--ok" : " form-msg--err");
}

function clearFormMsg(id) {
    const el = document.getElementById(id);
    if (el) { el.textContent = ""; el.className = "form-msg"; }
}

/* --- Route --- */
async function handleCreateRoute(event) {
    event.preventDefault();
    const form = event.target;
    const name = form.querySelector('[name="name"]').value.trim();
    const originSpaceportId = Number(form.querySelector('[name="originSpaceportId"]').value);
    const destinationSpaceportId = Number(form.querySelector('[name="destinationSpaceportId"]').value);
    const distance = form.querySelector('[name="distance"]').value;
    const description = form.querySelector('[name="description"]').value.trim();

    if (!name || !originSpaceportId || !destinationSpaceportId) {
        showFormMsg("ar-message", "Please fill in a name and both spaceports.");
        return;
    }
    if (originSpaceportId === destinationSpaceportId) {
        showFormMsg("ar-message", "Origin and destination cannot be the same.");
        return;
    }

    const payload = { name, originSpaceportId, destinationSpaceportId, description: description || null };
    if (distance) payload.distance = Number(distance);

    try {
        await apiPost("/admin/routes", payload);
        showFormMsg("ar-message", "Route created successfully.", true);
        form.reset();
        populateRouteForm();
        await loadRoutes();
        renderRouteAdminList();
    } catch (e) {
        showFormMsg("ar-message", e.message || "Failed to create route.");
    }
}

/* --- Spacecraft --- */
async function handleCreateSpacecraft(event) {
    event.preventDefault();
    const form = event.target;
    const name = form.querySelector('[name="name"]').value.trim();
    const modelId = Number(form.querySelector('[name="modelId"]').value);
    const seatCapacity = Number(form.querySelector('[name="seatCapacity"]').value);

    if (!name || !modelId || !seatCapacity || seatCapacity < 1) {
        showFormMsg("sc-message", "Please fill in name, model and seat capacity.");
        return;
    }

    try {
        await apiPost("/admin/spacecraft", { name, modelId, seatCapacity });
        showFormMsg("sc-message", "Spacecraft added successfully.", true);
        form.reset();
        await loadSpacecraft();
        renderSpacecraftAdminList();
        populateFlightForm();
    } catch (e) {
        showFormMsg("sc-message", e.message || "Failed to add spacecraft.");
    }
}

/* --- Spaceport --- */
async function handleCreateSpaceport(event) {
    event.preventDefault();
    const form = event.target;
    const payload = {
        name: form.querySelector('[name="name"]').value.trim(),
        code: form.querySelector('[name="code"]').value.trim(),
        type: form.querySelector('[name="type"]').value,
        description: form.querySelector('[name="description"]').value.trim() || null
    };
    const imageEl = form.querySelector('[name="imageUrl"]');
    if (imageEl && imageEl.value.trim()) payload.imageUrl = imageEl.value.trim();

    if (!payload.name || !payload.code || !payload.type) {
        showFormMsg("sp-message", "Please fill in name, code and type.");
        return;
    }

    try {
        await apiPost("/admin/spaceports", payload);
        showFormMsg("sp-message", "Spaceport added successfully.", true);
        form.reset();
        await loadSpaceports();
        renderSpaceportAdminList();
        populateRouteForm();
    } catch (e) {
        showFormMsg("sp-message", e.message || "Failed to add spaceport.");
    }
}

/* --- Schedule flight (wizard submit) --- */
async function handleScheduleFlight(event) {
    event.preventDefault();
    if (!validateWizardStage(2)) { goWizardStep(2); return; }

    const routeId = Number(document.getElementById("sf-route").value);
    const spacecraftId = Number(document.getElementById("sf-spacecraft").value);
    const basePrice = Number(document.getElementById("sf-price").value);
    const departure = toIsoLocal(document.getElementById("sf-departure").value);
    const arrival = toIsoLocal(document.getElementById("sf-arrival").value);

    if (!departure || !arrival) {
        showFormMsg("sf-message", "Please set both departure and arrival times.");
        goWizardStep(3);
        return;
    }
    if (new Date(departure) <= new Date()) {
        showFormMsg("sf-message", "Departure must be in the future.");
        goWizardStep(3);
        return;
    }
    if (new Date(arrival) <= new Date(departure)) {
        showFormMsg("sf-message", "Arrival must be after departure.");
        goWizardStep(3);
        return;
    }

    const btn = event.submitter;
    if (btn) btn.disabled = true;

    try {
        const response = await apiPost("/admin/flights", { routeId, spacecraftId, basePrice, departureTime: departure, arrivalTime: arrival });
        const created = await response.json();
        showFormMsg("sf-message", `Flight ${created.code || ""} scheduled successfully.`, true);
        resetWizard();
        await loadSpacecraft();
        populateFlightForm();
        await refreshFlights();
        scrollToWizard();
    } catch (e) {
        if (btn) btn.disabled = false;
        showFormMsg("sf-message", e.message || "Failed to schedule flight.");
        goWizardStep(3);
    }
}

function resetWizard() {
    const form = document.getElementById("schedule-flight-form");
    if (form) form.reset();
    wizardStep = 1;
    goWizardStep(1);
}

function scrollToWizard() {
    const steps = document.querySelector(".wizard-steps");
    if (steps) steps.scrollIntoView({ behavior: "smooth", block: "center" });
}

/* --- Edit flight --- */
function openEditFlight(flight) {
    const departure = flight.departureTime ? toLocalInput(new Date(flight.departureTime)) : "";
    const arrival = flight.arrivalTime ? toLocalInput(new Date(flight.arrivalTime)) : "";

    openModal({
        title: `Edit ${flight.code}`,
        body: `
            <form class="admin-form" id="edit-flight-form">
                <div class="form-group">
                    <label>Base price (kr)</label>
                    <input type="number" id="ef-price" min="0" step="0.01" value="${flight.price ?? ""}">
                </div>
                <div class="form-group">
                    <label>Available seats</label>
                    <input type="number" id="ef-seats" min="1" placeholder="Available seats">
                    <p class="help">Only change this if you need to adjust capacity.</p>
                </div>
                <div class="form-group">
                    <label>Departure</label>
                    <input type="datetime-local" id="ef-departure" value="${departure}">
                </div>
                <div class="form-group">
                    <label>Arrival</label>
                    <input type="datetime-local" id="ef-arrival" value="${arrival}">
                </div>
                <p class="form-msg" id="ef-message"></p>
            </form>
        `,
        footer: `
            <button class="btn btn-ghost app-modal-cancel">Close</button>
            <button class="btn btn-primary" id="ef-save">Save changes</button>
        `
    });

    document.querySelector(".app-modal-cancel")?.addEventListener("click", closeModal);
    document.getElementById("ef-save").addEventListener("click", async () => {
        const payload = {};
        const price = document.getElementById("ef-price").value;
        const seats = document.getElementById("ef-seats").value;
        const departure = document.getElementById("ef-departure").value;
        const arrival = document.getElementById("ef-arrival").value;

        if (price !== "") payload.basePrice = Number(price);
        if (seats !== "") payload.availableSeats = Number(seats);
        if (departure) payload.departureTime = toIsoLocal(departure);
        if (arrival) payload.arrivalTime = toIsoLocal(arrival);

        if (payload.departureTime && payload.arrivalTime && new Date(payload.arrivalTime) <= new Date(payload.departureTime)) {
            document.getElementById("ef-message").textContent = "Arrival must be after departure.";
            return;
        }
        if (payload.departureTime && payload.departureTime <= new Date().toISOString()) {
            docInputMessage("ef-message", "Departure must be in the future.");
            return;
        }

        try {
            await apiPut(`/admin/flights/${flight.id}`, payload);
            closeModal();
            showToast(`Flight ${flight.code} updated.`);
            await refreshFlights();
        } catch (e) {
            document.getElementById("ef-message").textContent = e.message || "Update failed.";
        }
    });
}

function docInputMessage(id, msg) {
    const el = document.getElementById(id);
    if (el) el.textContent = msg;
}

/* --- Cancel flight --- */
async function handleCancelFlight(id, code) {
    const confirmed = await confirmDialog({
        title: `Cancel flight ${code}?`,
        message: "This will cancel the flight and prevent further bookings.",
        confirmText: "Cancel flight",
        danger: true
    });
    if (!confirmed) return;

    try {
        await apiPatch(`/admin/flights/${id}/cancel`);
        showToast(`Flight ${code} cancelled.`);
        await refreshFlights();
    } catch (e) {
        openModal({ title: "Error", body: `<p>${e.message || "Could not cancel flight."}</p>`,
            footer: `<button class="btn btn-primary app-modal-ok">OK</button>` });
        document.querySelector(".app-modal-ok")?.addEventListener("click", closeModal);
    }
}

/* --- Retire spacecraft --- */
async function handleRetireSpacecraft(id) {
    const confirmed = await confirmDialog({
        title: "Retire this spacecraft?",
        message: "A retired spacecraft is marked non-operational and removed from the active fleet.",
        confirmText: "Retire spacecraft",
        danger: true
    });
    if (!confirmed) return;

    try {
        await apiPatch(`/admin/spacecraft/${id}/retire`);
        showToast("Spacecraft retired.");
        await loadSpacecraft();
        renderSpacecraftAdminList();
        populateFlightForm();
    } catch (e) {
        openModal({ title: "Error", body: `<p>${e.message || "Could not retire spacecraft."}</p>`,
            footer: `<button class="btn btn-primary app-modal-ok">OK</button>` });
        document.querySelector(".app-modal-ok")?.addEventListener("click", closeModal);
    }
}

/* --- Delete route --- */
async function handleDeleteRoute(id, route) {
    const label = route ? `${route.originSpaceportName} → ${route.destinationSpaceportName}` : `Route #${id}`;
    const confirmed = await confirmDialog({
        title: "Delete this route?",
        message: `Delete "${label}"? Only routes without any scheduled flights can be removed.`,
        confirmText: "Delete route",
        danger: true
    });
    if (!confirmed) return;

    try {
        await apiDelete(`/admin/routes/${id}`);
        showToast("Route deleted.");
        await loadRoutes();
        renderRouteAdminList();
        populateFlightForm();
    } catch (e) {
        openModal({ title: "Cannot delete route", body: `<p>${e.message || "Could not delete route."}</p>`,
            footer: `<button class="btn btn-primary app-modal-ok">OK</button>` });
        document.querySelector(".app-modal-ok")?.addEventListener("click", closeModal);
    }
}

/* --- Delete spaceport --- */
async function handleDeleteSpaceport(id, name) {
    const label = name || `Spaceport #${id}`;
    const confirmed = await confirmDialog({
        title: "Delete this spaceport?",
        message: `Delete "${label}"? Only spaceports not used by any route can be removed.`,
        confirmText: "Delete spaceport",
        danger: true
    });
    if (!confirmed) return;

    try {
        await apiDelete(`/admin/spaceports/${id}`);
        showToast("Spaceport deleted.");
        await loadSpaceports();
        renderSpaceportAdminList();
        populateRouteForm();
    } catch (e) {
        openModal({ title: "Cannot delete spaceport", body: `<p>${e.message || "Could not delete spaceport."}</p>`,
            footer: `<button class="btn btn-primary app-modal-ok">OK</button>` });
        document.querySelector(".app-modal-ok")?.addEventListener("click", closeModal);
    }
}

/* --- Delete spacecraft --- */
async function handleDeleteSpacecraft(id, name) {
    const label = name || `Spacecraft #${id}`;
    const confirmed = await confirmDialog({
        title: "Delete this spacecraft?",
        message: `Delete "${label}"? Only spacecraft not assigned to any scheduled flight can be removed.`,
        confirmText: "Delete spacecraft",
        danger: true
    });
    if (!confirmed) return;

    try {
        await apiDelete(`/admin/spacecraft/${id}`);
        showToast("Spacecraft deleted.");
        await loadSpacecraft();
        renderSpacecraftAdminList();
        populateFlightForm();
    } catch (e) {
        openModal({ title: "Cannot delete spacecraft", body: `<p>${e.message || "Could not delete spacecraft."}</p>`,
            footer: `<button class="btn btn-primary app-modal-ok">OK</button>` });
        document.querySelector(".app-modal-ok")?.addEventListener("click", closeModal);
    }
}

/* --- Delete spacecraft model --- */
async function handleDeleteSpacecraftModel(id, name) {
    const label = name || `Model #${id}`;
    const confirmed = await confirmDialog({
        title: "Delete this model?",
        message: `Delete "${label}"? Only models not used by any spacecraft can be removed.`,
        confirmText: "Delete model",
        danger: true
    });
    if (!confirmed) return;

    try {
        await apiDelete(`/admin/spacecraft/models/${id}`);
        showToast("Model deleted.");
        await loadModels();
        populateSpacecraftForm();
    } catch (e) {
        openModal({ title: "Cannot delete model", body: `<p>${e.message || "Could not delete model."}</p>`,
            footer: `<button class="btn btn-primary app-modal-ok">OK</button>` });
        document.querySelector(".app-modal-ok")?.addEventListener("click", closeModal);
    }
}

/* --- Edit spaceport name --- */
function handleEditSpaceportName(id, currentName) {
    openModal({
        title: "Edit spaceport name",
        body: `
            <form class="admin-form" id="edit-spaceport-name-form">
                <div class="form-group">
                    <label>Spaceport name</label>
                    <input type="text" id="esp-name" value="${currentName || ""}" maxlength="45">
                </div>
                <p class="form-msg" id="esp-message"></p>
            </form>
        `,
        footer: `
            <button class="btn btn-ghost app-modal-cancel">Close</button>
            <button class="btn btn-primary" id="esp-save">Save name</button>
        `
    });

    document.querySelector(".app-modal-cancel")?.addEventListener("click", closeModal);
    document.getElementById("esp-save").addEventListener("click", async () => {
        const name = document.getElementById("esp-name").value.trim();
        if (!name) {
            document.getElementById("esp-message").textContent = "Name cannot be empty.";
            return;
        }
        try {
            await apiPatch(`/admin/spaceports/${id}/name`, { name });
            closeModal();
            showToast("Spaceport renamed.");
            await loadSpaceports();
            renderSpaceportAdminList();
            populateRouteForm();
            populateFlightForm();
        } catch (e) {
            document.getElementById("esp-message").textContent = e.message || "Failed to rename spaceport.";
        }
    });
}

/* --- Edit spacecraft model name --- */
function handleEditSpacecraftModelName(id, currentName) {
    openModal({
        title: "Edit model name",
        body: `
            <form class="admin-form" id="edit-model-name-form">
                <div class="form-group">
                    <label>Model name</label>
                    <input type="text" id="em-name" value="${currentName || ""}" maxlength="45">
                </div>
                <p class="form-msg" id="em-message"></p>
            </form>
        `,
        footer: `
            <button class="btn btn-ghost app-modal-cancel">Close</button>
            <button class="btn btn-primary" id="em-save">Save name</button>
        `
    });

    document.querySelector(".app-modal-cancel")?.addEventListener("click", closeModal);
    document.getElementById("em-save").addEventListener("click", async () => {
        const name = document.getElementById("em-name").value.trim();
        if (!name) {
            document.getElementById("em-message").textContent = "Name cannot be empty.";
            return;
        }
        try {
            await apiPatch(`/admin/spacecraft/models/${id}/name`, { name });
            closeModal();
            showToast("Model renamed.");
            await loadModels();
            populateSpacecraftForm();
        } catch (e) {
            document.getElementById("em-message").textContent = e.message || "Failed to rename model.";
        }
    });
}

/* =====================================================================
   Utilities
===================================================================== */
function toIsoLocal(datetimeLocalValue) {
    if (!datetimeLocalValue) return null;
    const d = new Date(datetimeLocalValue);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:00`;
}

function toLocalInput(date) {
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatNumber(value) {
    if (value === null || value === undefined) return "0";
    return new Intl.NumberFormat("en-US").format(Number(value));
}

function showToast(message) {
    const existing = document.querySelector(".app-toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.className = "app-toast";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add("app-toast--show"), 10);
    setTimeout(() => {
        toast.classList.remove("app-toast--show");
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
