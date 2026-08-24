package com.yspace.backend.controller;

import com.yspace.backend.dto.booking.BookingDetailsResponseDto;
import com.yspace.backend.dto.booking.BookingRowDetailsResponseDto;
import com.yspace.backend.dto.booking.BookingSummaryResponseDto;
import com.yspace.backend.dto.CreateBookingRequestDto;
import com.yspace.backend.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<BookingDetailsResponseDto> createBooking(
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

    @GetMapping
    public ResponseEntity<List<BookingSummaryResponseDto>> getMyBookings(
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                bookingService.getUserBookings(
                        authentication.getName()
                )
        );
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<BookingDetailsResponseDto> getBookingDetails(
            @PathVariable Integer bookingId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                bookingService.getBookingDetails(
                        bookingId,
                        authentication.getName()
                )
        );
    }

    @GetMapping("/{bookingId}/rows/{rowId}")
    public ResponseEntity<BookingRowDetailsResponseDto>
    getBookingRowDetails(
            @PathVariable Integer bookingId,
            @PathVariable Integer rowId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                bookingService.getBookingRowDetails(
                        bookingId,
                        rowId,
                        authentication.getName()
                )
        );
    }

    @PatchMapping("/{bookingId}/cancel")
    public ResponseEntity<BookingDetailsResponseDto> cancelBooking(
            @PathVariable Integer bookingId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                bookingService.cancelBooking(
                        bookingId,
                        authentication.getName()
                )
        );
    }
}
