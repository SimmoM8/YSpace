package com.yspace.backend.service;

import com.yspace.backend.dto.flight.FlightDetailsResponseDto;
import com.yspace.backend.dto.flight.FlightSearchResponseDto;
import com.yspace.backend.dto.flight.ScheduleFlightRequestDto;
import com.yspace.backend.dto.flight.UpdateFlightRequestDto;
import com.yspace.backend.exceptions.FlightNotFoundException;
import com.yspace.backend.exceptions.RouteNotFoundException;
import com.yspace.backend.exceptions.SpacecraftNotFoundException;
import com.yspace.backend.exceptions.UserNotFoundException;
import com.yspace.backend.mapper.FlightMapper;
import com.yspace.backend.model.Flight;
import com.yspace.backend.model.Route;
import com.yspace.backend.model.Spacecraft;
import com.yspace.backend.model.User;
import com.yspace.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class FlightService {

    private final FlightRepository flightRepository;
    private final FlightMapper flightMapper;
    private final RouteRepository routeRepository;
    private final SpacecraftRepository spacecraftRepository;
    private final BookingRowRepository bookingRowRepository;
    private final UserRepository userRepository;

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

    public FlightDetailsResponseDto getFlightById(Integer id) {
        Flight flight = flightRepository.findById(id)
                .orElseThrow(() -> new FlightNotFoundException(id));

        return flightMapper.toDetailsDto(flight);
    }

    @Transactional
    public FlightDetailsResponseDto scheduleFlight(ScheduleFlightRequestDto request, String userEmail) {

        if (!request.getArrivalTime().isAfter(request.getDepartureTime())) {
            throw new IllegalArgumentException(
                    "Arrival time must be after departure time"
            );
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException(userEmail));

        Route route = routeRepository.findById(request.getRouteId())
                .orElseThrow(() -> new RouteNotFoundException(request.getRouteId()));

        Spacecraft spacecraft = spacecraftRepository.findById(request.getSpacecraftId())
                .orElseThrow(() -> new SpacecraftNotFoundException(request.getSpacecraftId()));

        Integer available_seats = spacecraft.getSeat_capacity();

        Flight flight = Flight.builder()
                .code(generateFlightCode(route))
                .route(route)
                .spacecraft(spacecraft)
                .basePrice(request.getBasePrice())
                .availableSeats(available_seats)
                .departureTime(request.getDepartureTime())
                .arrivalTime(request.getArrivalTime())
                .status(Flight.FlightStatus.SCHEDULED)
                .build();

        Flight savedFlight = flightRepository.save(flight);

        return flightMapper.toDetailsDto(savedFlight);
    }

    @Transactional
    public FlightDetailsResponseDto updateFlight(Integer id, UpdateFlightRequestDto request) {

        Flight flight = flightRepository.findById(id)
                .orElseThrow(() -> new FlightNotFoundException(id));

        validateFlightIsEditable(flight);

        if (request.getSpacecraftId() != null) {
            Spacecraft spacecraft = spacecraftRepository.findById(request.getSpacecraftId())
                    .orElseThrow(() -> new SpacecraftNotFoundException(request.getSpacecraftId()));
            flight.setSpacecraft(spacecraft);
        }
        if (request.getDepartureTime() != null && request.getArrivalTime() != null
                && !request.getArrivalTime().isAfter(request.getDepartureTime())) {
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
                        "Total seats cannot be lower than the number of already booked seats (" + bookedSeats + ")"
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

        if (flight.getStatus() != Flight.FlightStatus.SCHEDULED
                && flight.getStatus() != Flight.FlightStatus.BOARDING) {
            throw new IllegalArgumentException(
                    "Only scheduled or boarding flights can be cancelled"
            );
        }

        flight.setStatus(Flight.FlightStatus.CANCELLED);

        Flight cancelledFlight = flightRepository.save(flight);

        return flightMapper.toDetailsDto(cancelledFlight);
    }

    private void validateFlightIsEditable(Flight flight) {
        if (flight.getStatus() == Flight.FlightStatus.CANCELLED) {
            throw new IllegalArgumentException("Cancelled flights cannot be edited");
        }
        if (flight.getStatus() == Flight.FlightStatus.DEPARTED
                || flight.getStatus() == Flight.FlightStatus.ARRIVED
                || flight.getStatus() == Flight.FlightStatus.IN_FLIGHT) {
            throw new IllegalArgumentException("Flights that have already departed cannot be edited");
        }
    }

    private long getBookedSeats(Integer flightId) {
        return bookingRowRepository.countByFlightId(flightId);
    }

    private String generateFlightCode(Route route) {
        String prefix = route.getOriginSpaceport().getCode()
                + "-"
                + route.getDestinationSpaceport().getCode();

        Random random = new Random();
        String candidate;

        do {
            candidate = prefix + "-" + String.format("%04d", random.nextInt(10000));
        } while (flightRepository.existsByCode(candidate));

        return candidate;
    }
}
