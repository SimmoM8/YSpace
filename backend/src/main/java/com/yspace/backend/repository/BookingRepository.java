package com.yspace.backend.repository;

import com.yspace.backend.model.Booking;
import com.yspace.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Integer> {

    List<Booking> findAllByUserOrderByCreatedAtDesc(User user);

    Optional<Booking> findByIdAndUser(
            Integer id,
            User user
    );
}
