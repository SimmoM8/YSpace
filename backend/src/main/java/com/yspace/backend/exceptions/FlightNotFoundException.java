package com.yspace.backend.exceptions;

public class FlightNotFoundException extends RuntimeException {

    public FlightNotFoundException(Integer id) {
        super("Flight not found with id: " + id);
    }
}
