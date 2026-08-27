package com.yspace.backend.dto.booking;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminBookingSummaryResponseDto {
    private Integer bookingId;
    private String status;
    private String userEmail;
    private String userFirstName;
    private String userLastName;
    private String routeName;
    private LocalDateTime departureTime;
    private BigDecimal totalPrice;
    private LocalDateTime createdAt;
}
