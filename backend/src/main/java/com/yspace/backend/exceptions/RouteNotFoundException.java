package com.yspace.backend.exceptions;

public class RouteNotFoundException extends RuntimeException {
    public RouteNotFoundException(Integer id) {
        super("Route not found with id: " + id);
    }
}
