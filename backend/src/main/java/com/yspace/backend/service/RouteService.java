package com.yspace.backend.service;

import com.yspace.backend.dto.admin.AdminSpaceportOptionDto;
import com.yspace.backend.dto.route.AdminRouteDetailsResponseDto;
import com.yspace.backend.dto.route.AdminRouteResponseDto;
import com.yspace.backend.dto.route.CreateRouteRequestDto;
import com.yspace.backend.dto.route.FetchRouteResponseDto;
import com.yspace.backend.dto.route.RouteAdminResponseDto;
import com.yspace.backend.dto.route.UpdateRouteRequestDto;
import com.yspace.backend.exceptions.RouteNotFoundException;
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
                .map(this::toAdminOptionDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public AdminRouteDetailsResponseDto getAdminRouteById(Integer id) {
        return toAdminDetailsDto(getRoute(id));
    }

    @Transactional
    public RouteAdminResponseDto createRoute(CreateRouteRequestDto request) {
        validateDifferentSpaceports(
                request.getOriginSpaceportId(),
                request.getDestinationSpaceportId()
        );

        if (routeRepository.existsByOriginSpaceportIdAndDestinationSpaceportId(
                request.getOriginSpaceportId(),
                request.getDestinationSpaceportId()
        )) {
            throw new IllegalArgumentException(
                    "A route between these two spaceports already exists"
            );
        }

        Spaceport origin = getSpaceport(request.getOriginSpaceportId());
        Spaceport destination = getSpaceport(request.getDestinationSpaceportId());

        Route route = Route.builder()
                .name(request.getName().trim())
                .originSpaceport(origin)
                .destinationSpaceport(destination)
                .distance(request.getDistance())
                .description(trimToNull(request.getDescription()))
                .build();

        return routeMapper.toAdminDto(routeRepository.save(route));
    }

    @Transactional
    public AdminRouteDetailsResponseDto updateRoute(
            Integer id,
            UpdateRouteRequestDto request
    ) {
        Route route = getRoute(id);

        validateDifferentSpaceports(
                request.getOriginSpaceportId(),
                request.getDestinationSpaceportId()
        );

        if (routeRepository.existsByOriginSpaceportIdAndDestinationSpaceportIdAndIdNot(
                request.getOriginSpaceportId(),
                request.getDestinationSpaceportId(),
                id
        )) {
            throw new IllegalArgumentException(
                    "A route between these two spaceports already exists"
            );
        }

        Spaceport origin = getSpaceport(request.getOriginSpaceportId());
        Spaceport destination = getSpaceport(request.getDestinationSpaceportId());

        route.setName(request.getName().trim());
        route.setOriginSpaceport(origin);
        route.setDestinationSpaceport(destination);
        route.setDistance(request.getDistance());
        route.setDescription(trimToNull(request.getDescription()));

        return toAdminDetailsDto(routeRepository.save(route));
    }

    private Route getRoute(Integer id) {
        return routeRepository.findById(id)
                .orElseThrow(() -> new RouteNotFoundException(id));
    }

    private Spaceport getSpaceport(Integer id) {
        return spaceportRepository.findById(id)
                .orElseThrow(() -> new SpaceportNotFoundException(id));
    }

    private void validateDifferentSpaceports(
            Integer originSpaceportId,
            Integer destinationSpaceportId
    ) {
        if (originSpaceportId.equals(destinationSpaceportId)) {
            throw new IllegalArgumentException(
                    "Origin and destination spaceports cannot be the same"
            );
        }
    }

    private AdminRouteResponseDto toAdminOptionDto(Route route) {
        return new AdminRouteResponseDto(
                route.getId(),
                route.getName(),
                route.getOriginSpaceport().getName(),
                route.getOriginSpaceport().getCode(),
                route.getDestinationSpaceport().getName(),
                route.getDestinationSpaceport().getCode(),
                toSpaceportOption(route.getOriginSpaceport()),
                toSpaceportOption(route.getDestinationSpaceport()),
                route.getDistance(),
                route.getDescription()
        );
    }

    private AdminRouteDetailsResponseDto toAdminDetailsDto(Route route) {
        return new AdminRouteDetailsResponseDto(
                route.getId(),
                route.getName(),
                route.getOriginSpaceport().getId(),
                route.getOriginSpaceport().getName(),
                route.getOriginSpaceport().getCode(),
                toSpaceportOption(route.getOriginSpaceport()),
                route.getDestinationSpaceport().getId(),
                route.getDestinationSpaceport().getName(),
                route.getDestinationSpaceport().getCode(),
                toSpaceportOption(route.getDestinationSpaceport()),
                route.getDistance(),
                route.getDescription()
        );
    }

    private AdminSpaceportOptionDto toSpaceportOption(Spaceport spaceport) {
        return new AdminSpaceportOptionDto(
                spaceport.getId(),
                spaceport.getName(),
                spaceport.getCode()
        );
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }
}
