package com.yspace.backend.controller;

import com.yspace.backend.dto.route.FetchRouteResponseDto;
import com.yspace.backend.service.RouteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/routes")
@RequiredArgsConstructor
public class RouteController {

    private final RouteService routeService;

    @GetMapping
    public ResponseEntity<List<FetchRouteResponseDto>> fetchAllRoutes(
            @RequestParam(required = false) String keyword
    ) {
        return ResponseEntity.ok(
                routeService.fetchAllRoutes(keyword)
        );
    }
}
