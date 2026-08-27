package com.yspace.backend.controller;

import com.yspace.backend.dto.spacecraft.FetchSpacecraftResponseDto;
import com.yspace.backend.service.SpacecraftService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/spacecraft")
@RequiredArgsConstructor
public class SpacecraftController {

    private final SpacecraftService spacecraftService;

    @GetMapping
    public ResponseEntity<List<FetchSpacecraftResponseDto>> getSpacecrafts() {
        return ResponseEntity.ok(spacecraftService.getSpacecrafts());
    }
}
