package com.example.zootopia.zootopia.ecommerce.Service;

import com.example.zootopia.zootopia.ecommerce.Config.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class JwtService {
    private final JwtUtil jwtUtil;

    public String extractUsername(String token) {
        return jwtUtil.extractUsername(token);
    }

    public boolean validateToken(String token, String username) {
        return jwtUtil.validateToken(token, () -> username);
    }
}