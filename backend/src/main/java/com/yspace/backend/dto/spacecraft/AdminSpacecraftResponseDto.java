package com.yspace.backend.dto.spacecraft;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminSpacecraftResponseDto {

    private Integer id;
    private String name;
    private String model;
    private String manufacturer;
    private Integer seatCapacity;
}
