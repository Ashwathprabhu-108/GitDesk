package com.gitdesk.controller;

import com.gitdesk.model.CollaboratorRequest;
import com.gitdesk.model.RepoRequest;
import com.gitdesk.model.VisibilityRequest;
import com.gitdesk.service.AuthService;
import com.gitdesk.service.GitHubService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for GitHub repository operations.
 */
@RestController
@RequestMapping("/api/repos")
public class RepoController {

    private final GitHubService gitHubService;
    private final AuthService authService;

    public RepoController(GitHubService gitHubService, AuthService authService) {
        this.gitHubService = gitHubService;
        this.authService = authService;
    }

    /**
     * Lists all repositories for the authenticated user.
     */
    @GetMapping
    public ResponseEntity<?> listRepos() {
        if (!authService.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        List<Map<String, Object>> repos = gitHubService.listRepos();
        return ResponseEntity.ok(repos);
    }

    /**
     * Creates a new repository.
     */
    @PostMapping
    public ResponseEntity<?> createRepo(@RequestBody RepoRequest request) {
        if (!authService.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        Map<String, Object> repo = gitHubService.createRepo(
                request.getName(),
                request.getDescription(),
                request.isPrivate()
        );
        return ResponseEntity.ok(repo);
    }

    /**
     * Changes a repository's visibility.
     */
    @PatchMapping("/{owner}/{repo}")
    public ResponseEntity<?> updateVisibility(
            @PathVariable String owner,
            @PathVariable String repo,
            @RequestBody VisibilityRequest request) {
        if (!authService.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        Map<String, Object> updated = gitHubService.updateVisibility(owner, repo, request.getVisibility());
        return ResponseEntity.ok(updated);
    }

    /**
     * Deletes a repository. This is irreversible.
     */
    @DeleteMapping("/{owner}/{repo}")
    public ResponseEntity<?> deleteRepo(@PathVariable String owner, @PathVariable String repo) {
        if (!authService.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        gitHubService.deleteRepo(owner, repo);
        return ResponseEntity.ok(Map.of("deleted", true, "repository", owner + "/" + repo));
    }

    /**
     * Adds a collaborator to a repository.
     */
    @PutMapping("/{owner}/{repo}/collaborators/{username}")
    public ResponseEntity<?> addCollaborator(
            @PathVariable String owner,
            @PathVariable String repo,
            @PathVariable String username,
            @RequestBody CollaboratorRequest request) {
        if (!authService.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        Map<String, Object> result = gitHubService.addCollaborator(
                owner, repo, username, request.getPermission()
        );
        return ResponseEntity.ok(result);
    }
}
