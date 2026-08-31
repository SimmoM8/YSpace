package com.yspace.backend.dto.booking;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingDetailsResponseDto {
    private Integer bookingId;
    private String status;

    private BigDecimal totalPrice;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private List<BookingRowSummaryResponseDto> bookingRows;
}
