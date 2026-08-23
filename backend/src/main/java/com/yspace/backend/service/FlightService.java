package com.yspace.backend.service;

import com.yspace.backend.dto.FlightDetailsResponseDto;
import com.yspace.backend.dto.FlightSearchResponseDto;
import com.yspace.backend.exceptions.FlightNotFoundException;
import com.yspace.backend.mapper.FlightMapper;
import com.yspace.backend.model.Flight;
import com.yspace.backend.repository.FlightRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FlightService {

    private final FlightRepository flightRepository;
    private final FlightMapper flightMapper;

    public List<FlightSearchResponseDto> searchFlights(
            Integer originId,
            Integer destinationId,
            LocalDate date
    ) {
        if (originId.equals(destinationId)) {
            throw new IllegalArgumentException(
                    "Origin and destination cannot be the same"
            );
        }

        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime startOfNextDay = date.plusDays(1).atStartOfDay();

        return flightRepository.searchFlights(
                        originId,
                        destinationId,
                        startOfDay,
                        startOfNextDay
                )
                .stream()
                .map(flightMapper::toSearchDto)
                .toList();
    }

    public FlightDetailsResponseDto getFlightById(Integer id) {
        Flight flight = flightRepository.findById(id)
                .orElseThrow(() -> new FlightNotFoundException(id));

        return flightMapper.toDetailsDto(flight);
    }
}
