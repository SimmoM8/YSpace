package com.yspace.backend.service;


import com.yspace.backend.dto.CreateRouteRequestDto;
import com.yspace.backend.dto.FetchRouteResponseDto;
import com.yspace.backend.dto.RouteAdminResponseDto;
import com.yspace.backend.exceptions.SpaceportNotFoundException;
import com.yspace.backend.mapper.RouteMapper;
import com.yspace.backend.model.Route;
import com.yspace.backend.model.Spaceport;
import com.yspace.backend.repository.RouteRepository;
import com.yspace.backend.repository.SpaceportRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RouteService {
    private final RouteMapper routeMapper;
    private final RouteRepository routeRepository;
    private final SpaceportRepository spaceportRepository;

    public RouteService(RouteRepository routeRepository, RouteMapper routeMapper, SpaceportRepository spaceportRepository) {
        this.routeRepository = routeRepository;
        this.routeMapper = routeMapper;
        this.spaceportRepository = spaceportRepository;
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
}
