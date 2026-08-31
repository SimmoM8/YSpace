package com.yspace.backend.dto.spaceport;

import com.yspace.backend.model.Spaceport;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateSpaceportRequestDto {
    @NotBlank
    private String name;

    @NotBlank
    private String code;

    @NotNull
    private Spaceport.Type type;

    private String description;

    private String imageUrl;
}
