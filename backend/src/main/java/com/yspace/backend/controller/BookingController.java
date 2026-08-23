package com.yspace.backend.controller;

import com.yspace.backend.dto.BookingResponseDto;
import com.yspace.backend.dto.CreateBookingRequestDto;
import com.yspace.backend.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping("/new-booking")
    public ResponseEntity<BookingResponseDto> createBooking(
            @Valid @RequestBody CreateBookingRequestDto request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                bookingService.createBooking(
                        request.getFlightId(),
                        authentication.getName()
                )
        );
    }

    @GetMapping("/my-bookings")
    public ResponseEntity<List<BookingResponseDto>> getMyBookings(
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                bookingService.getUserBookings(authentication.getName())
        );
    }
}
