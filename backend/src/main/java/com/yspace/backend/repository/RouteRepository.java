package com.yspace.backend.repository;

import com.yspace.backend.model.Route;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RouteRepository extends JpaRepository<Route, Integer> {
    @Query("""
        SELECT r FROM Route r
        WHERE LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
        OR LOWER(r.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
        OR LOWER(r.originSpaceport.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
        OR LOWER(r.originSpaceport.code) LIKE LOWER(CONCAT('%', :keyword, '%'))
        OR LOWER(r.originSpaceport.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
        OR LOWER(r.destinationSpaceport.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
        OR LOWER(r.destinationSpaceport.code) LIKE LOWER(CONCAT('%', :keyword, '%'))
        OR LOWER(r.destinationSpaceport.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
    """)
    List<Route> fetchByKeyword(@Param("keyword") String keyword);

    boolean existsByOriginSpaceportIdAndDestinationSpaceportId(
            Integer originSpaceportId,
            Integer destinationSpaceportId
    );

    boolean existsByOriginSpaceportIdAndDestinationSpaceportIdAndIdNot(
            Integer originSpaceportId,
            Integer destinationSpaceportId,
            Integer id
    );
}
