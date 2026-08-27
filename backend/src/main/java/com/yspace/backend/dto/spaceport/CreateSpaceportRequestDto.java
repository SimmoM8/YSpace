package com.yspace.backend.dto.spaceport;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateSpaceportRequestDto {

    @NotBlank
    @Size(max = 45)
    private String name;

    @NotBlank
    @Size(max = 10)
    private String code;

    @NotNull
    private String type;

    private String description;

    private String imageUrl;
}
