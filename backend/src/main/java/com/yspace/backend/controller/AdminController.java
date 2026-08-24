package com.yspace.backend.controller;

import com.yspace.backend.dto.CreateRouteRequestDto;
import com.yspace.backend.dto.FlightDetailsResponseDto;
import com.yspace.backend.dto.RouteAdminResponseDto;
import com.yspace.backend.dto.ScheduleFlightRequestDto;
import com.yspace.backend.dto.UpdateFlightRequestDto;
import com.yspace.backend.service.FlightService;
import com.yspace.backend.service.RouteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final RouteService routeService;
    private final FlightService flightService;

    @PostMapping("/routes")
    public ResponseEntity<RouteAdminResponseDto> createRoute(
            @Valid @RequestBody CreateRouteRequestDto request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(routeService.createRoute(request));
    }

    @PostMapping("/flights")
    public ResponseEntity<FlightDetailsResponseDto> scheduleFlight(
            @Valid @RequestBody ScheduleFlightRequestDto request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(flightService.scheduleFlight(request));
    }

    @PutMapping("/flights/{id}")
    public ResponseEntity<FlightDetailsResponseDto> updateFlight(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateFlightRequestDto request
    ) {
        return ResponseEntity.ok(flightService.updateFlight(id, request));
    }

    @PatchMapping("/flights/{id}/cancel")
    public ResponseEntity<FlightDetailsResponseDto> cancelFlight(
            @PathVariable Integer id
    ) {
        return ResponseEntity.ok(flightService.cancelFlight(id));
    }
}
