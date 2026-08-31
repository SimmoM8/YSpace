package com.yspace.backend.exceptions;

public class SpaceportNotFoundException extends RuntimeException {
    public SpaceportNotFoundException(Integer id) {
        super("Spaceport not found with id: " + id);
    }
}
