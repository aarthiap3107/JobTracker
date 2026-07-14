package com.jobtracker.backend.service;

import com.jobtracker.backend.model.PasswordResetToken;
import com.jobtracker.backend.model.User;
import com.jobtracker.backend.repository.PasswordResetTokenRepository;
import com.jobtracker.backend.repository.UserRepository;
import com.jobtracker.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private EmailService emailService;

    public Map<String, String> register(User user) {
        Map<String, String> response = new HashMap<>();

        if (userRepository.existsByEmail(user.getEmail())) {
            response.put("error", "Email already exists!");
            return response;
        }

        user.setPassword(
            passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail());
        response.put("token", token);
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        return response;
    }

    public Map<String, String> login(
            String email, String password) {
        Map<String, String> response = new HashMap<>();

        User user = userRepository
            .findByEmail(email)
            .orElse(null);

        if (user == null) {
            response.put("error", "User not found!");
            return response;
        }

        if (!passwordEncoder.matches(
                password, user.getPassword())) {
            response.put("error", "Wrong password!");
            return response;
        }

        String token = jwtUtil.generateToken(email);
        response.put("token", token);
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        return response;
    }

    public Map<String, String> forgotPassword(String email) {
        Map<String, String> response = new HashMap<>();

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            // Don't reveal whether the email exists
            response.put("message", "If that email is registered, a reset link has been sent.");
            return response;
        }

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUser(user);
        resetToken.setExpiresAt(LocalDateTime.now().plusMinutes(15));
        tokenRepository.save(resetToken);

        try {
            emailService.sendPasswordResetEmail(email, token);
        } catch (Exception e) {
            response.put("error", "Failed to send email: " + e.getMessage());
            return response;
        }
        response.put("message", "If that email is registered, a reset link has been sent.");
        return response;
    }

    public Map<String, String> resetPassword(String token, String newPassword) {
        Map<String, String> response = new HashMap<>();

        PasswordResetToken resetToken = tokenRepository.findByToken(token).orElse(null);

        if (resetToken == null || resetToken.isUsed()) {
            response.put("error", "Invalid or already used reset link.");
            return response;
        }
        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            response.put("error", "Reset link has expired. Please request a new one.");
            return response;
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsed(true);
        tokenRepository.save(resetToken);

        response.put("message", "Password reset successfully. You can now log in.");
        return response;
    }
}