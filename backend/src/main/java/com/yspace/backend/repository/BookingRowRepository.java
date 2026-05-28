package com.yspace.backend.repository;

import com.yspace.backend.model.BookingRow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingRowRepository extends JpaRepository<BookingRow, Integer> {
}
