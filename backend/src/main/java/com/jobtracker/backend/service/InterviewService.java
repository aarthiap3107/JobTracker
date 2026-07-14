package com.jobtracker.backend.service;

import com.jobtracker.backend.model.Application;
import com.jobtracker.backend.model.Interview;
import com.jobtracker.backend.model.User;
import com.jobtracker.backend.repository.ApplicationRepository;
import com.jobtracker.backend.repository.InterviewRepository;
import com.jobtracker.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class InterviewService {

    @Autowired private InterviewRepository interviewRepository;
    @Autowired private ApplicationRepository applicationRepository;
    @Autowired private UserRepository userRepository;

    public List<Interview> getAll(Long appId, String email) {
        verifyOwnership(appId, email);
        return interviewRepository.findByApplicationId(appId);
    }

    public Interview create(Long appId, String email, Map<String, String> data) {
        Application app = verifyOwnership(appId, email);
        Interview iv = new Interview();
        iv.setApplication(app);
        map(iv, data);
        return interviewRepository.save(iv);
    }

    public Interview update(Long appId, Long ivId, String email, Map<String, String> data) {
        verifyOwnership(appId, email);
        Interview iv = interviewRepository.findById(ivId)
            .orElseThrow(() -> new RuntimeException("Interview not found"));
        map(iv, data);
        return interviewRepository.save(iv);
    }

    public void delete(Long appId, Long ivId, String email) {
        verifyOwnership(appId, email);
        interviewRepository.deleteById(ivId);
    }

    private Application verifyOwnership(Long appId, String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        Application app = applicationRepository.findById(appId)
            .orElseThrow(() -> new RuntimeException("Application not found"));
        if (!app.getUser().getId().equals(user.getId()))
            throw new RuntimeException("Unauthorized");
        return app;
    }

    private void map(Interview iv, Map<String, String> d) {
        String dt = d.get("interviewDate");
        if (dt != null && !dt.isBlank()) iv.setInterviewDate(LocalDate.parse(dt));
        if (d.containsKey("round"))     iv.setRound(d.get("round"));
        if (d.containsKey("notes"))     iv.setNotes(d.get("notes"));
        if (d.containsKey("questions")) iv.setQuestions(d.get("questions"));
        if (d.containsKey("outcome"))   iv.setOutcome(d.get("outcome"));
    }
}
