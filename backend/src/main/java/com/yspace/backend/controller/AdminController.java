package com.yspace.backend.controller;

import com.yspace.backend.dto.admin.AdminBookingResponseDto;
import com.yspace.backend.dto.admin.AdminSpacecraftModelResponseDto;
import com.yspace.backend.dto.admin.AdminSpacecraftResponseDto;
import com.yspace.backend.dto.admin.AdminSpaceportResponseDto;
import com.yspace.backend.dto.admin.AdminUserResponseDto;
import com.yspace.backend.dto.booking.UpdateAdminBookingRequestDto;
import com.yspace.backend.dto.flight.AdminFlightDetailsResponseDto;
import com.yspace.backend.dto.flight.AdminFlightResponseDto;
import com.yspace.backend.dto.flight.FlightDetailsResponseDto;
import com.yspace.backend.dto.flight.ScheduleFlightRequestDto;
import com.yspace.backend.dto.flight.UpdateFlightRequestDto;
import com.yspace.backend.dto.route.AdminRouteDetailsResponseDto;
import com.yspace.backend.dto.route.AdminRouteResponseDto;
import com.yspace.backend.dto.route.CreateRouteRequestDto;
import com.yspace.backend.dto.route.RouteAdminResponseDto;
import com.yspace.backend.dto.route.UpdateRouteRequestDto;
import com.yspace.backend.dto.spacecraft.AdminSpacecraftDetailsResponseDto;
import com.yspace.backend.dto.spacecraft.CreateSpacecraftRequestDto;
import com.yspace.backend.dto.spacecraft.UpdateSpacecraftRequestDto;
import com.yspace.backend.dto.spaceport.CreateSpaceportRequestDto;
import com.yspace.backend.dto.spaceport.UpdateSpaceportRequestDto;
import com.yspace.backend.dto.user.UpdateAdminUserRequestDto;
import com.yspace.backend.model.Flight;
import com.yspace.backend.service.AdminService;
import com.yspace.backend.service.FlightService;
import com.yspace.backend.service.RouteService;
import com.yspace.backend.service.SpacecraftService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final RouteService routeService;
    private final SpacecraftService spacecraftService;
    private final FlightService flightService;
    private final AdminService adminService;

    @GetMapping("/check")
    public ResponseEntity<Void> checkAdminAccess() {
        return ResponseEntity.noContent().build();
    }

    /* ============================================================
       ROUTES
    ============================================================ */

    @GetMapping("/routes")
    public ResponseEntity<List<AdminRouteResponseDto>> getRoutes() {
        return ResponseEntity.ok(routeService.getAdminRouteOptions());
    }

    @GetMapping("/routes/{id}")
    public ResponseEntity<AdminRouteDetailsResponseDto> getRoute(
            @PathVariable Integer id
    ) {
        return ResponseEntity.ok(routeService.getAdminRouteById(id));
    }

    @PostMapping("/routes")
    public ResponseEntity<RouteAdminResponseDto> createRoute(
            @Valid @RequestBody CreateRouteRequestDto request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(routeService.createRoute(request));
    }

    @PutMapping("/routes/{id}")
    public ResponseEntity<AdminRouteDetailsResponseDto> updateRoute(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateRouteRequestDto request
    ) {
        return ResponseEntity.ok(routeService.updateRoute(id, request));
    }

    /* ============================================================
       FLIGHTS
    ============================================================ */

    @GetMapping("/flights")
    public ResponseEntity<List<AdminFlightResponseDto>> getFlights(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Flight.FlightStatus status,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date
    ) {
        return ResponseEntity.ok(
                flightService.getAdminFlights(search, status, date)
        );
    }

    @GetMapping("/flights/{id}")
    public ResponseEntity<AdminFlightDetailsResponseDto> getFlight(
            @PathVariable Integer id
    ) {
        return ResponseEntity.ok(flightService.getAdminFlightById(id));
    }

    @PostMapping("/flights")
    public ResponseEntity<FlightDetailsResponseDto> scheduleFlight(
            @Valid @RequestBody ScheduleFlightRequestDto request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(flightService.scheduleFlight(request));
    }

    @PutMapping("/flights/{id}")
    public ResponseEntity<AdminFlightDetailsResponseDto> updateFlight(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateFlightRequestDto request
    ) {
        return ResponseEntity.ok(flightService.updateAdminFlight(id, request));
    }

    @PatchMapping("/flights/{id}/cancel")
    public ResponseEntity<FlightDetailsResponseDto> cancelFlight(
            @PathVariable Integer id
    ) {
        return ResponseEntity.ok(flightService.cancelFlight(id));
    }

    /* ============================================================
       BOOKINGS
    ============================================================ */

    @GetMapping("/bookings")
    public ResponseEntity<List<AdminBookingResponseDto>> getBookings(
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(adminService.getBookings(search));
    }

    @GetMapping("/bookings/{id}")
    public ResponseEntity<AdminBookingResponseDto> getBooking(
            @PathVariable Integer id
    ) {
        return ResponseEntity.ok(adminService.getBookingById(id));
    }

    @PutMapping("/bookings/{id}")
    public ResponseEntity<AdminBookingResponseDto> updateBooking(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateAdminBookingRequestDto request
    ) {
        return ResponseEntity.ok(adminService.updateBooking(id, request));
    }

    /* ============================================================
       USERS
    ============================================================ */

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponseDto>> getUsers(
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(adminService.getUsers(search));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<AdminUserResponseDto> getUser(
            @PathVariable Integer id
    ) {
        return ResponseEntity.ok(adminService.getUserById(id));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<AdminUserResponseDto> updateUser(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateAdminUserRequestDto request
    ) {
        return ResponseEntity.ok(adminService.updateUser(id, request));
    }

    /* ============================================================
       SPACEPORTS
    ============================================================ */

    @GetMapping("/spaceports")
    public ResponseEntity<List<AdminSpaceportResponseDto>> getSpaceports() {
        return ResponseEntity.ok(adminService.getSpaceports());
    }

    @GetMapping("/spaceports/{id}")
    public ResponseEntity<AdminSpaceportResponseDto> getSpaceport(
            @PathVariable Integer id
    ) {
        return ResponseEntity.ok(adminService.getSpaceportById(id));
    }

    @PostMapping("/spaceports")
    public ResponseEntity<AdminSpaceportResponseDto> createSpaceport(
            @Valid @RequestBody CreateSpaceportRequestDto request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(adminService.createSpaceport(request));
    }

    @PutMapping("/spaceports/{id}")
    public ResponseEntity<AdminSpaceportResponseDto> updateSpaceport(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateSpaceportRequestDto request
    ) {
        return ResponseEntity.ok(adminService.updateSpaceport(id, request));
    }

    /* ============================================================
       SPACECRAFT
    ============================================================ */

    @GetMapping("/spacecraft")
    public ResponseEntity<List<AdminSpacecraftResponseDto>> getSpacecraft() {
        return ResponseEntity.ok(spacecraftService.getAdminSpacecraft());
    }

    @GetMapping("/spacecraft/{id}")
    public ResponseEntity<AdminSpacecraftDetailsResponseDto> getSpacecraft(
            @PathVariable Integer id
    ) {
        return ResponseEntity.ok(spacecraftService.getAdminSpacecraftById(id));
    }

    @GetMapping("/spacecraft-models")
    public ResponseEntity<List<AdminSpacecraftModelResponseDto>>
    getSpacecraftModels() {
        return ResponseEntity.ok(spacecraftService.getAdminSpacecraftModels());
    }

    @PostMapping("/spacecraft")
    public ResponseEntity<AdminSpacecraftResponseDto> createSpacecraft(
            @Valid @RequestBody CreateSpacecraftRequestDto request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(spacecraftService.createSpacecraft(request));
    }

    @PutMapping("/spacecraft/{id}")
    public ResponseEntity<AdminSpacecraftDetailsResponseDto> updateSpacecraft(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateSpacecraftRequestDto request
    ) {
        return ResponseEntity.ok(spacecraftService.updateSpacecraft(id, request));
    }
}
