package com.yspace.backend.controller;

import com.yspace.backend.dto.FlightSearchResponseDto;
import com.yspace.backend.service.FlightService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/flights")
@RequiredArgsConstructor
public class FlightController {

    private final FlightService flightService;

    @GetMapping
    public ResponseEntity<List<FlightSearchResponseDto>> searchFlights(
            @RequestParam(required = false) Integer departureId,
            @RequestParam(required = false) Integer destinationId) {
        return ResponseEntity.ok(flightService.searchFlights(departureId, destinationId));
    }
}

