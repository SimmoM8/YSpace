package com.yspace.backend.dto.route;

import com.yspace.backend.dto.admin.AdminSpaceportOptionDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminRouteDetailsResponseDto {
    private Integer id;
    private String name;

    private Integer originSpaceportId;
    private String originName;
    private String originCode;
    private AdminSpaceportOptionDto originSpaceport;

    private Integer destinationSpaceportId;
    private String destinationName;
    private String destinationCode;
    private AdminSpaceportOptionDto destinationSpaceport;

    private Double distance;
    private String description;
}
