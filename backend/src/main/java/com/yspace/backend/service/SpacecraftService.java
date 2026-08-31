package com.yspace.backend.service;

import com.yspace.backend.dto.admin.AdminSpacecraftModelResponseDto;
import com.yspace.backend.dto.admin.AdminSpacecraftResponseDto;
import com.yspace.backend.dto.spacecraft.CreateSpacecraftRequestDto;
import com.yspace.backend.model.Spacecraft;
import com.yspace.backend.model.SpacecraftModel;
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

    @Transactional(readOnly = true)
    public List<AdminSpacecraftResponseDto> getAdminSpacecraft() {
        return spacecraftRepository.findAll()
                .stream()
                .map(this::toAdminDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AdminSpacecraftModelResponseDto> getAdminSpacecraftModels() {
        return spacecraftModelRepository.findAll()
                .stream()
                .map(model -> new AdminSpacecraftModelResponseDto(
                        model.getId(),
                        model.getName(),
                        model.getManufacturer(),
                        model.getMaxRange(),
                        model.getVelocity()
                ))
                .toList();
    }

    @Transactional
    public AdminSpacecraftResponseDto createSpacecraft(
            CreateSpacecraftRequestDto request
    ) {
        SpacecraftModel model = spacecraftModelRepository
                .findById(request.getModelId())
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Spacecraft model not found with id: "
                                        + request.getModelId()
                        )
                );

        Spacecraft spacecraft = Spacecraft.builder()
                .name(request.getName().trim())
                .model(model)
                .seat_capacity(request.getSeatCapacity())
                .status(request.getStatus())
                .operational(request.getOperational())
                .build();

        Spacecraft savedSpacecraft =
                spacecraftRepository.save(spacecraft);

        return toAdminDto(savedSpacecraft);
    }

    private AdminSpacecraftResponseDto toAdminDto(
            Spacecraft spacecraft
    ) {
        return new AdminSpacecraftResponseDto(
                spacecraft.getId(),
                spacecraft.getName(),
                spacecraft.getModel().getName(),
                spacecraft.getModel().getManufacturer(),
                spacecraft.getSeat_capacity(),
                spacecraft.getStatus().name(),
                spacecraft.getOperational()
        );
    }
}
