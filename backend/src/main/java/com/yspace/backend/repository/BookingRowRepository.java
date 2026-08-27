package com.yspace.backend.repository;

import com.yspace.backend.model.Booking;
import com.yspace.backend.model.BookingRow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingRowRepository extends JpaRepository<BookingRow, Integer> {

    @Query("""
        SELECT COUNT(br)
        FROM BookingRow br
        WHERE br.flight.id = :flightId
        AND br.booking.status <> :cancelledStatus
    """)
    long countBookedSeatsByFlightId(
            @Param("flightId") Integer flightId,
            @Param("cancelledStatus") Booking.BookingStatus cancelledStatus
    );
}
