package com.jobtracker.backend.controller;

import com.jobtracker.backend.service.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin("http://localhost:3000")
public class AiController {

    @Autowired
    private AiService aiService;

    @PostMapping("/analyze-resume")
    public ResponseEntity<?> analyzeResume(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Please upload a PDF file."));
            }
            String name = file.getOriginalFilename();
            if (name == null || !name.toLowerCase().endsWith(".pdf")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Only PDF files are supported."));
            }
            return ResponseEntity.ok(aiService.analyzeResume(file.getBytes()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Analysis failed: " + e.getMessage()));
        }
    }

    @PostMapping("/cover-letter")
    public ResponseEntity<?> generateCoverLetter(@RequestBody Map<String, String> body) {
        try {
            String company = body.getOrDefault("companyName", "").trim();
            String title   = body.getOrDefault("jobTitle", "").trim();
            String desc    = body.getOrDefault("jobDescription", "");
            if (company.isBlank() || title.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Company name and job title are required."));
            }
            String letter = aiService.generateCoverLetter(company, title, desc);
            return ResponseEntity.ok(Map.of("letter", letter));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Generation failed: " + e.getMessage()));
        }
    }
}
