package com.yspace.backend.dto.spaceport;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FetchSpaceportResponseDto {

    private Integer spaceportId;

    private String spaceportCode;

    private String spaceportName;

    private String spaceportType;

    private String spaceportDescription;

    private String spaceportImageUrl;
}
