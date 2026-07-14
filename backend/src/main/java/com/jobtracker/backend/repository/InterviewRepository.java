package com.jobtracker.backend.repository;

import com.jobtracker.backend.model.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InterviewRepository extends JpaRepository<Interview, Long> {
    List<Interview> findByApplicationId(Long applicationId);
    long countByApplicationId(Long applicationId);
}
