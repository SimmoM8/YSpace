package com.yspace.backend.dto.flight;

import com.yspace.backend.model.Flight;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateFlightRequestDto {
    @NotBlank
    private String code;

    @NotNull
    private Integer routeId;

    @NotNull
    private Integer spacecraftId;

    @NotNull
    private Flight.FlightStatus status;

    @NotNull
    private LocalDateTime departureTime;

    @NotNull
    private LocalDateTime arrivalTime;

    @NotNull
    @PositiveOrZero
    private BigDecimal price;
}
