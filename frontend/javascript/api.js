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
    const token = localStorage.getItem("token") || null;

    try {
        const response = await fetch(`${API_BASE}${url}`, {
            ...options,

            headers: {
                ...(options.body && { "Content-Type": "application/json" }),
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options.headers
            }
        });


        if (!response.ok) {

            const errorMessage = await readErrorMessage(response);

            if (response.status === 401 && token !== null) {
                localStorage.removeItem("token");
            }


            throw new ApiError(
                errorMessage,
                response.status,
                getErrorCode(response.status)
            );
        }


        return response;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(
            error.message || "Could not connect to the server.",
            null,
            "NETWORK_ERROR"
        );
    }
}


async function readErrorMessage(response) {
    const contentType = response.headers.get("content-type") || "";

    try {
        if (contentType.includes("application/json")) {
            const data = await response.json();

            return data.message || data.error || defaultErrorMessage(response.status);
        }

        const text = await response.text();

        return text || defaultErrorMessage(response.status);
    } catch {
        return defaultErrorMessage(response.status);
    }
}

function defaultErrorMessage(status) {
    switch (status) {
        case 400:
            return "Bad request.";
        case 401:
            return "Unauthorized.";
        case 403:
            return "You do not have permission to perform this action.";
        case 404:
            return "Not found.";
        case 500:
            return "Internal server error.";
        default:
            return `API request failed. Error ${status}.`;
    }
}

function getErrorCode(status) {
    switch (status) {
        case 400:
            return "BAD_REQUEST";
        case 401:
            return "UNAUTHORIZED";
        case 403:
            return "FORBIDDEN";
        case 404:
            return "NOT_FOUND";
        default:
            return "API_ERROR";
    }
}


/* ================================================================
   AUTHENTICATED REQUESTS
================================================================ */

export function apiGet(url) {
    return apiFetch(
        url,
        {
            method: "GET"
        }
    );
}


export function apiPost(url, data) {
    return apiFetch(
        url,
        {
            method: "POST",
            body: JSON.stringify(data)
        }
    );
}


export function apiPut(url, data) {
    return apiFetch(
        url,
        {
            method: "PUT",
            body: JSON.stringify(data)
        }
    );
}


export function apiPatch(url, data) {
    return apiFetch(
        url,
        {
            method: "PATCH",

            ...(data !== undefined && {
                body: JSON.stringify(data)
            })
        }
    );
}


export function apiDelete(url) {
    return apiFetch(
        url,
        {
            method: "DELETE"
        }
    );
}


/* ================================================================
   PUBLIC REQUESTS
================================================================ */

export function apiPostPublic(url, data) {
    return apiFetch(
        url,
        {
            method: "POST",
            body: JSON.stringify(data)
        },
        false
    );
}