package com.yspace.backend.dto.spacecraft;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSpacecraftModelNameRequestDto {

    @NotBlank
    @Size(max = 45)
    private String name;
}
