package com.taskmanager.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "user_id")
    private Long userId;
    private String title;
    private String description;
    @Column(name = "task_date")
    private LocalDate taskDate;
    @Column(name = "task_time")
    private LocalTime taskTime;
    @Enumerated(EnumType.STRING)
    @Column(name = "notification_method")
    private NotificationMethod notificationMethod;
    private String category = "daily_work";
    private Boolean completed = false;
    private Boolean notified = false;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum NotificationMethod { email, sms, both }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDate getTaskDate() { return taskDate; }
    public void setTaskDate(LocalDate taskDate) { this.taskDate = taskDate; }
    public LocalTime getTaskTime() { return taskTime; }
    public void setTaskTime(LocalTime taskTime) { this.taskTime = taskTime; }
    public NotificationMethod getNotificationMethod() { return notificationMethod; }
    public void setNotificationMethod(NotificationMethod notificationMethod) { this.notificationMethod = notificationMethod; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public Boolean getCompleted() { return completed; }
    public void setCompleted(Boolean completed) { this.completed = completed; }
    public Boolean getNotified() { return notified; }
    public void setNotified(Boolean notified) { this.notified = notified; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}