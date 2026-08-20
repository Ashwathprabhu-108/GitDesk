package com.gitdesk.controller;

import com.gitdesk.model.PushRequest;
import com.gitdesk.service.AuthService;
import com.gitdesk.service.JGitService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST controller for pushing local projects to GitHub.
 */
@RestController
@RequestMapping("/api/push")
public class PushController {

    private final JGitService jGitService;
    private final AuthService authService;

    public PushController(JGitService jGitService, AuthService authService) {
        this.jGitService = jGitService;
        this.authService = authService;
    }

    /**
     * Pushes a local folder to a GitHub repository.
     * Initializes git if necessary, stages, commits, and pushes.
     */
    @PostMapping
    public ResponseEntity<?> pushProject(@RequestBody PushRequest request) {
        if (!authService.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        try {
            Map<String, Object> result = jGitService.pushLocalProject(
                    request.getLocalPath(),
                    request.getRepoFullName(),
                    request.getCommitMessage()
            );
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Push failed: " + e.getMessage()
            ));
        }
    }
}
