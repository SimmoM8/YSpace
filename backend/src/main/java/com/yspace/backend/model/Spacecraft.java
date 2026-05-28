package com.yspace.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "spacecrafts")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Spacecraft {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(length = 45)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "model_id", nullable = false)
    private SpacecraftModel model;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 45)
    @Builder.Default
    private SpacecraftStatus status = SpacecraftStatus.UNDER_MAINTENANCE;

    @Column(name = "is_operational", nullable = false)
    @Builder.Default
    private Boolean operational = true;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum SpacecraftStatus {
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
        BOARDING
    }
}
