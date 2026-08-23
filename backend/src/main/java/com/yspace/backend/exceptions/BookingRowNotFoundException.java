package com.yspace.backend.exceptions;

public class BookingRowNotFoundException extends RuntimeException {

    public BookingRowNotFoundException(Integer id) {
        super("Booking row not found with id: " + id);
    }
}
