package com.taskmanager.dto;

import com.taskmanager.model.Task;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

public class TaskRequest {
    @NotBlank
    private String title;
    private String description;
    @NotNull
    private LocalDate taskDate;
    @NotNull
    private LocalTime taskTime;
    @NotNull
    private Task.NotificationMethod notificationMethod;
    private String category = "daily_work";

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDate getTaskDate() { return taskDate; }
    public void setTaskDate(LocalDate taskDate) { this.taskDate = taskDate; }
    public LocalTime getTaskTime() { return taskTime; }
    public void setTaskTime(LocalTime taskTime) { this.taskTime = taskTime; }
    public Task.NotificationMethod getNotificationMethod() { return notificationMethod; }
    public void setNotificationMethod(Task.NotificationMethod notificationMethod) { this.notificationMethod = notificationMethod; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
}