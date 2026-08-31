package com.yspace.backend.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserResponseDto {
    private Integer id;

    private String firstName;
    private String lastName;
    private String email;

    private String role;

    private long bookingCount;
    private long openBookingCount;

    private LocalDateTime createdAt;
}
