package com.yspace.backend.repository;

import com.yspace.backend.model.Spaceport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpaceportRepository extends JpaRepository<Spaceport, Integer> {
    @Query("""
        SELECT s FROM Spaceport s
        WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
        OR LOWER(s.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
        OR LOWER(s.code) LIKE LOWER(CONCAT('%', :keyword, '%'))
    """)
    List<Spaceport> findAllByKeyword(@Param("keyword") String keyword);

    boolean existsByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCaseAndIdNot(String code, Integer id);
}
