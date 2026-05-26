package com.yspace.backend.model;

import jakarta.persistence.Column;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

public class Flight {

    private Long id;

    private String flightNumber;

    private Long routeId;

    @Column(nullable = false)
    private Long spacecraftId;

    @Column(nullable = false)
    private LocalDateTime departureTime;

    @Column(nullable = false)
    private LocalDateTime arrivalTime;

    private enum FlightStatus {
        Scheduled,
        Launching,
        Exiting,
        Orbiting,
        Cruising,
        Entering,
        Landing,
        Parking,
        Cancelled
    }

    @Column(nullable = false)
    private FlightStatus status;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
