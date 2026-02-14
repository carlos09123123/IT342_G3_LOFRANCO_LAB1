package com.example.zootopia.zootopia.ecommerce.Service;

import com.example.zootopia.zootopia.ecommerce.Config.JwtUtil;
import com.example.zootopia.zootopia.ecommerce.Entity.User;
import com.example.zootopia.zootopia.ecommerce.Repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    // Register new user
    public String register(User user) {
        // Check if username already exists
        if (userRepo.findByUsername(user.getUsername()).isPresent()) {
            return "Username already registered!";
        }

        // Check if email already exists
        if (userRepo.findByEmail(user.getEmail()).isPresent()) {
            return "Email already registered!";
        }

        // Hash password with BCrypt
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Set default role if not provided
        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("USER");
        }

        userRepo.save(user);
        return "User registered successfully!";
    }

    // Login user
    public Map<String, Object> login(User loginRequest) {
        Map<String, Object> response = new HashMap<>();

        // Find user by username
        Optional<User> userOptional = userRepo.findByUsername(loginRequest.getUsername());

        if (userOptional.isEmpty()) {
            response.put("error", "Invalid username or password");
            return response;
        }

        User user = userOptional.get();

        // Verify password with BCrypt
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            response.put("error", "Invalid username or password");
            return response;
        }

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getUsername());

        response.put("token", token);
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("userId", user.getUserId());

        return response;
    }

    // Find user by username
    public Optional<User> findByUsername(String username) {
        return userRepo.findByUsername(username);
    }

    // Required for UserDetailsService
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepo.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
    }
}