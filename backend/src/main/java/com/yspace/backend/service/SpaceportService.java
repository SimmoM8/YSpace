package com.yspace.backend.service;

import com.yspace.backend.dto.spaceport.CreateSpaceportRequestDto;
import com.yspace.backend.dto.spaceport.FetchSpaceportResponseDto;
import com.yspace.backend.exceptions.SpaceportNotFoundException;
import com.yspace.backend.mapper.SpaceportMapper;
import com.yspace.backend.model.Spaceport;
import com.yspace.backend.repository.RouteRepository;
import com.yspace.backend.repository.SpaceportRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SpaceportService {

    private final SpaceportRepository spaceportRepository;
    private final SpaceportMapper spaceportMapper;
    private final RouteRepository routeRepository;

    public SpaceportService(SpaceportRepository spaceportRepository,  SpaceportMapper spaceportMapper, RouteRepository routeRepository) {
        this.spaceportRepository = spaceportRepository;
        this.spaceportMapper = spaceportMapper;
        this.routeRepository = routeRepository;
    }

    public List<FetchSpaceportResponseDto> getSpaceportsByKeyword(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return spaceportRepository.findAll()
                    .stream()
                    .map(spaceportMapper::toDto)
                    .toList();
        }
        return spaceportRepository.findAllByKeyword(keyword)
                .stream()
                .map(spaceportMapper::toDto)
                .toList();
    }

    @Transactional
    public FetchSpaceportResponseDto createSpaceport(CreateSpaceportRequestDto request) {
        if (spaceportRepository.findAll().stream()
                .anyMatch(s -> s.getCode().equalsIgnoreCase(request.getCode()))) {
            throw new IllegalArgumentException(
                    "A spaceport with code " + request.getCode() + " already exists"
            );
        }

        Spaceport spaceport = Spaceport.builder()
                .name(request.getName())
                .code(request.getCode())
                .type(Spaceport.Type.valueOf(request.getType().toUpperCase()))
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .build();

        Spaceport saved = spaceportRepository.save(spaceport);

        return spaceportMapper.toDto(saved);
    }

    @Transactional
    public FetchSpaceportResponseDto updateSpaceportName(Integer id, String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Spaceport name cannot be empty");
        }

        Spaceport spaceport = spaceportRepository.findById(id)
                .orElseThrow(() -> new SpaceportNotFoundException(id));

        spaceport.setName(name);
        Spaceport saved = spaceportRepository.save(spaceport);

        return spaceportMapper.toDto(saved);
    }

    @Transactional
    public void deleteSpaceport(Integer id) {
        Spaceport spaceport = spaceportRepository.findById(id)
                .orElseThrow(() -> new SpaceportNotFoundException(id));

        boolean referencedAsOrigin = routeRepository.existsByOriginSpaceportId(id);
        boolean referencedAsDestination = routeRepository.existsByDestinationSpaceportId(id);
        if (referencedAsOrigin || referencedAsDestination) {
            throw new IllegalArgumentException(
                    "This spaceport is used by one or more routes and cannot be deleted."
            );
        }

        spaceportRepository.delete(spaceport);
    }
}
