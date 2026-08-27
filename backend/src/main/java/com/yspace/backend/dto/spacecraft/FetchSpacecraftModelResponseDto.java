package com.yspace.backend.dto.spacecraft;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FetchSpacecraftModelResponseDto {
    private Integer modelId;
    private String name;
    private String manufacturer;
    private Double maxRange;
    private Double velocity;
    private Integer lifespan;
}
