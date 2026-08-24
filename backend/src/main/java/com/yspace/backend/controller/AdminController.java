package com.yspace.backend.controller;

import com.yspace.backend.dto.CreateRouteRequestDto;
import com.yspace.backend.dto.RouteAdminResponseDto;
import com.yspace.backend.dto.ScheduleFlightRequestDto;
import com.yspace.backend.dto.UpdateFlightRequestDto;
import com.yspace.backend.dto.flight.FlightDetailsResponseDto;
import com.yspace.backend.service.FlightService;
import com.yspace.backend.service.RouteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final RouteService routeService;
    private final FlightService flightService;

    @PostMapping("/routes")
    public ResponseEntity<RouteAdminResponseDto> createRoute(
            @Valid @RequestBody CreateRouteRequestDto request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(routeService.createRoute(request));
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
            @Valid @RequestBody UpdateFlightRequestDto request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(flightService.updateFlight(id, request));
    }

    @PatchMapping("/flights/{id}/cancel")
    public ResponseEntity<FlightDetailsResponseDto> cancelFlight(
            @PathVariable Integer id,
            Authentication authentication
    ) {
        return ResponseEntity.ok(flightService.cancelFlight(id));
    }
}
