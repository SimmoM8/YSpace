package com.yspace.backend.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminBookingResponseDto {
    private Integer id;

    private String userName;
    private String userEmail;

    private String status;

    private BigDecimal totalPrice;

    private LocalDateTime departureTime;
    private LocalDateTime createdAt;

    private List<AdminBookingRowResponseDto> rows;
}
