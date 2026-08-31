package com.yspace.backend.service;

import com.yspace.backend.dto.*;
import com.yspace.backend.model.*;
import com.yspace.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final FlightRepository flightRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final RouteRepository routeRepository;
    private final SpaceportRepository spaceportRepository;
    private final SpacecraftRepository spacecraftRepository;
    private final BookingRowRepository bookingRowRepository;

    private static final DateTimeFormatter DT_FMT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");


    @Transactional(readOnly = true)
    public AdminDashboardDto getDashboard() {

        List<Flight> allFlights =
                flightRepository.findAllByOrderByDepartureTimeDesc();

        long scheduledFlights = allFlights.stream()
                .filter(f -> f.getStatus() == Flight.FlightStatus.SCHEDULED)
                .count();

        List<Booking> allBookings = bookingRepository.findAll();
        long openBookings = allBookings.stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.OPEN)
                .count();

        long totalPassengers = userRepository.count();
        long activeRoutes = routeRepository.count();
        long activeSpaceports = spaceportRepository.count();
        long activeSpacecraft = spacecraftRepository.count();

        List<AdminDashboardDto.AdminFlightSummaryDto> upcomingFlights =
                allFlights.stream()
                        .filter(f -> f.getStatus() == Flight.FlightStatus.SCHEDULED
                                || f.getStatus() == Flight.FlightStatus.BOARDING)
                        .limit(10)
                        .map(this::toFlightSummary)
                        .toList();

        List<AdminDashboardDto.AdminBookingSummaryDto> recentBookings =
                allBookings.stream()
                        .filter(b -> b.getStatus() != Booking.BookingStatus.CANCELLED)
                        .limit(5)
                        .map(this::toBookingSummary)
                        .toList();

        return new AdminDashboardDto(
                scheduledFlights,
                openBookings,
                totalPassengers,
                activeSpaceports,
                activeRoutes,
                activeSpacecraft,
                upcomingFlights,
                recentBookings
        );
    }


    @Transactional(readOnly = true)
    public List<RouteAdminResponseDto> getRoutes() {
        return routeRepository.findAll().stream()
                .map(route -> new RouteAdminResponseDto(
                        route.getId(),
                        route.getName(),
                        route.getOriginSpaceport().getName(),
                        route.getOriginSpaceport().getCode(),
                        route.getDestinationSpaceport().getName(),
                        route.getDestinationSpaceport().getCode(),
                        route.getDistance(),
                        route.getDescription()
                ))
                .toList();
    }


    @Transactional(readOnly = true)
    public List<AdminBookingResponseDto> getBookings(String search) {
        return bookingRepository.findAll().stream()
                .filter(b -> matchesBookingSearch(b, search))
                .map(this::toAdminBookingDto)
                .toList();
    }


    @Transactional(readOnly = true)
    public List<AdminUserResponseDto> getUsers(String search) {
        return userRepository.findAll().stream()
                .filter(u -> matchesUserSearch(u, search))
                .map(u -> new AdminUserResponseDto(
                        u.getId(),
                        u.getFirstName(),
                        u.getLastName(),
                        u.getEmail(),
                        u.getRole().name(),
                        u.getBookings().size(),
                        u.getCreatedAt()
                ))
                .toList();
    }


    @Transactional(readOnly = true)
    public List<AdminSpaceportResponseDto> getSpaceports() {
        return spaceportRepository.findAll().stream()
                .map(sp -> new AdminSpaceportResponseDto(
                        sp.getId(),
                        sp.getName(),
                        sp.getCode(),
                        sp.getType() != null ? sp.getType().name() : null,
                        sp.getDescription()
                ))
                .toList();
    }


    @Transactional(readOnly = true)
    public List<AdminSpacecraftResponseDto> getSpacecrafts() {
        return spacecraftRepository.findAll().stream()
                .map(sc -> new AdminSpacecraftResponseDto(
                        sc.getId(),
                        sc.getName(),
                        sc.getModel().getName(),
                        sc.getModel().getManufacturer(),
                        sc.getSeat_capacity(),
                        sc.getStatus().name(),
                        sc.getOperational()
                ))
                .toList();
    }


    private AdminDashboardDto.AdminFlightSummaryDto toFlightSummary(Flight flight) {
        long booked = bookingRowRepository
                .countBookedSeatsByFlightId(flight.getId(), Booking.BookingStatus.CANCELLED);

        return new AdminDashboardDto.AdminFlightSummaryDto(
                flight.getId(),
                flight.getCode(),
                flight.getRoute().getOriginSpaceport().getCode(),
                flight.getRoute().getDestinationSpaceport().getCode(),
                flight.getRoute().getOriginSpaceport().getName(),
                flight.getRoute().getDestinationSpaceport().getName(),
                flight.getDepartureTime() != null
                        ? flight.getDepartureTime().format(DT_FMT) : null,
                flight.getSpacecraft().getName(),
                booked,
                flight.getAvailableSeats(),
                flight.getStatus().name()
        );
    }


    private AdminDashboardDto.AdminBookingSummaryDto toBookingSummary(Booking booking) {
        String flightCode = null;
        String originCode = null;
        String destCode = null;

        if (!booking.getBookingRows().isEmpty()) {
            Flight f = booking.getBookingRows().get(0).getFlight();
            flightCode = f.getCode();
            originCode = f.getRoute().getOriginSpaceport().getCode();
            destCode = f.getRoute().getDestinationSpaceport().getCode();
        }

        return new AdminDashboardDto.AdminBookingSummaryDto(
                booking.getId(),
                booking.getUser().getFirstName() + " " + booking.getUser().getLastName(),
                flightCode,
                originCode,
                destCode,
                booking.getCreatedAt() != null
                        ? booking.getCreatedAt().format(DT_FMT) : null,
                booking.getStatus().name(),
                booking.getTotalPrice()
        );
    }


    private AdminBookingResponseDto toAdminBookingDto(Booking booking) {
        List<AdminBookingResponseDto.AdminBookingRowDto> rows =
                booking.getBookingRows().stream()
                        .map(row -> new AdminBookingResponseDto.AdminBookingRowDto(
                                row.getId(),
                                row.getFlight().getCode(),
                                row.getFlight().getRoute().getOriginSpaceport().getCode(),
                                row.getFlight().getRoute().getDestinationSpaceport().getCode(),
                                row.getPrice()
                        ))
                        .toList();

        return new AdminBookingResponseDto(
                booking.getId(),
                booking.getUser().getFirstName() + " " + booking.getUser().getLastName(),
                booking.getUser().getEmail(),
                booking.getTotalPrice(),
                booking.getStatus().name(),
                booking.getCreatedAt(),
                rows
        );
    }


    private boolean matchesBookingSearch(Booking booking, String search) {
        if (search == null || search.isBlank()) {
            return true;
        }

        String keyword = search.trim().toLowerCase();
        String text = String.join(" ",
                safe(String.valueOf(booking.getId())),
                safe(booking.getUser().getFirstName()),
                safe(booking.getUser().getLastName()),
                safe(booking.getUser().getEmail()),
                safe(booking.getStatus().name())
        ).toLowerCase();

        if (text.contains(keyword)) {
            return true;
        }

        return booking.getBookingRows().stream()
                .anyMatch(row -> {
                    String rowText = String.join(" ",
                            safe(row.getFlight().getCode()),
                            safe(row.getFlight().getRoute().getOriginSpaceport().getCode()),
                            safe(row.getFlight().getRoute().getDestinationSpaceport().getCode())
                    ).toLowerCase();
                    return rowText.contains(keyword);
                });
    }


    private boolean matchesUserSearch(User user, String search) {
        if (search == null || search.isBlank()) {
            return true;
        }

        String keyword = search.trim().toLowerCase();
        String text = String.join(" ",
                safe(user.getFirstName()),
                safe(user.getLastName()),
                safe(user.getEmail()),
                safe(user.getRole().name())
        ).toLowerCase();

        return text.contains(keyword);
    }


    private String safe(String value) {
        return value == null ? "" : value;
    }
}
