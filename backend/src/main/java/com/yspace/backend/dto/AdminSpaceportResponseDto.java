package com.yspace.backend.dto;

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
}
