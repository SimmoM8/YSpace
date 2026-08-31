package com.yspace.backend.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminSpacecraftModelResponseDto {
    private Integer id;
    private String name;
    private String manufacturer;

    private Double maxRange;
    private Double velocity;
}
