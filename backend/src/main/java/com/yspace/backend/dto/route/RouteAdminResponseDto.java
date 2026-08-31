package com.yspace.backend.dto.route;

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

    private String destinationSpaceportName;

    private Double distance;

    private String description;
}
