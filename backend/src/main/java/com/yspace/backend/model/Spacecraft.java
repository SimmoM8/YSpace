package com.yspace.backend.model;

import jakarta.persistence.Column;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class Spacecraft {

    private Long id;

    private String name;

    private SpacecraftModel model;

    private SpacecraftStatus status = SpacecraftStatus.PARKING;

    private enum SpacecraftStatus {
        UNDER_MAINTENANCE,
        RETIRED,
        LAUNCHING,
        EXITING,
        ORBITING,
        CRUISING,
        ENTERING,
        LANDING,
        PARKING,
        PARKED,
    }

    @Column(nullable = false)
    private boolean operational = true;

    private List<SeatNumber> seats = new ArrayList<SeatNumber>();

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
