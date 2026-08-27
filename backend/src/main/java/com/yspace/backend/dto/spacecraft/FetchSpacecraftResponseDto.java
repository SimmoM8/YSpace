package com.yspace.backend.dto.spacecraft;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FetchSpacecraftResponseDto {
    private Integer spacecraftId;
    private String name;
    private String status;
    private Integer seatCapacity;
    private Boolean operational;
    private String modelName;
    private String manufacturer;
}
