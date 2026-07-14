package com.jobtracker.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        String resetLink = "http://localhost:3000/reset-password?token=" + resetToken;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("JobTracker — Reset Your Password");
        message.setText(
            "Hi,\n\n" +
            "You requested a password reset for your JobTracker account.\n\n" +
            "Click the link below to set a new password (valid for 15 minutes):\n\n" +
            resetLink + "\n\n" +
            "If you did not request this, ignore this email.\n\n" +
            "— JobTracker Team"
        );

        mailSender.send(message);
    }
}
