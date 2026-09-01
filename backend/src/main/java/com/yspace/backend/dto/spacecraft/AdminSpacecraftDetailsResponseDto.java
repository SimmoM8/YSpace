package com.yspace.backend.dto.spacecraft;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminSpacecraftDetailsResponseDto {
    private Integer id;
    private String name;

    private Integer modelId;
    private String model;
    private String manufacturer;

    private Integer seatCapacity;
    private String status;
    private Boolean operational;
}
