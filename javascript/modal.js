export function createModal() {
    const existing = document.getElementById("app-modal");
    if (existing) return existing;

    const modal = document.createElement("div");
    modal.id = "app-modal";
    modal.className = "app-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = `
        <div class="app-modal-overlay" data-modal-close></div>
        <div class="app-modal-panel">
            <button class="app-modal-close" data-modal-close aria-label="Close">&times;</button>
            <div class="app-modal-body"></div>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

export function openModal({ title = "", body = "", footer = "" } = {}) {
    const modal = createModal();
    const bodyEl = modal.querySelector(".app-modal-body");

    bodyEl.innerHTML = `
        ${title ? `<h3 class="app-modal-title">${title}</h3>` : ""}
        <div class="app-modal-content">${body}</div>
        ${footer ? `<div class="app-modal-footer">${footer}</div>` : ""}
    `;

    modal.classList.add("app-modal--open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("app-modal-lock");

    return modal;
}

export function closeModal() {
    const modal = document.getElementById("app-modal");
    if (!modal) return;
    modal.classList.remove("app-modal--open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("app-modal-lock");
}

export function confirmDialog({ title, message, confirmText = "Confirm", cancelText = "Cancel", danger = false }) {
    return new Promise((resolve) => {
        openModal({
            title: title || "Are you sure?",
            body: `<p>${message}</p>`,
            footer: `
                <button class="button button-outline app-modal-cancel">${cancelText}</button>
                <button class="button ${danger ? "app-modal-danger" : "button-primary"} app-modal-confirm">${confirmText}</button>
            `
        });

        const modal = document.getElementById("app-modal");

        const cleanup = () => {
            closeModal();
            modal.querySelector(".app-modal-cancel")?.removeEventListener("click", done);
            modal.querySelector(".app-modal-confirm")?.removeEventListener("click", done2);
            modal.querySelectorAll("[data-modal-close]").forEach((el) =>
                el.removeEventListener("click", done)
            );
        };

        const done = () => { cleanup(); resolve(false); };
        const done2 = () => { cleanup(); resolve(true); };

        modal.querySelector(".app-modal-cancel").addEventListener("click", done);
        modal.querySelector(".app-modal-confirm").addEventListener("click", done2);
        modal.querySelectorAll("[data-modal-close]").forEach((el) =>
            el.addEventListener("click", done)
        );
    });
}
