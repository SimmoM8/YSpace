package com.yspace.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class Phone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private User userId;

    @Column(nullable = false)
    private int CountryCode;

    @Column(nullable = false)
    private String Number;

    @Column(nullable = false, columnDefinition = "DATE DEFAULT CURRENT_DATE")
    private LocalDate createdAt;

    @Column(nullable = false, columnDefinition = "DATE DEFAULT CURRENT_DATE ON UPDATE CURRENT_DATE")
    private LocalDate updatedAt;

}
