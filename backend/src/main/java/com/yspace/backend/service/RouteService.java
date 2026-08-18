package com.yspace.backend.service;


import com.yspace.backend.dto.FetchRouteResponseDto;
import com.yspace.backend.mapper.RouteMapper;
import com.yspace.backend.repository.RouteRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RouteService {
    private final RouteMapper routeMapper;
    private final RouteRepository routeRepository;

    public RouteService(RouteRepository routeRepository, RouteMapper routeMapper) {
        this.routeRepository = routeRepository;
        this.routeMapper = routeMapper;
    }

    public List<FetchRouteResponseDto> fetchAllRoutes() {
        return routeRepository.findAll()
                .stream()
                .map(routeMapper::toDto)
                .collect(Collectors.toList());

    }
}
