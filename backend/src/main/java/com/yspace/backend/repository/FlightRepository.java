package com.yspace.backend.repository;

import com.yspace.backend.model.Flight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FlightRepository extends JpaRepository<Flight, Integer> {

    @Query("SELECT f FROM Flight f " +
            "WHERE (:departureId IS NULL OR f.route.originSpaceport.id = :departureId) " +
            "AND (:destinationId IS NULL OR f.route.destinationSpaceport.id = :destinationId)")
    List<Flight> searchFlights(@Param("departureId") Integer originId,
                               @Param("destinationId") Integer destinationId);
}
