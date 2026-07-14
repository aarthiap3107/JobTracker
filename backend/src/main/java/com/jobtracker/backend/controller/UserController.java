package com.jobtracker.backend.controller;

import com.jobtracker.backend.model.User;
import com.jobtracker.backend.repository.ApplicationRepository;
import com.jobtracker.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin("http://localhost:3000")
public class UserController {

    @Autowired private UserRepository userRepository;
    @Autowired private ApplicationRepository applicationRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    private String email() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        User user = userRepository.findByEmail(email())
            .orElseThrow(() -> new RuntimeException("User not found"));
        long total = applicationRepository.countByUser(user);
        return ResponseEntity.ok(Map.of(
            "name",              user.getName(),
            "email",             user.getEmail(),
            "createdAt",         user.getCreatedAt().toString(),
            "totalApplications", total
        ));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> body) {
        String name = body.getOrDefault("name", "").trim();
        if (name.isBlank())
            return ResponseEntity.badRequest().body(Map.of("error", "Name is required."));
        User user = userRepository.findByEmail(email())
            .orElseThrow(() -> new RuntimeException("User not found"));
        user.setName(name);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("name", user.getName(), "email", user.getEmail()));
    }

    @PutMapping("/password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> body) {
        String current = body.getOrDefault("currentPassword", "");
        String next    = body.getOrDefault("newPassword", "");
        if (current.isBlank() || next.length() < 6)
            return ResponseEntity.badRequest().body(Map.of("error", "Current password and new password (min 6 chars) are required."));
        User user = userRepository.findByEmail(email())
            .orElseThrow(() -> new RuntimeException("User not found"));
        if (!passwordEncoder.matches(current, user.getPassword()))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Current password is incorrect."));
        user.setPassword(passwordEncoder.encode(next));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Password updated successfully."));
    }
}
