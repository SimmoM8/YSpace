package com.yspace.backend.repository;

import com.yspace.backend.model.Spaceport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SpaceportRepository extends JpaRepository<Spaceport, Integer> {
    Optional<Spaceport> findByCode(String code);
}
