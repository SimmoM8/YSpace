package com.yspace.backend.service;

import com.yspace.backend.dto.flight.AdminFlightResponseDto;
import com.yspace.backend.dto.flight.FlightDetailsResponseDto;
import com.yspace.backend.dto.flight.FlightSearchResponseDto;
import com.yspace.backend.dto.flight.ScheduleFlightRequestDto;
import com.yspace.backend.dto.flight.UpdateFlightRequestDto;
import com.yspace.backend.exceptions.FlightNotFoundException;
import com.yspace.backend.exceptions.RouteNotFoundException;
import com.yspace.backend.exceptions.SpacecraftNotFoundException;
import com.yspace.backend.mapper.FlightMapper;
import com.yspace.backend.model.Booking;
import com.yspace.backend.model.Flight;
import com.yspace.backend.model.Route;
import com.yspace.backend.model.Spacecraft;
import com.yspace.backend.repository.BookingRowRepository;
import com.yspace.backend.repository.FlightRepository;
import com.yspace.backend.repository.RouteRepository;
import com.yspace.backend.repository.SpacecraftRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class FlightService {

    private final FlightRepository flightRepository;
    private final FlightMapper flightMapper;
    private final RouteRepository routeRepository;
    private final SpacecraftRepository spacecraftRepository;
    private final BookingRowRepository bookingRowRepository;

    @Transactional(readOnly = true)
    public List<FlightSearchResponseDto> searchFlights(
            Integer originId,
            Integer destinationId,
            LocalDate date
    ) {
        if (originId.equals(destinationId)) {
            throw new IllegalArgumentException(
                    "Origin and destination cannot be the same"
            );
        }

        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime startOfNextDay = date.plusDays(1).atStartOfDay();

        return flightRepository.searchFlights(
                        originId,
                        destinationId,
                        startOfDay,
                        startOfNextDay
                )
                .stream()
                .map(flightMapper::toSearchDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public FlightDetailsResponseDto getFlightById(Integer id) {
        Flight flight = flightRepository.findById(id)
                .orElseThrow(() -> new FlightNotFoundException(id));

        return flightMapper.toDetailsDto(flight);
    }

    @Transactional(readOnly = true)
    public List<AdminFlightResponseDto> getAdminFlights(
            String search,
            Flight.FlightStatus status,
            LocalDate date
    ) {
        return flightRepository.findAllByOrderByDepartureTimeDesc()
                .stream()
                .filter(flight -> matchesSearch(flight, search))
                .filter(flight ->
                        status == null || flight.getStatus() == status
                )
                .filter(flight ->
                        date == null ||
                                (
                                        flight.getDepartureTime() != null &&
                                                flight.getDepartureTime()
                                                        .toLocalDate()
                                                        .equals(date)
                                )
                )
                .map(flight -> {
                    long bookedSeats = getBookedSeats(flight.getId());

                    return flightMapper.toAdminDto(flight, bookedSeats);
                })
                .toList();
    }

    @Transactional
    public FlightDetailsResponseDto scheduleFlight(
            ScheduleFlightRequestDto request
    ) {
        if (!request.getArrivalTime().isAfter(request.getDepartureTime())) {
            throw new IllegalArgumentException(
                    "Arrival time must be after departure time"
            );
        }

        Route route = routeRepository.findById(request.getRouteId())
                .orElseThrow(
                        () -> new RouteNotFoundException(request.getRouteId())
                );

        Spacecraft spacecraft = spacecraftRepository.findById(request.getSpacecraftId())
                .orElseThrow(
                        () -> new SpacecraftNotFoundException(
                                request.getSpacecraftId()
                        )
                );

        validateSpacecraftForFlight(
                spacecraft,
                route,
                request.getDepartureTime(),
                request.getArrivalTime()
        );

        Flight flight = Flight.builder()
                .code(generateFlightCode(route))
                .route(route)
                .spacecraft(spacecraft)
                .basePrice(request.getBasePrice())
                .availableSeats(spacecraft.getSeat_capacity())
                .departureTime(request.getDepartureTime())
                .arrivalTime(request.getArrivalTime())
                .status(Flight.FlightStatus.SCHEDULED)
                .build();

        Flight savedFlight = flightRepository.save(flight);

        return flightMapper.toDetailsDto(savedFlight);
    }

    @Transactional
    public FlightDetailsResponseDto updateFlight(
            Integer id,
            UpdateFlightRequestDto request
    ) {
        Flight flight = flightRepository.findById(id)
                .orElseThrow(() -> new FlightNotFoundException(id));

        validateFlightIsEditable(flight);

        if (request.getSpacecraftId() != null) {
            Spacecraft spacecraft = spacecraftRepository.findById(request.getSpacecraftId())
                    .orElseThrow(
                            () -> new SpacecraftNotFoundException(
                                    request.getSpacecraftId()
                            )
                    );

            flight.setSpacecraft(spacecraft);
        }

        LocalDateTime newDeparture = request.getDepartureTime() != null
                ? request.getDepartureTime()
                : flight.getDepartureTime();

        LocalDateTime newArrival = request.getArrivalTime() != null
                ? request.getArrivalTime()
                : flight.getArrivalTime();

        if (
                newDeparture != null &&
                        newArrival != null &&
                        !newArrival.isAfter(newDeparture)
        ) {
            throw new IllegalArgumentException(
                    "Arrival time must be after departure time"
            );
        }

        if (request.getDepartureTime() != null) {
            flight.setDepartureTime(request.getDepartureTime());
        }

        if (request.getArrivalTime() != null) {
            flight.setArrivalTime(request.getArrivalTime());
        }

        if (request.getBasePrice() != null) {
            flight.setBasePrice(request.getBasePrice());
        }

        if (request.getAvailableSeats() != null) {
            long bookedSeats = getBookedSeats(flight.getId());

            if (request.getAvailableSeats() < bookedSeats) {
                throw new IllegalArgumentException(
                        "Total seats cannot be lower than the number of already booked seats (" +
                                bookedSeats +
                                ")"
                );
            }

            if (request.getAvailableSeats() > flight.getSpacecraft().getSeat_capacity()) {
                throw new IllegalArgumentException(
                        "Total seats cannot exceed the spacecraft capacity (" +
                                flight.getSpacecraft().getSeat_capacity() +
                                ")"
                );
            }

            flight.setAvailableSeats(request.getAvailableSeats());
        }

        Flight updatedFlight = flightRepository.save(flight);

        return flightMapper.toDetailsDto(updatedFlight);
    }

    @Transactional
    public FlightDetailsResponseDto cancelFlight(Integer id) {
        Flight flight = flightRepository.findById(id)
                .orElseThrow(() -> new FlightNotFoundException(id));

        if (
                flight.getStatus() != Flight.FlightStatus.SCHEDULED &&
                        flight.getStatus() != Flight.FlightStatus.BOARDING
        ) {
            throw new IllegalArgumentException(
                    "Only scheduled or boarding flights can be cancelled"
            );
        }

        flight.setStatus(Flight.FlightStatus.CANCELLED);

        Flight cancelledFlight = flightRepository.save(flight);

        return flightMapper.toDetailsDto(cancelledFlight);
    }

    private void validateSpacecraftForFlight(
            Spacecraft spacecraft,
            Route route,
            LocalDateTime departureTime,
            LocalDateTime arrivalTime
    ) {
        if (!Boolean.TRUE.equals(spacecraft.getOperational())) {
            throw new IllegalArgumentException(
                    "The selected spacecraft is not operational"
            );
        }

        if (
                route.getDistance() != null &&
                        route.getDistance() > spacecraft.getModel().getMaxRange()
        ) {
            throw new IllegalArgumentException(
                    "The selected spacecraft does not have sufficient range for this route"
            );
        }

        long overlappingFlights = flightRepository.countOverlappingFlights(
                spacecraft.getId(),
                departureTime,
                arrivalTime
        );

        if (overlappingFlights > 0) {
            throw new IllegalArgumentException(
                    "The selected spacecraft is already assigned to another flight during this time"
            );
        }
    }

    private boolean matchesSearch(Flight flight, String search) {
        if (search == null || search.isBlank()) {
            return true;
        }

        String keyword = search.trim().toLowerCase(Locale.ROOT);

        String searchableText = String.join(
                " ",
                safe(flight.getCode()),
                safe(flight.getRoute().getName()),
                safe(flight.getRoute().getOriginSpaceport().getName()),
                safe(flight.getRoute().getOriginSpaceport().getCode()),
                safe(flight.getRoute().getDestinationSpaceport().getName()),
                safe(flight.getRoute().getDestinationSpaceport().getCode()),
                safe(flight.getSpacecraft().getName()),
                safe(flight.getSpacecraft().getModel().getName())
        ).toLowerCase(Locale.ROOT);

        return searchableText.contains(keyword);
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }

    private void validateFlightIsEditable(Flight flight) {
        if (flight.getStatus() == Flight.FlightStatus.CANCELLED) {
            throw new IllegalArgumentException(
                    "Cancelled flights cannot be edited"
            );
        }

        if (
                flight.getStatus() == Flight.FlightStatus.DEPARTED ||
                        flight.getStatus() == Flight.FlightStatus.ARRIVED ||
                        flight.getStatus() == Flight.FlightStatus.IN_FLIGHT
        ) {
            throw new IllegalArgumentException(
                    "Flights that have already departed cannot be edited"
            );
        }
    }

    private long getBookedSeats(Integer flightId) {
        return bookingRowRepository.countBookedSeatsByFlightId(
                flightId,
                Booking.BookingStatus.CANCELLED
        );
    }

    private String generateFlightCode(Route route) {
        String prefix = route.getOriginSpaceport().getCode() +
                "-" +
                route.getDestinationSpaceport().getCode();

        Random random = new Random();
        String candidate;

        do {
            candidate = prefix + "-" +
                    String.format("%04d", random.nextInt(10000));
        } while (flightRepository.existsByCode(candidate));

        return candidate;
    }
}
