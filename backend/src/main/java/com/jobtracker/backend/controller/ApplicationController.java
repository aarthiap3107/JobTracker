package com.jobtracker.backend.controller;

import com.jobtracker.backend.model.Application;
import com.jobtracker.backend.service.ApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "http://localhost:3000")
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;

    private String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder
            .getContext()
            .getAuthentication();
        return auth.getName();
    }

    @GetMapping
    public ResponseEntity<List<Application>> getAll() {
        String email = getCurrentUserEmail();
        List<Application> applications = 
            applicationService.getAllApplications(email);
        return ResponseEntity.ok(applications);
    }

    @PostMapping
    public ResponseEntity<Application> add(
            @RequestBody Application application) {
        String email = getCurrentUserEmail();
        Application saved = 
            applicationService
            .addApplication(application, email);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Application> update(
            @PathVariable Long id,
            @RequestBody Application application) {
        String email = getCurrentUserEmail();
        Application updated = 
            applicationService
            .updateApplication(id, application, email);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(
            @PathVariable Long id) {
        applicationService.deleteApplication(id);
        return ResponseEntity.ok(
            "Application deleted successfully!");
    }

    @GetMapping("/count")
    public ResponseEntity<Long> count() {
        String email = getCurrentUserEmail();
        Long count = 
            applicationService.countApplications(email);
        return ResponseEntity.ok(count);
    }
}