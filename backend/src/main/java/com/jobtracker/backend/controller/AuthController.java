package com.jobtracker.backend.controller;

import com.jobtracker.backend.model.User;
import com.jobtracker.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(
            @Valid @RequestBody User user) {
        Map<String, String> response = 
            authService.register(user);

        if (response.containsKey("error")) {
            return ResponseEntity
                .badRequest()
                .body(response);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(
            @RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        Map<String, String> response =
            authService.login(email, password);

        if (response.containsKey("error")) {
            return ResponseEntity
                .badRequest()
                .body(response);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(
            @RequestBody Map<String, String> request) {
        String email = request.get("email");
        Map<String, String> response = authService.forgotPassword(email);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(
            @RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");
        Map<String, String> response = authService.resetPassword(token, newPassword);

        if (response.containsKey("error")) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }
}
