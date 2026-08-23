package com.yspace.backend.dto.booking;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingRowSummaryResponseDto {

    private Integer bookingRowId;

    private Integer flightId;
    private String flightCode;

    private String routeName;

    private String originName;
    private String originCode;

    private String destinationName;
    private String destinationCode;

    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;

    private BigDecimal price;
}
