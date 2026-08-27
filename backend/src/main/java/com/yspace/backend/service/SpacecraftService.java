package com.yspace.backend.service;

import com.yspace.backend.dto.spacecraft.CreateSpacecraftRequestDto;
import com.yspace.backend.dto.spacecraft.FetchSpacecraftModelResponseDto;
import com.yspace.backend.dto.spacecraft.FetchSpacecraftResponseDto;
import com.yspace.backend.exceptions.SpacecraftNotFoundException;
import com.yspace.backend.mapper.SpacecraftMapper;
import com.yspace.backend.model.Spacecraft;
import com.yspace.backend.model.SpacecraftModel;
import com.yspace.backend.repository.FlightRepository;
import com.yspace.backend.repository.SpacecraftModelRepository;
import com.yspace.backend.repository.SpacecraftRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SpacecraftService {

    private final SpacecraftRepository spacecraftRepository;
    private final SpacecraftModelRepository spacecraftModelRepository;
    private final FlightRepository flightRepository;
    private final SpacecraftMapper spacecraftMapper;

    @Transactional(readOnly = true)
    public List<FetchSpacecraftResponseDto> getSpacecrafts() {
        return spacecraftRepository.findAll()
                .stream()
                .map(spacecraftMapper::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<FetchSpacecraftModelResponseDto> getSpacecraftModels() {
        return spacecraftModelRepository.findAll()
                .stream()
                .map(model -> new FetchSpacecraftModelResponseDto(
                        model.getId(),
                        model.getName(),
                        model.getManufacturer(),
                        model.getMaxRange(),
                        model.getVelocity(),
                        model.getLifespan()
                ))
                .toList();
    }

    @Transactional
    public FetchSpacecraftModelResponseDto updateSpacecraftModelName(Integer id, String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Spacecraft model name cannot be empty");
        }

        SpacecraftModel model = spacecraftModelRepository.findById(id)
                .orElseThrow(() -> new SpacecraftNotFoundException(
                        "Spacecraft model not found with id: " + id
                ));

        model.setName(name);
        SpacecraftModel saved = spacecraftModelRepository.save(model);

        return new FetchSpacecraftModelResponseDto(
                saved.getId(),
                saved.getName(),
                saved.getManufacturer(),
                saved.getMaxRange(),
                saved.getVelocity(),
                saved.getLifespan()
        );
    }

    @Transactional
    public FetchSpacecraftResponseDto createSpacecraft(CreateSpacecraftRequestDto request) {
        SpacecraftModel model = spacecraftModelRepository.findById(request.getModelId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Spacecraft model not found with id: " + request.getModelId()
                        )
                );

        Spacecraft spacecraft = Spacecraft.builder()
                .name(request.getName())
                .model(model)
                .seat_capacity(request.getSeatCapacity())
                .status(Spacecraft.SpacecraftStatus.UNDER_MAINTENANCE)
                .operational(true)
                .build();

        Spacecraft saved = spacecraftRepository.save(spacecraft);

        return spacecraftMapper.toDto(saved);
    }

    @Transactional
    public FetchSpacecraftResponseDto retireSpacecraft(Integer id) {
        Spacecraft spacecraft = spacecraftRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Spacecraft not found with id: " + id
                        )
                );

        spacecraft.setStatus(Spacecraft.SpacecraftStatus.RETIRED);
        spacecraft.setOperational(false);

        Spacecraft saved = spacecraftRepository.save(spacecraft);

        return spacecraftMapper.toDto(saved);
    }

    @Transactional
    public void deleteSpacecraft(Integer id) {
        Spacecraft spacecraft = spacecraftRepository.findById(id)
                .orElseThrow(() -> new SpacecraftNotFoundException(id));

        if (flightRepository.existsBySpacecraftId(id)) {
            throw new IllegalArgumentException(
                    "This spacecraft has flights scheduled and cannot be deleted. Remove or cancel its flights first."
            );
        }

        spacecraftRepository.delete(spacecraft);
    }

    @Transactional
    public void deleteSpacecraftModel(Integer id) {
        SpacecraftModel model = spacecraftModelRepository.findById(id)
                .orElseThrow(() -> new SpacecraftNotFoundException(
                        "Spacecraft model not found with id: " + id
                ));

        if (spacecraftRepository.existsByModelId(id)) {
            throw new IllegalArgumentException(
                    "This model is still used by one or more spacecraft and cannot be deleted. Delete those spacecraft first."
            );
        }

        spacecraftModelRepository.delete(model);
    }
}
