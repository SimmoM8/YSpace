package com.yspace.backend.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<String> handleBadCredentialsException(
            BadCredentialsException e
    ) {
        return new ResponseEntity<>(
                "Invalid email or password",
                HttpStatus.UNAUTHORIZED
        );
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<String> handleUsernameNotFoundException(
            UsernameNotFoundException e
    ) {
        return new ResponseEntity<>(
                "Invalid email or password",
                HttpStatus.UNAUTHORIZED
        );
    }

    @ExceptionHandler(FlightNotFoundException.class)
    public ResponseEntity<String> handleFlightNotFoundException(
            FlightNotFoundException e
    ) {
        return new ResponseEntity<>(
                e.getMessage(),
                HttpStatus.NOT_FOUND
        );
    }

    @ExceptionHandler(FlightNotBookableException.class)
    public ResponseEntity<String> handleFlightNotBookableException(
            FlightNotBookableException e
    ) {
        return new ResponseEntity<>(
                e.getMessage(),
                HttpStatus.BAD_REQUEST
        );
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<String> handleUserNotFoundException(
            UserNotFoundException e
    ) {
        return new ResponseEntity<>(
                e.getMessage(),
                HttpStatus.NOT_FOUND
        );
    }

    @ExceptionHandler(BookingNotFoundException.class)
    public ResponseEntity<String> handleBookingNotFoundException(
            BookingNotFoundException e
    ) {
        return new ResponseEntity<>(
                e.getMessage(),
                HttpStatus.NOT_FOUND
        );
    }

    @ExceptionHandler(BookingRowNotFoundException.class)
    public ResponseEntity<String> handleBookingRowNotFoundException(
            BookingRowNotFoundException e
    ) {
        return new ResponseEntity<>(
                e.getMessage(),
                HttpStatus.NOT_FOUND
        );
    }

    @ExceptionHandler(BookingNotCancellableException.class)
    public ResponseEntity<String> handleBookingNotCancellableException(
            BookingNotCancellableException e
    ) {
        return new ResponseEntity<>(
                e.getMessage(),
                HttpStatus.BAD_REQUEST
        );
    }

    @ExceptionHandler(RouteNotFoundException.class)
    public ResponseEntity<String> handleRouteNotFoundException(
            RouteNotFoundException e
    ) {
        return new ResponseEntity<>(
                e.getMessage(),
                HttpStatus.NOT_FOUND
        );
    }

    @ExceptionHandler(SpaceportNotFoundException.class)
    public ResponseEntity<String> handleSpaceportNotFoundException(
            SpaceportNotFoundException e
    ) {
        return new ResponseEntity<>(
                e.getMessage(),
                HttpStatus.NOT_FOUND
        );
    }

    @ExceptionHandler(SpacecraftNotFoundException.class)
    public ResponseEntity<String> handleSpacecraftNotFoundException(
            SpacecraftNotFoundException e
    ) {
        return new ResponseEntity<>(
                e.getMessage(),
                HttpStatus.NOT_FOUND
        );
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgumentException(
            IllegalArgumentException e
    ) {
        return new ResponseEntity<>(
                e.getMessage(),
                HttpStatus.BAD_REQUEST
        );
    }
}
