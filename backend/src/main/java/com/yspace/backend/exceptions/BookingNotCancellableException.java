package com.yspace.backend.exceptions;

public class BookingNotCancellableException extends RuntimeException {
    public BookingNotCancellableException(String message) {
        super(message);
    }
}
