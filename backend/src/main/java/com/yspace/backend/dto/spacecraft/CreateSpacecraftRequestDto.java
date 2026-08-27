package com.yspace.backend.dto.spacecraft;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateSpacecraftRequestDto {

    @NotBlank
    private String name;

    @NotNull
    private Integer modelId;

    @NotNull
    @Positive
    private Integer seatCapacity;
}
