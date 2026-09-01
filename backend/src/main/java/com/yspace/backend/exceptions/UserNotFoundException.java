package com.yspace.backend.exceptions;

public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(String email) {
        super("User not found with email: " + email);
    }

    public UserNotFoundException(Integer id) {
        super("User not found with id: " + id);
    }
}
