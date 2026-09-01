package com.yspace.backend.service;

import com.yspace.backend.dto.flight.AdminFlightDetailsResponseDto;
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
        return flightMapper.toDetailsDto(getFlight(id));
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
                .filter(flight -> status == null || flight.getStatus() == status)
                .filter(flight ->
                        date == null ||
                                (
                                        flight.getDepartureTime() != null &&
                                                flight.getDepartureTime()
                                                        .toLocalDate()
                                                        .equals(date)
                                )
                )
                .map(flight -> flightMapper.toAdminDto(
                        flight,
                        getBookedSeats(flight.getId())
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public AdminFlightDetailsResponseDto getAdminFlightById(Integer id) {
        Flight flight = getFlight(id);
        long bookedSeats = getBookedSeats(id);

        return toAdminDetailsDto(flight, bookedSeats);
    }

    @Transactional
    public FlightDetailsResponseDto scheduleFlight(
            ScheduleFlightRequestDto request
    ) {
        validateTimes(request.getDepartureTime(), request.getArrivalTime());

        Route route = getRoute(request.getRouteId());
        Spacecraft spacecraft = getSpacecraft(request.getSpacecraftId());

        validateSpacecraftForFlight(
                spacecraft,
                route,
                request.getDepartureTime(),
                request.getArrivalTime(),
                null
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

        return flightMapper.toDetailsDto(flightRepository.save(flight));
    }

    @Transactional
    public AdminFlightDetailsResponseDto updateAdminFlight(
            Integer id,
            UpdateFlightRequestDto request
    ) {
        Flight flight = getFlight(id);
        Route route = getRoute(request.getRouteId());
        Spacecraft spacecraft = getSpacecraft(request.getSpacecraftId());
        String code = request.getCode().trim().toUpperCase(Locale.ROOT);

        validateTimes(request.getDepartureTime(), request.getArrivalTime());

        if (flightRepository.existsByCodeIgnoreCaseAndIdNot(code, id)) {
            throw new IllegalArgumentException(
                    "A flight with this code already exists"
            );
        }

        long bookedSeats = getBookedSeats(id);

        if (bookedSeats > spacecraft.getSeat_capacity()) {
            throw new IllegalArgumentException(
                    "The selected spacecraft has fewer seats than the number already booked (" +
                            bookedSeats + ")"
            );
        }

        if (request.getStatus() != Flight.FlightStatus.CANCELLED) {
            validateSpacecraftForFlight(
                    spacecraft,
                    route,
                    request.getDepartureTime(),
                    request.getArrivalTime(),
                    id
            );
        }

        flight.setCode(code);
        flight.setRoute(route);
        flight.setSpacecraft(spacecraft);
        flight.setStatus(request.getStatus());
        flight.setDepartureTime(request.getDepartureTime());
        flight.setArrivalTime(request.getArrivalTime());
        flight.setBasePrice(request.getPrice());

        // availableSeats is used as this flight's total sellable capacity.
        // When changing spacecraft, keep it consistent with the selected craft.
        flight.setAvailableSeats(spacecraft.getSeat_capacity());

        Flight updatedFlight = flightRepository.save(flight);

        return toAdminDetailsDto(updatedFlight, bookedSeats);
    }

    @Transactional
    public FlightDetailsResponseDto cancelFlight(Integer id) {
        Flight flight = getFlight(id);

        if (
                flight.getStatus() != Flight.FlightStatus.SCHEDULED &&
                        flight.getStatus() != Flight.FlightStatus.BOARDING
        ) {
            throw new IllegalArgumentException(
                    "Only scheduled or boarding flights can be cancelled"
            );
        }

        flight.setStatus(Flight.FlightStatus.CANCELLED);

        return flightMapper.toDetailsDto(flightRepository.save(flight));
    }

    private void validateSpacecraftForFlight(
            Spacecraft spacecraft,
            Route route,
            LocalDateTime departureTime,
            LocalDateTime arrivalTime,
            Integer excludedFlightId
    ) {
        if (!Boolean.TRUE.equals(spacecraft.getOperational())) {
            throw new IllegalArgumentException(
                    "The selected spacecraft is not operational"
            );
        }

        if (
                route.getDistance() != null &&
                        spacecraft.getModel().getMaxRange() != null &&
                        route.getDistance() > spacecraft.getModel().getMaxRange()
        ) {
            throw new IllegalArgumentException(
                    "The selected spacecraft does not have sufficient range for this route"
            );
        }

        long overlappingFlights = excludedFlightId == null
                ? flightRepository.countOverlappingFlights(
                        spacecraft.getId(),
                        departureTime,
                        arrivalTime
                )
                : flightRepository.countOverlappingFlightsExcludingFlight(
                        spacecraft.getId(),
                        departureTime,
                        arrivalTime,
                        excludedFlightId
                );

        if (overlappingFlights > 0) {
            throw new IllegalArgumentException(
                    "The selected spacecraft is already assigned to another flight during this time"
            );
        }
    }

    private void validateTimes(
            LocalDateTime departureTime,
            LocalDateTime arrivalTime
    ) {
        if (!arrivalTime.isAfter(departureTime)) {
            throw new IllegalArgumentException(
                    "Arrival time must be after departure time"
            );
        }
    }

    private Flight getFlight(Integer id) {
        return flightRepository.findById(id)
                .orElseThrow(() -> new FlightNotFoundException(id));
    }

    private Route getRoute(Integer id) {
        return routeRepository.findById(id)
                .orElseThrow(() -> new RouteNotFoundException(id));
    }

    private Spacecraft getSpacecraft(Integer id) {
        return spacecraftRepository.findById(id)
                .orElseThrow(() -> new SpacecraftNotFoundException(id));
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

    private long getBookedSeats(Integer flightId) {
        return bookingRowRepository.countBookedSeatsByFlightId(
                flightId,
                Booking.BookingStatus.CANCELLED
        );
    }

    private AdminFlightDetailsResponseDto toAdminDetailsDto(
            Flight flight,
            long bookedSeats
    ) {
        int seatCapacity = flight.getAvailableSeats();
        long remainingSeats = Math.max(seatCapacity - bookedSeats, 0);

        return new AdminFlightDetailsResponseDto(
                flight.getId(),
                flight.getCode(),
                flight.getRoute().getId(),
                flight.getRoute().getName(),
                flight.getRoute().getDescription(),
                flight.getRoute().getDistance(),
                flight.getRoute().getOriginSpaceport().getName(),
                flight.getRoute().getOriginSpaceport().getCode(),
                flight.getRoute().getDestinationSpaceport().getName(),
                flight.getRoute().getDestinationSpaceport().getCode(),
                flight.getSpacecraft().getId(),
                flight.getSpacecraft().getName(),
                flight.getSpacecraft().getModel().getName(),
                flight.getSpacecraft().getModel().getManufacturer(),
                seatCapacity,
                bookedSeats,
                remainingSeats,
                flight.getStatus().name(),
                flight.getDelayed(),
                flight.getBasePrice(),
                flight.getDepartureTime(),
                flight.getArrivalTime()
        );
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
