package com.yspace.backend.service;

import com.yspace.backend.dto.spaceport.FetchSpaceportResponseDto;
import com.yspace.backend.mapper.SpaceportMapper;
import com.yspace.backend.repository.SpaceportRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SpaceportService {

    private final SpaceportRepository spaceportRepository;
    private final SpaceportMapper spaceportMapper;

    public SpaceportService(SpaceportRepository spaceportRepository,  SpaceportMapper spaceportMapper) {
        this.spaceportRepository = spaceportRepository;
        this.spaceportMapper = spaceportMapper;
    }

    public List<FetchSpaceportResponseDto> getSpaceportsByKeyword(String keyword) {
        return spaceportRepository.findAllByKeyword(keyword)
                .stream()
                .map(spaceportMapper::toDto)
                .toList();
    }
}
