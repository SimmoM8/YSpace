package com.yspace.backend.model;

import jakarta.persistence.Column;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

public class Spacecraft {

    private Long id;

    private enum SpacecraftType {
        Shuttle,
        Rocket,
        SpacePlane
    }

    private enum SpacecraftStatus {
        Operational,
        UnderMaintenance,
        Retired
    }

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
