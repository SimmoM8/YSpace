package com.yspace.backend.dto.route;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FetchRouteResponseDto {
    @NotBlank
    private String routeName;

    @NotBlank
    private String originSpaceportName;

    @NotBlank
    private String destinationSpaceportName;

    private Double distance;

    private String description;
}
