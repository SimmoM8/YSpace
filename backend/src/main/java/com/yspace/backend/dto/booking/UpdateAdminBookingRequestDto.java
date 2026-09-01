package com.yspace.backend.dto.booking;

import com.yspace.backend.model.Booking;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateAdminBookingRequestDto {
    @NotNull
    private Booking.BookingStatus status;
}
