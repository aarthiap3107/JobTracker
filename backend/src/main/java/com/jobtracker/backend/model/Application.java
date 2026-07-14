package com.jobtracker.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "applications")
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(name = "job_title", nullable = false)
    private String jobTitle;

    @Enumerated(EnumType.STRING)
    private Status status = Status.APPLIED;

    @Column(name = "applied_date")
    private LocalDate appliedDate;

    private LocalDate deadline;

    @Column(name = "job_url")
    private String jobUrl;

    private String salary;

    @Column(name = "contact_person")
    private String contactPerson;

    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum Status {
        APPLIED, INTERVIEW, OFFER, REJECTED
    }
}
