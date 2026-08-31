package com.yspace.backend.repository;

import com.yspace.backend.model.Flight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FlightRepository extends JpaRepository<Flight, Integer> {

    @Query("""
        SELECT f
        FROM Flight f
        WHERE f.route.originSpaceport.id = :originId
        AND f.route.destinationSpaceport.id = :destinationId
        AND f.departureTime >= :startOfDay
        AND f.departureTime < :startOfNextDay
        AND f.status <> com.yspace.backend.model.Flight.FlightStatus.CANCELLED
        ORDER BY f.departureTime ASC
    """)
    List<Flight> searchFlights(
            @Param("originId") Integer originId,
            @Param("destinationId") Integer destinationId,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("startOfNextDay") LocalDateTime startOfNextDay
    );

    @Query("""
        SELECT COUNT(f)
        FROM Flight f
        WHERE f.spacecraft.id = :spacecraftId
        AND f.status <> com.yspace.backend.model.Flight.FlightStatus.CANCELLED
        AND f.departureTime < :arrivalTime
        AND f.arrivalTime > :departureTime
    """)
    long countOverlappingFlights(
            @Param("spacecraftId") Integer spacecraftId,
            @Param("departureTime") LocalDateTime departureTime,
            @Param("arrivalTime") LocalDateTime arrivalTime
    );

    List<Flight> findAllByOrderByDepartureTimeDesc();

    boolean existsByCode(String code);
}
