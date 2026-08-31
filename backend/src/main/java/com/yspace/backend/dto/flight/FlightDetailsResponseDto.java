package com.yspace.backend.dto.flight;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FlightDetailsResponseDto {
    private Integer id;
    private String code;

    private String status;
    private Boolean delayed;

    private String routeName;
    private String routeDescription;
    private Double distance;

    private String originName;
    private String originCode;
    private String originType;
    private String originDescription;

    private String destinationName;
    private String destinationCode;
    private String destinationType;
    private String destinationDescription;

    private String spacecraftName;
    private String spacecraftModel;
    private String spacecraftManufacturer;

    private BigDecimal price;

    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
}
