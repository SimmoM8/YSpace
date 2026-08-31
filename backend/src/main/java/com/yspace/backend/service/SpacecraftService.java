package com.yspace.backend.service;

import com.yspace.backend.dto.spacecraft.AdminSpacecraftResponseDto;
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
    public List<AdminSpacecraftResponseDto> getAdminSpacecraftOptions() {
        return spacecraftRepository.findAll()
                .stream()
                .filter(spacecraft -> Boolean.TRUE.equals(spacecraft.getOperational()))
                .map(spacecraft -> new AdminSpacecraftResponseDto(
                        spacecraft.getId(),
                        spacecraft.getName(),
                        spacecraft.getModel().getName(),
                        spacecraft.getModel().getManufacturer(),
                        spacecraft.getSeat_capacity()
                ))
                .toList();
    }
}
