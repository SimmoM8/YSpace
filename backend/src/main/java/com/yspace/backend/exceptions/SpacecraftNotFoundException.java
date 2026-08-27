package com.yspace.backend.exceptions;

public class SpacecraftNotFoundException extends RuntimeException {

    public SpacecraftNotFoundException(Integer id) {
        super("Spacecraft not found with id: " + id);
    }

    public SpacecraftNotFoundException(String message) {
        super(message);
    }
}
