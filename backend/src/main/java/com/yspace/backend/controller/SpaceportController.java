package com.yspace.backend.controller;

import com.yspace.backend.dto.spaceport.FetchSpaceportResponseDto;
import com.yspace.backend.service.SpaceportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/spaceports")
public class SpaceportController {
    private final SpaceportService spaceportService;

    public SpaceportController(SpaceportService spaceportService) {
        this.spaceportService = spaceportService;
    }

    @GetMapping
    public ResponseEntity<List<FetchSpaceportResponseDto>> getSpaceports(@RequestParam(required = true) String keyword){
        return ResponseEntity.ok(spaceportService.getSpaceportsByKeyword(keyword));
    }
}
