package com.yspace.backend.controller;

import com.yspace.backend.dto.booking.AdminBookingSummaryResponseDto;
import com.yspace.backend.dto.route.CreateRouteRequestDto;
import com.yspace.backend.dto.RouteAdminResponseDto;
import com.yspace.backend.dto.flight.ScheduleFlightRequestDto;
import com.yspace.backend.dto.flight.UpdateFlightRequestDto;
import com.yspace.backend.dto.flight.FlightDetailsResponseDto;
import com.yspace.backend.dto.spacecraft.CreateSpacecraftRequestDto;
import com.yspace.backend.dto.spacecraft.FetchSpacecraftModelResponseDto;
import com.yspace.backend.dto.spacecraft.FetchSpacecraftResponseDto;
import com.yspace.backend.dto.spacecraft.UpdateSpacecraftModelNameRequestDto;
import com.yspace.backend.dto.spaceport.CreateSpaceportRequestDto;
import com.yspace.backend.dto.spaceport.FetchSpaceportResponseDto;
import com.yspace.backend.dto.spaceport.UpdateSpaceportNameRequestDto;
import com.yspace.backend.service.BookingService;
import com.yspace.backend.service.FlightService;
import com.yspace.backend.service.RouteService;
import com.yspace.backend.service.SpacecraftService;
import com.yspace.backend.service.SpaceportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final RouteService routeService;
    private final FlightService flightService;
    private final SpacecraftService spacecraftService;
    private final SpaceportService spaceportService;
    private final BookingService bookingService;

    @PostMapping("/routes")
    public ResponseEntity<RouteAdminResponseDto> createRoute(
            @Valid @RequestBody CreateRouteRequestDto request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(routeService.createRoute(request));
    }

    @GetMapping("/routes")
    public ResponseEntity<List<RouteAdminResponseDto>> getAllRoutes(
            Authentication authentication
    ) {
        return ResponseEntity.ok(routeService.fetchAdminRoutes());
    }

    @DeleteMapping("/routes/{id}")
    public ResponseEntity<Void> deleteRoute(
            @PathVariable Integer id,
            Authentication authentication
    ) {
        routeService.deleteRoute(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/flights")
    public ResponseEntity<List<FlightDetailsResponseDto>> getAllFlights(
            Authentication authentication
    ) {
        return ResponseEntity.ok(flightService.getAllFlights());
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

    @GetMapping("/spacecraft")
    public ResponseEntity<List<FetchSpacecraftResponseDto>> getSpacecrafts(
            Authentication authentication
    ) {
        return ResponseEntity.ok(spacecraftService.getSpacecrafts());
    }

    @GetMapping("/spacecraft/models")
    public ResponseEntity<List<FetchSpacecraftModelResponseDto>> getSpacecraftModels(
            Authentication authentication
    ) {
        return ResponseEntity.ok(spacecraftService.getSpacecraftModels());
    }

    @PostMapping("/spacecraft")
    public ResponseEntity<FetchSpacecraftResponseDto> createSpacecraft(
            @Valid @RequestBody CreateSpacecraftRequestDto request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(spacecraftService.createSpacecraft(request));
    }

    @PatchMapping("/spacecraft/{id}/retire")
    public ResponseEntity<FetchSpacecraftResponseDto> retireSpacecraft(
            @PathVariable Integer id,
            Authentication authentication
    ) {
        return ResponseEntity.ok(spacecraftService.retireSpacecraft(id));
    }

    @DeleteMapping("/spacecraft/{id}")
    public ResponseEntity<Void> deleteSpacecraft(
            @PathVariable Integer id,
            Authentication authentication
    ) {
        spacecraftService.deleteSpacecraft(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/spacecraft/models/{id}")
    public ResponseEntity<Void> deleteSpacecraftModel(
            @PathVariable Integer id,
            Authentication authentication
    ) {
        spacecraftService.deleteSpacecraftModel(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/spacecraft/models/{id}/name")
    public ResponseEntity<FetchSpacecraftModelResponseDto> updateSpacecraftModelName(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateSpacecraftModelNameRequestDto request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(spacecraftService.updateSpacecraftModelName(id, request.getName()));
    }

    @PostMapping("/spaceports")
    public ResponseEntity<FetchSpaceportResponseDto> createSpaceport(
            @Valid @RequestBody CreateSpaceportRequestDto request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(spaceportService.createSpaceport(request));
    }

    @PatchMapping("/spaceports/{id}/name")
    public ResponseEntity<FetchSpaceportResponseDto> updateSpaceportName(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateSpaceportNameRequestDto request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(spaceportService.updateSpaceportName(id, request.getName()));
    }

    @DeleteMapping("/spaceports/{id}")
    public ResponseEntity<Void> deleteSpaceport(
            @PathVariable Integer id,
            Authentication authentication
    ) {
        spaceportService.deleteSpaceport(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<AdminBookingSummaryResponseDto>> getAllBookings(
            Authentication authentication
    ) {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }
}
