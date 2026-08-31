package com.yspace.backend.dto.route;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminRouteResponseDto {

    private Integer id;
    private String name;

    private String originName;
    private String originCode;

    private String destinationName;
    private String destinationCode;

    private Double distance;
    private String description;
}
