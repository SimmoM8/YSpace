package com.yspace.backend.dto.flight;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FlightSearchResponseDto {

    private Integer id;
    private String code;

    private String originName;
    private String originCode;

    private String destinationName;
    private String destinationCode;

    private String spacecraft;

    private BigDecimal price;

    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
}
