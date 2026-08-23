package com.yspace.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponseDto {

    private Integer bookingId;
    private String status;

    private Integer flightId;
    private String flightCode;

    private String originName;
    private String originCode;

    private String destinationName;
    private String destinationCode;

    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;

    private BigDecimal totalPrice;
}
