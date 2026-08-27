package com.yspace.backend.controller;

import com.yspace.backend.dto.RouteAdminResponseDto;
import com.yspace.backend.dto.flight.FlightDetailsResponseDto;
import com.yspace.backend.dto.flight.ScheduleFlightRequestDto;
import com.yspace.backend.dto.flight.UpdateFlightRequestDto;
import com.yspace.backend.dto.route.CreateRouteRequestDto;
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


    /*
     * Used by the admin frontend to verify that the current
     * authenticated user has ADMIN access.
     *
     * Spring Security has already checked the ADMIN role before
     * this method can execute.
     */
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
