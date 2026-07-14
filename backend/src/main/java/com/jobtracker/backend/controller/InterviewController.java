package com.jobtracker.backend.controller;

import com.jobtracker.backend.model.Interview;
import com.jobtracker.backend.service.InterviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications/{appId}/interviews")
@CrossOrigin("http://localhost:3000")
public class InterviewController {

    @Autowired
    private InterviewService interviewService;

    private String email() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @GetMapping
    public ResponseEntity<List<Interview>> getAll(@PathVariable Long appId) {
        return ResponseEntity.ok(interviewService.getAll(appId, email()));
    }

    @PostMapping
    public ResponseEntity<Interview> create(@PathVariable Long appId, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(interviewService.create(appId, email(), body));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Interview> update(@PathVariable Long appId, @PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(interviewService.update(appId, id, email(), body));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long appId, @PathVariable Long id) {
        interviewService.delete(appId, id, email());
        return ResponseEntity.noContent().build();
    }
}
