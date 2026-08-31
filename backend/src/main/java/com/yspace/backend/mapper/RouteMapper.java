package com.yspace.backend.mapper;

import com.yspace.backend.dto.route.FetchRouteResponseDto;
import com.yspace.backend.dto.route.RouteAdminResponseDto;
import com.yspace.backend.model.Route;
import org.springframework.stereotype.Component;

@Component
public class RouteMapper {
    public FetchRouteResponseDto toDto(Route route) {
        return new FetchRouteResponseDto(
                route.getName(),
                route.getOriginSpaceport().getName(),
                route.getDestinationSpaceport().getName(),
                route.getDistance(),
                route.getDescription()
        );
    }

    public RouteAdminResponseDto toAdminDto(Route route) {
        return new RouteAdminResponseDto(
                route.getId(),
                route.getName(),
                route.getOriginSpaceport().getName(),
                route.getDestinationSpaceport().getName(),
                route.getDistance(),
                route.getDescription()
        );
    }
}
