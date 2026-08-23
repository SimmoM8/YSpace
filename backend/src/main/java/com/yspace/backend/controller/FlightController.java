package com.yspace.backend.controller;

import com.yspace.backend.dto.FlightSearchResponseDto;
import com.yspace.backend.service.FlightService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/flights")
@RequiredArgsConstructor
public class FlightController {

    private final FlightService flightService;

    @GetMapping
    public ResponseEntity<List<FlightSearchResponseDto>> searchFlights(
            @RequestParam(required = false) Integer originId,
            @RequestParam(required = false) Integer destinationId,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDate date
    ) {
        return ResponseEntity.ok(flightService.searchFlights(originId, destinationId, date));
    }
}

