package com.yspace.backend.dto;

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
    private int bookingCount;
    private LocalDateTime createdAt;
}
