package com.yspace.backend.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminSpaceportResponseDto {

    private Integer id;

    private String name;
    private String code;
    private String type;

    private String description;
    private String imageUrl;
}
