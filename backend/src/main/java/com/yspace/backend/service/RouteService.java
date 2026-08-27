package com.yspace.backend.service;


import com.yspace.backend.dto.route.CreateRouteRequestDto;
import com.yspace.backend.dto.route.FetchRouteResponseDto;
import com.yspace.backend.dto.RouteAdminResponseDto;
import com.yspace.backend.exceptions.RouteNotFoundException;
import com.yspace.backend.exceptions.SpaceportNotFoundException;
import com.yspace.backend.mapper.RouteMapper;
import com.yspace.backend.model.Route;
import com.yspace.backend.model.Spaceport;
import com.yspace.backend.repository.FlightRepository;
import com.yspace.backend.repository.RouteRepository;
import com.yspace.backend.repository.SpaceportRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RouteService {
    private final RouteMapper routeMapper;
    private final RouteRepository routeRepository;
    private final SpaceportRepository spaceportRepository;
    private final FlightRepository flightRepository;

    public RouteService(RouteRepository routeRepository, RouteMapper routeMapper, SpaceportRepository spaceportRepository, FlightRepository flightRepository) {
        this.routeRepository = routeRepository;
        this.routeMapper = routeMapper;
        this.spaceportRepository = spaceportRepository;
        this.flightRepository = flightRepository;
    }

    public List<FetchRouteResponseDto> fetchAllRoutes(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return routeRepository.findAll()
                    .stream()
                    .map(routeMapper::toDto)
                    .collect(Collectors.toList());
        } else {
            return searchRoutes(keyword);
        }

    }

    public List<FetchRouteResponseDto> searchRoutes(String keyword) {
        return routeRepository.fetchByKeyword(keyword)
                .stream()
                .map(routeMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<RouteAdminResponseDto> fetchAdminRoutes() {
        return routeRepository.findAll()
                .stream()
                .map(routeMapper::toAdminDto)
                .collect(Collectors.toList());
    }

    public RouteAdminResponseDto createRoute(CreateRouteRequestDto request) {

        if (request.getOriginSpaceportId().equals(request.getDestinationSpaceportId())) {
            throw new IllegalArgumentException(
                    "Origin and destination spaceports cannot be the same"
            );
        }

        if (routeRepository.existsByOriginSpaceportIdAndDestinationSpaceportId(
                request.getOriginSpaceportId(),
                request.getDestinationSpaceportId()
        )) {
            throw new IllegalArgumentException(
                    "A route between these two spaceports already exists"
            );
        }

        Spaceport origin = spaceportRepository.findById(request.getOriginSpaceportId())
                .orElseThrow(() -> new SpaceportNotFoundException(request.getOriginSpaceportId()));

        Spaceport destination = spaceportRepository.findById(request.getDestinationSpaceportId())
                .orElseThrow(() -> new SpaceportNotFoundException(request.getDestinationSpaceportId()));

        Route route = Route.builder()
                .name(request.getName())
                .originSpaceport(origin)
                .destinationSpaceport(destination)
                .distance(request.getDistance())
                .description(request.getDescription())
                .build();

        Route savedRoute = routeRepository.save(route);

        return routeMapper.toAdminDto(savedRoute);
    }

    @Transactional
    public void deleteRoute(Integer id) {
        Route route = routeRepository.findById(id)
                .orElseThrow(() -> new RouteNotFoundException(id));

        boolean hasFlights = flightRepository.existsByRouteId(id);
        if (hasFlights) {
            throw new IllegalArgumentException(
                    "This route has flights scheduled and cannot be deleted. Remove or cancel its flights first."
            );
        }

        routeRepository.delete(route);
    }
}
