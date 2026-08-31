package com.yspace.backend.dto.flight;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminFlightResponseDto {
    private Integer id;
    private String code;

    private String status;
    private Boolean delayed;

    private String routeName;

    private String originName;
    private String originCode;

    private String destinationName;
    private String destinationCode;

    private String spacecraftName;
    private String spacecraftModel;

    private Integer seatCapacity;
    private Long bookedSeats;
    private Long remainingSeats;

    private BigDecimal price;

    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
}
