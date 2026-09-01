package com.yspace.backend.dto.flight;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminFlightDetailsResponseDto {
    private Integer id;
    private String code;

    private Integer routeId;
    private String routeName;
    private String routeDescription;
    private Double distance;

    private String originName;
    private String originCode;
    private String destinationName;
    private String destinationCode;

    private Integer spacecraftId;
    private String spacecraftName;
    private String spacecraftModel;
    private String spacecraftManufacturer;

    private Integer seatCapacity;
    private Long bookedSeats;
    private Long remainingSeats;

    private String status;
    private Boolean delayed;

    private BigDecimal price;
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;

}
