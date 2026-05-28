package com.yspace.backend.repository;

import com.yspace.backend.model.SpacecraftModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpacecraftModelRepository extends JpaRepository<SpacecraftModel, Integer> {
}
