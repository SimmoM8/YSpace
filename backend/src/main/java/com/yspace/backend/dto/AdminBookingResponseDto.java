package com.yspace.backend.dto;

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
    private BigDecimal totalPrice;
    private String status;
    private LocalDateTime createdAt;
    private List<AdminBookingRowDto> rows;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminBookingRowDto {
        private Integer id;
        private String flightCode;
        private String originCode;
        private String destinationCode;
        private BigDecimal price;
    }
}
