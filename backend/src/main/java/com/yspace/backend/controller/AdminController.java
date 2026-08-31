package com.yspace.backend.controller;

import com.yspace.backend.dto.admin.AdminBookingResponseDto;
import com.yspace.backend.dto.admin.AdminSpacecraftResponseDto;
import com.yspace.backend.dto.admin.AdminSpaceportResponseDto;
import com.yspace.backend.dto.admin.AdminUserResponseDto;
import com.yspace.backend.dto.flight.AdminFlightResponseDto;
import com.yspace.backend.dto.flight.FlightDetailsResponseDto;
import com.yspace.backend.dto.flight.ScheduleFlightRequestDto;
import com.yspace.backend.dto.flight.UpdateFlightRequestDto;
import com.yspace.backend.dto.route.AdminRouteResponseDto;
import com.yspace.backend.dto.route.CreateRouteRequestDto;
import com.yspace.backend.dto.route.RouteAdminResponseDto;
import com.yspace.backend.dto.spaceport.CreateSpaceportRequestDto;
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
import org.springframework.web.bind.annotation.*;

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

    @GetMapping("/routes")
    public ResponseEntity<List<AdminRouteResponseDto>> getRoutes() {
        return ResponseEntity.ok(
                routeService.getAdminRouteOptions()
        );
    }

    @PostMapping("/routes")
    public ResponseEntity<RouteAdminResponseDto> createRoute(
            @Valid @RequestBody CreateRouteRequestDto request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(routeService.createRoute(request));
    }

    @GetMapping("/spacecraft")
    public ResponseEntity<List<AdminSpacecraftResponseDto>> getSpacecraft() {
        return ResponseEntity.ok(
                spacecraftService.getAdminSpacecraft()
        );
    }

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

    @PostMapping("/flights")
    public ResponseEntity<FlightDetailsResponseDto> scheduleFlight(
            @Valid @RequestBody ScheduleFlightRequestDto request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(flightService.scheduleFlight(request));
    }

    @PutMapping("/flights/{id}")
    public ResponseEntity<FlightDetailsResponseDto> updateFlight(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateFlightRequestDto request
    ) {
        return ResponseEntity.ok(
                flightService.updateFlight(id, request)
        );
    }

    @PatchMapping("/flights/{id}/cancel")
    public ResponseEntity<FlightDetailsResponseDto> cancelFlight(
            @PathVariable Integer id
    ) {
        return ResponseEntity.ok(
                flightService.cancelFlight(id)
        );
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<AdminBookingResponseDto>> getBookings(
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(
                adminService.getBookings(search)
        );
    }

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponseDto>> getUsers(
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(
                adminService.getUsers(search)
        );
    }

    @GetMapping("/spaceports")
    public ResponseEntity<List<AdminSpaceportResponseDto>> getSpaceports() {
        return ResponseEntity.ok(
                adminService.getSpaceports()
        );
    }

    @PostMapping("/spaceports")
    public ResponseEntity<AdminSpaceportResponseDto> createSpaceport(
            @Valid @RequestBody CreateSpaceportRequestDto request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(adminService.createSpaceport(request));
    }
}
