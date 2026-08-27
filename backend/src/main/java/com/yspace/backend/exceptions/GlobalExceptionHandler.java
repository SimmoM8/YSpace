package com.yspace.backend.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    private ResponseEntity<Map<String, String>> error(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Map.of("message", message));
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleUsernameNotFoundException(
            UsernameNotFoundException e
    ) {
        return error(HttpStatus.NOT_FOUND, e.getMessage());
    }

    @ExceptionHandler(FlightNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleFlightNotFoundException(
            FlightNotFoundException e
    ) {
        return error(HttpStatus.NOT_FOUND, e.getMessage());
    }

    @ExceptionHandler(FlightNotBookableException.class)
    public ResponseEntity<Map<String, String>> handleFlightNotBookableException(
            FlightNotBookableException e
    ) {
        return error(HttpStatus.BAD_REQUEST, e.getMessage());
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleUserNotFoundException(
            UserNotFoundException e
    ) {
        return error(HttpStatus.NOT_FOUND, e.getMessage());
    }

    @ExceptionHandler(BookingNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleBookingNotFoundException(
            BookingNotFoundException e
    ) {
        return error(HttpStatus.NOT_FOUND, e.getMessage());
    }

    @ExceptionHandler(BookingRowNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleBookingRowNotFoundException(
            BookingRowNotFoundException e
    ) {
        return error(HttpStatus.NOT_FOUND, e.getMessage());
    }

    @ExceptionHandler(BookingNotCancellableException.class)
    public ResponseEntity<Map<String, String>> handleBookingNotCancellableException(
            BookingNotCancellableException e
    ) {
        return error(HttpStatus.BAD_REQUEST, e.getMessage());
    }

    @ExceptionHandler(RouteNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleRouteNotFoundException(
            RouteNotFoundException e
    ) {
        return error(HttpStatus.NOT_FOUND, e.getMessage());
    }

    @ExceptionHandler(SpaceportNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleSpaceportNotFoundException(
            SpaceportNotFoundException e
    ) {
        return error(HttpStatus.NOT_FOUND, e.getMessage());
    }

    @ExceptionHandler(SpacecraftNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleSpacecraftNotFoundException(
            SpacecraftNotFoundException e
    ) {
        return error(HttpStatus.NOT_FOUND, e.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgumentException(
            IllegalArgumentException e
    ) {
        return error(HttpStatus.BAD_REQUEST, e.getMessage());
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, String>> handleBadCredentials(BadCredentialsException e) {
        return error(HttpStatus.UNAUTHORIZED, "Invalid email or password.");
    }
}
