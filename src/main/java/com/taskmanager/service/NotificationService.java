package com.taskmanager.service;

import com.taskmanager.model.Task;
import com.taskmanager.model.User;
import com.taskmanager.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;

import java.time.format.DateTimeFormatter;

@Service
public class NotificationService {
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Autowired
    private UserRepository userRepository;
    
    @Value("${spring.mail.username:}")
    private String fromEmail;
    
    @Value("${twilio.account.sid:}")
    private String twilioAccountSid;
    
    @Value("${twilio.auth.token:}")
    private String twilioAuthToken;
    
    @Value("${twilio.phone.number:}")
    private String twilioPhoneNumber;
    
    @Async
    public void sendNotifications(Task task) {
        try {
            User user = userRepository.findById(task.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            if (task.getNotificationMethod() == Task.NotificationMethod.email || 
                task.getNotificationMethod() == Task.NotificationMethod.both) {
                sendEmailNotification(task, user);
            }
            
            if (task.getNotificationMethod() == Task.NotificationMethod.sms || 
                task.getNotificationMethod() == Task.NotificationMethod.both) {
                sendSMSNotification(task, user);
            }
        } catch (Exception e) {
            System.err.println("Notification error: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    private void sendEmailNotification(Task task, User user) {
        try {
            if (fromEmail == null || fromEmail.isEmpty()) {
                System.err.println("Email not configured");
                return;
            }
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(user.getEmail());
            message.setSubject("Task Reminder: " + task.getTitle());
            
            String body = String.format(
                "Hello %s,\n\n" +
                "This is a reminder for your task:\n\n" +
                "Task: %s\n" +
                "Description: %s\n" +
                "Date: %s\n" +
                "Time: %s\n" +
                "Category: %s\n\n" +
                "Best regards,\n" +
                "Task Manager Team",
                user.getName(),
                task.getTitle(),
                task.getDescription() != null ? task.getDescription() : "No description",
                task.getTaskDate().format(DateTimeFormatter.ofPattern("dd MMM yyyy")),
                task.getTaskTime().format(DateTimeFormatter.ofPattern("hh:mm a")),
                task.getCategory()
            );
            
            message.setText(body);
            mailSender.send(message);
            System.out.println("✅ Email sent to: " + user.getEmail());
            
        } catch (Exception e) {
            System.err.println("❌ Email send error: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    private void sendSMSNotification(Task task, User user) {
        try {
            if (twilioAccountSid == null || twilioAccountSid.isEmpty()) {
                System.err.println("Twilio not configured");
                return;
            }
            
            Twilio.init(twilioAccountSid, twilioAuthToken);
            
            String messageBody = String.format(
                "Task Reminder: %s\nDate: %s at %s",
                task.getTitle(),
                task.getTaskDate().format(DateTimeFormatter.ofPattern("dd MMM yyyy")),
                task.getTaskTime().format(DateTimeFormatter.ofPattern("hh:mm a"))
            );
            
            Message.creator(
                new PhoneNumber(user.getPhone()),
                new PhoneNumber(twilioPhoneNumber),
                messageBody
            ).create();
            
            System.out.println("✅ SMS sent to: " + user.getPhone());
            
        } catch (Exception e) {
            System.err.println("❌ SMS send error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}