package com.yspace.backend.dto.route;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateRouteRequestDto {

    @NotBlank
    private String name;

    @NotNull
    private Integer originSpaceportId;

    @NotNull
    private Integer destinationSpaceportId;

    @Positive
    private Double distance;

    private String description;
}
