package com.yspace.backend.service;


import com.yspace.backend.dto.FlightSearchResponseDto;
import com.yspace.backend.mapper.FlightMapper;
import com.yspace.backend.repository.FlightRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FlightService {

    private final FlightRepository flightRepository;
    private final FlightMapper flightMapper;

    public List<FlightSearchResponseDto> searchFlights(Integer departureId, Integer destinationId) {
        return flightRepository.searchFlights(departureId, destinationId)
                .stream()
                .map(flightMapper::toSearchDto)
                .collect(Collectors.toList());
    }


}