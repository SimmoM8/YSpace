const API_BASE = 'http://localhost:8081/api';

async function apiFetch(url, options = {}) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers: {
            ...(options.body && { "Content-Type": "application/json" }),
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers
        }
    });

    if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login.html";
        return;
    }

    return response;
}

export function apiGet(url) {
    return apiFetch(url, { method: "GET" });
}

export function apiPost(url, data) {
    return apiFetch(url, {
        method: "POST",
        body: JSON.stringify(data)
    });
}

export function apiPut(url, data) {
    return apiFetch(url, {
        method: "PUT",
        body: JSON.stringify(data)
    });
}

export function apiPatch(url, data) {
    return apiFetch(url, {
        method: "PATCH",
        body: JSON.stringify(data)
    });
}

export function apiDelete(url) {
    return apiFetch(url, { method: "DELETE" });
}