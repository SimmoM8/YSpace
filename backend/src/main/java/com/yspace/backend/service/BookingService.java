package com.yspace.backend.service;

import com.yspace.backend.dto.BookingResponseDto;
import com.yspace.backend.exceptions.FlightNotBookableException;
import com.yspace.backend.exceptions.FlightNotFoundException;
import com.yspace.backend.exceptions.UserNotFoundException;
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
    public BookingResponseDto createBooking(
            Integer flightId,
            String userEmail
    ) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException(userEmail));

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

        return bookingMapper.toDto(savedBooking);
    }

    private void validateFlightCanBeBooked(Flight flight) {

        if (flight.getStatus() == Flight.FlightStatus.CANCELLED) {
            throw new FlightNotBookableException(
                    "Cancelled flights cannot be booked"
            );
        }

        if (flight.getDepartureTime().isBefore(LocalDateTime.now())) {
            throw new FlightNotBookableException(
                    "Flights that have already departed cannot be booked"
            );
        }
    }

    public List<BookingResponseDto> getUserBookings(
            String userEmail
    ) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException(userEmail));

        List<Booking> bookings = bookingRepository.findAllByUser(user);

        List<BookingResponseDto> bookingDtos = new ArrayList<>();
        for (Booking booking : bookings) {
            bookingDtos.add(bookingMapper.toDto(booking));
        }

        return bookingDtos;
    }
}
