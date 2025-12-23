package com.taskmanager.service;

import com.taskmanager.dto.TaskRequest;
import com.taskmanager.model.Task;
import com.taskmanager.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class TaskService {
    
    @Autowired
    private TaskRepository taskRepository;
    
    @Autowired
    private NotificationService notificationService;  // ADD THIS
    
    public Task createTask(Long userId, TaskRequest request) {
        Task task = new Task();
        task.setUserId(userId);
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setTaskDate(request.getTaskDate());
        task.setTaskTime(request.getTaskTime());
        task.setNotificationMethod(request.getNotificationMethod());
        task.setCategory(request.getCategory());
        
        Task savedTask = taskRepository.save(task);
        
        // Send notification immediately after creating task
        notificationService.sendNotifications(savedTask);  // ADD THIS
        
        return savedTask;
    }
    
    public List<Task> getUserTasks(Long userId, Boolean completed) {
        return taskRepository.findByUserIdAndCompletedOrderByTaskDateAscTaskTimeAsc(userId, completed);
    }
    
    public Task getTaskById(Long taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
    }
    
    public Task updateTask(Long taskId, TaskRequest request) {
        Task task = getTaskById(taskId);
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setTaskDate(request.getTaskDate());
        task.setTaskTime(request.getTaskTime());
        task.setNotificationMethod(request.getNotificationMethod());
        task.setCategory(request.getCategory());
        return taskRepository.save(task);
    }
    
    public void deleteTask(Long taskId) {
        taskRepository.deleteById(taskId);
    }
    
    public Task markComplete(Long taskId) {
        Task task = getTaskById(taskId);
        task.setCompleted(true);
        return taskRepository.save(task);
    }
}