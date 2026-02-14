package com.example.zootopia.zootopia.ecommerce.Controller;

import com.example.zootopia.zootopia.ecommerce.Entity.User;
import com.example.zootopia.zootopia.ecommerce.Service.UserService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    // POST /api/auth/register
    @PostMapping("/auth/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody User user) {
        String result = userService.register(user);

        if (result.contains("already")) { // Username or email already exists
            return ResponseEntity.badRequest().body(Map.of("message", result));
        }

        return ResponseEntity.ok(Map.of(
                "message", "User registered successfully!",
                "username", user.getUsername(),
                "email", user.getEmail()
        ));
    }

    // POST /api/auth/login
    @PostMapping("/auth/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody User user) {
        Map<String, Object> result = userService.login(user);

        if (result.containsKey("error")) {
            String error = (String) result.get("error");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("error", error));
        }

        return ResponseEntity.ok(Map.of(
                "message", "Login successful",
                "token", result.get("token"),
                "username", result.get("username")
        ));
    }

    // GET /api/user/me (protected)
    @GetMapping("/user/me")
    public ResponseEntity<Map<String, String>> getCurrentUser(Authentication authentication) {
        String username = authentication.getName();
        User user = userService.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        return ResponseEntity.ok(Map.of(
                "userId", user.getUserId().toString(),
                "username", user.getUsername(),
                "email", user.getEmail(),
                "firstName", user.getFirstName() != null ? user.getFirstName() : "",
                "lastName", user.getLastName() != null ? user.getLastName() : "",
                "role", user.getRole() != null ? user.getRole() : "USER"
        ));
    }
}