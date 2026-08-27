package com.yspace.backend.dto.spaceport;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSpaceportNameRequestDto {

    @NotBlank
    @Size(max = 45)
    private String name;
}
