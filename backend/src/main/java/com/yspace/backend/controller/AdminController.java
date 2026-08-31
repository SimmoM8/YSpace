package com.yspace.backend.controller;

import com.yspace.backend.dto.*;
import com.yspace.backend.dto.flight.AdminFlightResponseDto;
import com.yspace.backend.dto.flight.FlightDetailsResponseDto;
import com.yspace.backend.dto.flight.ScheduleFlightRequestDto;
import com.yspace.backend.dto.flight.UpdateFlightRequestDto;
import com.yspace.backend.dto.route.CreateRouteRequestDto;
import com.yspace.backend.model.Flight;
import com.yspace.backend.service.AdminService;
import com.yspace.backend.service.FlightService;
import com.yspace.backend.service.RouteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final RouteService routeService;
    private final FlightService flightService;
    private final AdminService adminService;


    @GetMapping("/check")
    public ResponseEntity<Void> checkAdminAccess() {
        return ResponseEntity.noContent().build();
    }


    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardDto> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboard());
    }


    @PostMapping("/routes")
    public ResponseEntity<RouteAdminResponseDto> createRoute(
            @Valid @RequestBody CreateRouteRequestDto request
    ) {
        return ResponseEntity.ok(
                routeService.createRoute(request)
        );
    }

    @GetMapping("/routes")
    public ResponseEntity<List<RouteAdminResponseDto>> getRoutes() {
        return ResponseEntity.ok(adminService.getRoutes());
    }


    @GetMapping("/flights")
    public ResponseEntity<List<AdminFlightResponseDto>>
    getFlights(
            @RequestParam(required = false)
            String search,

            @RequestParam(required = false)
            Flight.FlightStatus status,

            @RequestParam(required = false)
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate date
    ) {
        return ResponseEntity.ok(
                flightService.getAdminFlights(
                        search,
                        status,
                        date
                )
        );
    }

    @PostMapping("/flights")
    public ResponseEntity<FlightDetailsResponseDto> scheduleFlight(
            @Valid @RequestBody ScheduleFlightRequestDto request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                flightService.scheduleFlight(
                        request,
                        authentication.getName()
                )
        );
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
        return ResponseEntity.ok(adminService.getBookings(search));
    }


    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponseDto>> getUsers(
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(adminService.getUsers(search));
    }


    @GetMapping("/spaceports")
    public ResponseEntity<List<AdminSpaceportResponseDto>> getSpaceports() {
        return ResponseEntity.ok(adminService.getSpaceports());
    }


    @GetMapping("/spacecraft")
    public ResponseEntity<List<AdminSpacecraftResponseDto>> getSpacecrafts() {
        return ResponseEntity.ok(adminService.getSpacecrafts());
    }
}
