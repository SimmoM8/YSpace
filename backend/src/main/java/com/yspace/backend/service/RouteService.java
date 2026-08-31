package com.yspace.backend.service;

import com.yspace.backend.dto.route.RouteAdminResponseDto;
import com.yspace.backend.dto.route.AdminRouteResponseDto;
import com.yspace.backend.dto.route.CreateRouteRequestDto;
import com.yspace.backend.dto.route.FetchRouteResponseDto;
import com.yspace.backend.exceptions.SpaceportNotFoundException;
import com.yspace.backend.mapper.RouteMapper;
import com.yspace.backend.model.Route;
import com.yspace.backend.model.Spaceport;
import com.yspace.backend.repository.RouteRepository;
import com.yspace.backend.repository.SpaceportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RouteService {

    private final RouteMapper routeMapper;
    private final RouteRepository routeRepository;
    private final SpaceportRepository spaceportRepository;

    @Transactional(readOnly = true)
    public List<FetchRouteResponseDto> fetchAllRoutes(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return routeRepository.findAll()
                    .stream()
                    .map(routeMapper::toDto)
                    .toList();
        }

        return searchRoutes(keyword);
    }

    @Transactional(readOnly = true)
    public List<FetchRouteResponseDto> searchRoutes(String keyword) {
        return routeRepository.fetchByKeyword(keyword)
                .stream()
                .map(routeMapper::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AdminRouteResponseDto> getAdminRouteOptions() {
        return routeRepository.findAll()
                .stream()
                .map(route -> new AdminRouteResponseDto(
                        route.getId(),
                        route.getName(),
                        route.getOriginSpaceport().getName(),
                        route.getOriginSpaceport().getCode(),
                        route.getDestinationSpaceport().getName(),
                        route.getDestinationSpaceport().getCode(),
                        route.getDistance(),
                        route.getDescription()
                ))
                .toList();
    }

    @Transactional
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
                .orElseThrow(
                        () -> new SpaceportNotFoundException(
                                request.getOriginSpaceportId()
                        )
                );

        Spaceport destination = spaceportRepository.findById(request.getDestinationSpaceportId())
                .orElseThrow(
                        () -> new SpaceportNotFoundException(
                                request.getDestinationSpaceportId()
                        )
                );

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
