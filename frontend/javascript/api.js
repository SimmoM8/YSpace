const API_BASE = "http://localhost:8081/api";


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

            throw new ApiError(
                "Your session has expired.",
                401,
                "UNAUTHORIZED"
            );
        }


        if (!response.ok) {

            const errorMessage =
                await readErrorMessage(response);

            throw new ApiError(
                errorMessage,
                response.status,
                "API_ERROR"
            );
        }


        return response;

    } catch (error) {

        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(
            error.message ||
            "Could not connect to the server.",
            null,
            "NETWORK_ERROR"
        );
    }
}


async function readErrorMessage(response) {

    const contentType =
        response.headers.get("content-type") || "";

    try {

        if (
            contentType.includes(
                "application/json"
            )
        ) {

            const data =
                await response.json();

            return (
                data.message ||
                data.error ||
                "API request failed"
            );
        }

        const text =
            await response.text();

        return (
            text ||
            "API request failed"
        );

    } catch {

        return "API request failed";
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
        ...(data !== undefined && {
            body: JSON.stringify(data)
        })
    }
    );
}


export function apiDelete(url) {
    return apiFetch(url, { method: "DELETE" });
}