package com.jobtracker.backend.service;

import com.jobtracker.backend.model.Application;
import com.jobtracker.backend.model.User;
import com.jobtracker.backend.repository.ApplicationRepository;
import com.jobtracker.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ApplicationService {

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Application> getAllApplications(String email) {
        User user = userRepository
            .findByEmail(email)
            .orElseThrow();
        return applicationRepository
            .findByUserOrderByCreatedAtDesc(user);
    }

    public Application addApplication(
            Application application, String email) {
        User user = userRepository
            .findByEmail(email)
            .orElseThrow();
        application.setUser(user);
        return applicationRepository.save(application);
    }

    public Application updateApplication(
            Long id, Application updated, String email) {
        Application existing = applicationRepository
            .findById(id)
            .orElseThrow();

        existing.setCompanyName(updated.getCompanyName());
        existing.setJobTitle(updated.getJobTitle());
        existing.setStatus(updated.getStatus());
        existing.setAppliedDate(updated.getAppliedDate());
        existing.setDeadline(updated.getDeadline());
        existing.setJobUrl(updated.getJobUrl());
        existing.setSalary(updated.getSalary());
        existing.setContactPerson(updated.getContactPerson());
        existing.setNotes(updated.getNotes());

        return applicationRepository.save(existing);
    }

    public void deleteApplication(Long id) {
        applicationRepository.deleteById(id);
    }

    public Long countApplications(String email) {
        User user = userRepository
            .findByEmail(email)
            .orElseThrow();
        return applicationRepository.countByUser(user);
    }
}