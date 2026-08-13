package com.yspace.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "spacecraft_models")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpacecraftModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(length = 45)
    private String name;

    @Column(length = 45)
    private String manufacturer;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "max_range", nullable = false)
    private Double maxRange;

    @Column(nullable = false)
    private Double velocity;

    @Column(nullable = false)
    private Integer lifespan;
}
