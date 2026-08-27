package com.yspace.backend.repository;

import com.yspace.backend.model.Spacecraft;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpacecraftRepository extends JpaRepository<Spacecraft, Integer> {

    boolean existsByModelId(Integer modelId);
}
