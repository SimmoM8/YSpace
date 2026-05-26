package com.yspace.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "spaceports")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class Spaceport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Location location;

    @Column(length = 1000)
    private String description;

    private String imageUrl;

    private enum Location {
        PLANET,
        MOON,
        STATION,
    }

}