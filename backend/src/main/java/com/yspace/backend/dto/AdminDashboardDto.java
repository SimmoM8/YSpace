package com.yspace.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardDto {

    private long scheduledFlights;
    private long openBookings;
    private long totalPassengers;
    private long activeSpaceports;
    private long activeRoutes;
    private long activeSpacecraft;
    private List<AdminFlightSummaryDto> upcomingFlights;
    private List<AdminBookingSummaryDto> recentBookings;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminFlightSummaryDto {
        private Integer id;
        private String code;
        private String originCode;
        private String destinationCode;
        private String originName;
        private String destinationName;
        private String departureTime;
        private String spacecraftName;
        private long bookedSeats;
        private long seatCapacity;
        private String status;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminBookingSummaryDto {
        private Integer id;
        private String userName;
        private String flightCode;
        private String originCode;
        private String destinationCode;
        private String createdAt;
        private String status;
        private java.math.BigDecimal totalPrice;
    }
}
