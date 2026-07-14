package com.jobtracker.backend.repository;

import com.jobtracker.backend.model.Application;
import com.jobtracker.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ApplicationRepository
        extends JpaRepository<Application, Long> {

    List<Application> findByUser(User user);

    List<Application> findByUserOrderByCreatedAtDesc(User user);

    Long countByUser(User user);
}