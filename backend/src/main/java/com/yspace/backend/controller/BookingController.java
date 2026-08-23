package com.yspace.backend.controller;

import com.yspace.backend.dto.BookingResponseDto;
import com.yspace.backend.dto.CreateBookingRequestDto;
import com.yspace.backend.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
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
}
