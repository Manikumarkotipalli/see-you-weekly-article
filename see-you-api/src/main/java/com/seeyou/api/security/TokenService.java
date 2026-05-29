package com.seeyou.api.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

@Service
public class TokenService {

    @Value("${admin.token-secret}")
    private String secret;

    private static final long EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24 hours

    public String generateToken(String username) {
        long timestamp = System.currentTimeMillis();
        String signature = calculateHmac(username, timestamp);
        return username + "." + timestamp + "." + signature;
    }

    public boolean validateToken(String token, String expectedUsername) {
        if (token == null || token.isEmpty()) {
            return false;
        }

        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            return false;
        }

        String username = parts[0];
        if (!username.equals(expectedUsername)) {
            return false;
        }

        try {
            long timestamp = Long.parseLong(parts[1]);
            long currentTime = System.currentTimeMillis();

            // Check expiration
            if (currentTime - timestamp > EXPIRATION_TIME) {
                return false;
            }

            // Check signature
            String expectedSignature = calculateHmac(username, timestamp);
            return expectedSignature.equals(parts[2]);
        } catch (NumberFormatException e) {
            return false;
        }
    }

    private String calculateHmac(String username, long timestamp) {
        try {
            String data = username + ":" + timestamp + ":" + secret;
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
}
