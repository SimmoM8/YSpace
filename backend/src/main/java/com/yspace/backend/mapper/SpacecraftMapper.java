package com.yspace.backend.mapper;

import com.yspace.backend.dto.spacecraft.FetchSpacecraftResponseDto;
import com.yspace.backend.model.Spacecraft;
import org.springframework.stereotype.Component;

@Component
public class SpacecraftMapper {

    public FetchSpacecraftResponseDto toDto(Spacecraft spacecraft) {
        return new FetchSpacecraftResponseDto(
                spacecraft.getId(),
                spacecraft.getName(),
                spacecraft.getStatus().name(),
                spacecraft.getSeat_capacity(),
                spacecraft.getOperational(),
                spacecraft.getModel() != null ? spacecraft.getModel().getName() : null,
                spacecraft.getModel() != null ? spacecraft.getModel().getManufacturer() : null
        );
    }
}
