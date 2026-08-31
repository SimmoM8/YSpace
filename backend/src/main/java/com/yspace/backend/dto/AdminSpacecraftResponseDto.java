package com.yspace.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminSpacecraftResponseDto {

    private Integer id;
    private String name;
    private String modelName;
    private String modelManufacturer;
    private Integer seatCapacity;
    private String status;
    private Boolean operational;
}
