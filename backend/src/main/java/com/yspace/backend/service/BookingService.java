package com.yspace.backend.service;

import com.yspace.backend.dto.booking.BookingDetailsResponseDto;
import com.yspace.backend.dto.booking.BookingRowDetailsResponseDto;
import com.yspace.backend.dto.booking.BookingSummaryResponseDto;
import com.yspace.backend.exceptions.*;
import com.yspace.backend.mapper.BookingMapper;
import com.yspace.backend.model.Booking;
import com.yspace.backend.model.BookingRow;
import com.yspace.backend.model.Flight;
import com.yspace.backend.model.User;
import com.yspace.backend.repository.BookingRepository;
import com.yspace.backend.repository.FlightRepository;
import com.yspace.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final FlightRepository flightRepository;
    private final UserRepository userRepository;
    private final BookingMapper bookingMapper;

    @Transactional
    public BookingDetailsResponseDto createBooking(
            Integer flightId,
            String userEmail
    ) {
        User user = getUser(userEmail);

        Flight flight = flightRepository.findById(flightId)
                .orElseThrow(() -> new FlightNotFoundException(flightId));

        validateFlightCanBeBooked(flight);

        Booking booking = Booking.builder()
                .user(user)
                .totalPrice(flight.getBasePrice())
                .status(Booking.BookingStatus.OPEN)
                .bookingRows(new ArrayList<>())
                .build();

        BookingRow bookingRow = BookingRow.builder()
                .booking(booking)
                .flight(flight)
                .price(flight.getBasePrice())
                .build();

        booking.getBookingRows().add(bookingRow);

        Booking savedBooking = bookingRepository.save(booking);

        return bookingMapper.toDetailsDto(savedBooking);
    }

    @Transactional(readOnly = true)
    public List<BookingSummaryResponseDto> getUserBookings(
            String userEmail
    ) {
        User user = getUser(userEmail);

        List<Booking> bookings = bookingRepository.findAllByUserOrderByCreatedAtDesc(user);

        return bookings.stream()
                .map(bookingMapper::toSummaryDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public BookingDetailsResponseDto getBookingDetails(
            Integer bookingId,
            String userEmail
    ) {
        User user = getUser(userEmail);

        Booking booking = getUserBooking(
                bookingId,
                user
        );

        return bookingMapper.toDetailsDto(booking);
    }

    @Transactional(readOnly = true)
    public BookingRowDetailsResponseDto getBookingRowDetails(
            Integer bookingId,
            Integer bookingRowId,
            String userEmail
    ) {
        User user = getUser(userEmail);

        Booking booking = getUserBooking(
                bookingId,
                user
        );

        BookingRow bookingRow = booking.getBookingRows()
                .stream()
                .filter(row -> row.getId().equals(bookingRowId))
                .findFirst()
                .orElseThrow(
                        () -> new BookingRowNotFoundException(
                                bookingRowId
                        )
                );

        return bookingMapper.toRowDetailsDto(bookingRow);
    }

    @Transactional
    public BookingDetailsResponseDto cancelBooking(
            Integer bookingId,
            String userEmail
    ) {
        User user = getUser(userEmail);

        Booking booking = getUserBooking(
                bookingId,
                user
        );

        validateBookingCanBeCancelled(booking);

        booking.setStatus(Booking.BookingStatus.CANCELLED);

        return bookingMapper.toDetailsDto(booking);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(
                        () -> new UserNotFoundException(email)
                );
    }

    private Booking getUserBooking(
            Integer bookingId,
            User user
    ) {
        return bookingRepository
                .findByIdAndUser(bookingId, user)
                .orElseThrow(
                        () -> new BookingNotFoundException(
                                bookingId
                        )
                );
    }

    private void validateFlightCanBeBooked(Flight flight) {

        if (flight.getStatus() == Flight.FlightStatus.CANCELLED) {
            throw new FlightNotBookableException(
                    "Cancelled flights cannot be booked"
            );
        }

        if (flight.getDepartureTime()
                .isBefore(LocalDateTime.now())) {

            throw new FlightNotBookableException(
                    "Flights that have already departed cannot be booked"
            );
        }
    }

    private void validateBookingCanBeCancelled(Booking booking) {

        if (booking.getStatus() != Booking.BookingStatus.OPEN) {
            throw new BookingNotCancellableException(
                    "Only open bookings can be cancelled"
            );
        }
    }
}
