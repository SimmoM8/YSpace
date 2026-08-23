package com.yspace.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.math.BigDecimal;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class FlightSearchResponseDto {

    private Integer id;

    private String code;

    private String route;

    private String originName;
    private String originCode;

    private String destinationName;
    private String destinationCode;

    private String spacecraft;

    private BigDecimal price;

    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
}
