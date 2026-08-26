package com.yspace.backend.mapper;

import com.yspace.backend.dto.spaceport.FetchSpaceportResponseDto;
import com.yspace.backend.model.Spaceport;
import org.springframework.stereotype.Component;

@Component
public class SpaceportMapper {

    public FetchSpaceportResponseDto toDto(Spaceport spaceport) {
        return new FetchSpaceportResponseDto(
                spaceport.getId(),
                spaceport.getCode(),
                spaceport.getName()
        );
    }
}
