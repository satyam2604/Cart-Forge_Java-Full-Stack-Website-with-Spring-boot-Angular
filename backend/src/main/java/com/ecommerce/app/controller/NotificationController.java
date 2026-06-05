package com.ecommerce.app.controller;

import com.ecommerce.app.model.Notification;
import com.ecommerce.app.model.User;
import com.ecommerce.app.repository.UserRepository;
import com.ecommerce.app.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "7. Notifications", description = "In-app notifications — Any logged-in user")
@SecurityRequirement(name = "Bearer Authentication")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @GetMapping
    @Operation(summary = "Get all notifications", description = "Returns all notifications for the logged-in user, newest first.")
    public ResponseEntity<List<Notification>> getNotifications(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(notificationService.getUserNotifications(getUser(ud)));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get unread notification count", description = "Returns count of unread notifications.")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(getUser(ud))));
    }

    @PostMapping("/mark-read")
    @Operation(summary = "Mark all notifications as read", description = "Sets all notifications to read state.")
    public ResponseEntity<Void> markAllRead(@AuthenticationPrincipal UserDetails ud) {
        notificationService.markAllRead(getUser(ud));
        return ResponseEntity.ok().build();
    }

    private User getUser(UserDetails ud) {
        return userRepository.findByUsername(ud.getUsername()).orElseThrow();
    }
}
