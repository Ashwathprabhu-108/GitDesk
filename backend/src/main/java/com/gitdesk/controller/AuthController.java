package com.gitdesk.controller;

import com.gitdesk.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Handles GitHub OAuth authentication flow.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Returns the GitHub OAuth authorization URL.
     * The frontend opens this in the system browser.
     */
    @GetMapping("/login-url")
    public ResponseEntity<Map<String, String>> getLoginUrl() {
        return ResponseEntity.ok(Map.of("url", authService.getLoginUrl()));
    }

    /**
     * Exchanges the OAuth authorization code for an access token.
     * Called by Electron's main process after receiving the deep-link callback.
     */
    @PostMapping("/callback")
    public ResponseEntity<Map<String, Object>> handleCallback(@RequestBody Map<String, String> body) {
        String code = body.get("code");
        if (code == null || code.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing authorization code"));
        }

        Map<String, Object> user = authService.exchangeCodeForToken(code);
        return ResponseEntity.ok(Map.of(
                "user", user,
                "authenticated", true
        ));
    }

    /**
     * Returns the currently authenticated user's profile.
     */
    @GetMapping("/user")
    public ResponseEntity<?> getCurrentUser() {
        if (!authService.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        return ResponseEntity.ok(authService.getCurrentUser());
    }

    /**
     * Logs the user out (clears the stored token).
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout() {
        authService.logout();
        return ResponseEntity.ok(Map.of("logged_out", true));
    }
}
