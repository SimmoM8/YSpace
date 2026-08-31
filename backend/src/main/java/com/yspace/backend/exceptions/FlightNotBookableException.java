package com.yspace.backend.exceptions;

public class FlightNotBookableException extends RuntimeException {
    public FlightNotBookableException(String message) {
        super(message);
    }
}
