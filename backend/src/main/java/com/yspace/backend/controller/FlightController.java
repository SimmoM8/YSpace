package com.yspace.backend.controller;

import com.yspace.backend.dto.FlightDetailsResponseDto;
import com.yspace.backend.dto.FlightSearchResponseDto;
import com.yspace.backend.service.FlightService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/flights")
@RequiredArgsConstructor
public class FlightController {

    private final FlightService flightService;

    @GetMapping("/search")
    public ResponseEntity<List<FlightSearchResponseDto>> searchFlights(
            @RequestParam Integer originId,
            @RequestParam Integer destinationId,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date
    ) {
        return ResponseEntity.ok(
                flightService.searchFlights(originId, destinationId, date)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<FlightDetailsResponseDto> getFlightById(
            @PathVariable Integer id
    ) {
        return ResponseEntity.ok(
                flightService.getFlightById(id)
        );
    }
}
