const API_BASE = 'http://localhost:8081/api';

export class ApiError extends Error {
    constructor(message, status, code) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.code = code;
    }
}

async function apiFetch(url, options = {}) {
    const token = localStorage.getItem("token");

    try {
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
            throw new ApiError(
                "Unauthorized",
                response.status,
                "UNAUTHORIZED"
            );
        }

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { message: "Unknown error occurred" };
            }
            throw new ApiError(
                errorData.message || "API request failed",
                response.status,
                errorData.code || "API_ERROR"
            );
        }

        return response;

    } catch (error) {

        // If the error is already an instance of ApiError, rethrow it
        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(
            error.message || "Could not connect to the server",
            null,
            "NETWORK_ERROR"
        );
    }

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