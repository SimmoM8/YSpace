package com.yspace.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RouteAdminResponseDto {

    private Integer id;

    private String name;

    private String originSpaceportName;

    private String originSpaceportCode;

    private String destinationSpaceportName;

    private String destinationSpaceportCode;

    private Double distance;

    private String description;
}
