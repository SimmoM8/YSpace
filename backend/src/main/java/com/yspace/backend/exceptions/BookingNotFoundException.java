package com.yspace.backend.exceptions;

public class BookingNotFoundException extends RuntimeException {
    public BookingNotFoundException(Integer id) {
        super("Booking not found with id: " + id);
    }
}
