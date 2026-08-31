package com.yspace.backend.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminBookingRowResponseDto {

    private Integer id;

    private Integer flightId;
    private String flightCode;

    private String routeName;

    private String originCode;
    private String destinationCode;
}
