package com.yspace.backend.controller;

import com.yspace.backend.dto.FetchRouteResponseDto;
import com.yspace.backend.service.RouteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/routes")
public class RouteController {
    private final RouteService routeService;

    public RouteController(RouteService routeService) {
        this.routeService = routeService;
    }

    @GetMapping
    public ResponseEntity<List<FetchRouteResponseDto>> fetchAllRoutes(@RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(routeService.fetchAllRoutes(keyword));
    }
}
