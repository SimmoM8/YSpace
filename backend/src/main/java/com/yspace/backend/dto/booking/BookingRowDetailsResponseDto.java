package com.yspace.backend.dto.booking;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingRowDetailsResponseDto {
    private Integer bookingRowId;
    private BigDecimal bookedPrice;

    private Integer flightId;
    private String flightCode;
    private String flightStatus;
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

    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
}
