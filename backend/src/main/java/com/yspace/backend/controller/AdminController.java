package com.yspace.backend.controller;

import com.yspace.backend.dto.RouteAdminResponseDto;
import com.yspace.backend.dto.flight.AdminFlightResponseDto;
import com.yspace.backend.dto.flight.FlightDetailsResponseDto;
import com.yspace.backend.dto.flight.ScheduleFlightRequestDto;
import com.yspace.backend.dto.flight.UpdateFlightRequestDto;
import com.yspace.backend.dto.route.CreateRouteRequestDto;
import com.yspace.backend.model.Flight;
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


    @GetMapping("/check")
    public ResponseEntity<Void> checkAdminAccess() {
        return ResponseEntity.noContent().build();
    }


    @PostMapping("/routes")
    public ResponseEntity<RouteAdminResponseDto> createRoute(
            @Valid @RequestBody CreateRouteRequestDto request
    ) {
        return ResponseEntity.ok(
                routeService.createRoute(request)
        );
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
}
