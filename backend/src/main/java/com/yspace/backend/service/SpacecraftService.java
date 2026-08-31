package com.yspace.backend.service;

import com.yspace.backend.dto.admin.AdminSpacecraftResponseDto;
import com.yspace.backend.repository.SpacecraftRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SpacecraftService {

    private final SpacecraftRepository spacecraftRepository;

    @Transactional(readOnly = true)
    public List<AdminSpacecraftResponseDto> getAdminSpacecraft() {
        return spacecraftRepository.findAll()
                .stream()
                .map(spacecraft -> new AdminSpacecraftResponseDto(
                        spacecraft.getId(),
                        spacecraft.getName(),
                        spacecraft.getModel().getName(),
                        spacecraft.getModel().getManufacturer(),
                        spacecraft.getSeat_capacity(),
                        spacecraft.getStatus().name(),
                        spacecraft.getOperational()
                ))
                .toList();
    }
}
