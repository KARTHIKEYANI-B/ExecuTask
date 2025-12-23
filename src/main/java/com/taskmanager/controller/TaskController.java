package com.taskmanager.controller;

import com.taskmanager.dto.*;
import com.taskmanager.model.Task;
import com.taskmanager.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
public class TaskController {
    @Autowired
    private TaskService taskService;

    @PostMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<Task>> createTask(@PathVariable Long userId, @Valid @RequestBody TaskRequest request) {
        try {
            Task task = taskService.createTask(userId, request);
            return ResponseEntity.ok(new ApiResponse<>(true, "Created", task));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<Task>>> getUserTasks(@PathVariable Long userId, @RequestParam(defaultValue = "false") Boolean completed) {
        try {
            List<Task> tasks = taskService.getUserTasks(userId, completed);
            return ResponseEntity.ok(new ApiResponse<>(true, "Success", tasks));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/{taskId}")
    public ResponseEntity<ApiResponse<Task>> getTask(@PathVariable Long taskId) {
        try {
            Task task = taskService.getTaskById(taskId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Success", task));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @PutMapping("/{taskId}")
    public ResponseEntity<ApiResponse<Task>> updateTask(@PathVariable Long taskId, @Valid @RequestBody TaskRequest request) {
        try {
            Task task = taskService.updateTask(taskId, request);
            return ResponseEntity.ok(new ApiResponse<>(true, "Updated", task));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<ApiResponse<Void>> deleteTask(@PathVariable Long taskId) {
        try {
            taskService.deleteTask(taskId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage()));
        }
    }

    @PutMapping("/{taskId}/complete")
    public ResponseEntity<ApiResponse<Task>> markComplete(@PathVariable Long taskId) {
        try {
            Task task = taskService.markComplete(taskId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Completed", task));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
}
