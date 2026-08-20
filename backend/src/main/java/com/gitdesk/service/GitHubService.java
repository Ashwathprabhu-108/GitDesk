package com.gitdesk.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Calls the GitHub REST API (v3) for repository and collaborator operations.
 * Uses Spring's RestClient (blocking) — appropriate for a single-user desktop app.
 */
@Service
public class GitHubService {

    private static final Logger log = LoggerFactory.getLogger(GitHubService.class);
    private static final String GITHUB_API = "https://api.github.com";

    private static final ParameterizedTypeReference<Map<String, Object>> MAP_TYPE =
            new ParameterizedTypeReference<>() {};

    private static final ParameterizedTypeReference<List<Map<String, Object>>> LIST_MAP_TYPE =
            new ParameterizedTypeReference<>() {};

    private final AuthService authService;
    private final RestClient restClient;

    public GitHubService(AuthService authService) {
        this.authService = authService;
        this.restClient = RestClient.builder()
                .baseUrl(GITHUB_API)
                .defaultHeader("Accept", "application/vnd.github+json")
                .defaultHeader("X-GitHub-Api-Version", "2022-11-28")
                .build();
    }

    /**
     * Lists all repositories for the authenticated user (paginated, up to 100 per page).
     */
    public List<Map<String, Object>> listRepos() {
        log.info("Fetching user repositories...");
        List<Map<String, Object>> allRepos = new ArrayList<>();
        int page = 1;
        final int perPage = 100;

        while (true) {
            final int currentPage = page;
            List<Map<String, Object>> pageRepos = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/user/repos")
                            .queryParam("per_page", perPage)
                            .queryParam("page", currentPage)
                            .queryParam("sort", "updated")
                            .queryParam("affiliation", "owner")
                            .build())
                    .header("Authorization", "Bearer " + authService.getAccessToken())
                    .retrieve()
                    .body(LIST_MAP_TYPE);

            if (pageRepos == null || pageRepos.isEmpty()) {
                break;
            }

            allRepos.addAll(pageRepos);

            if (pageRepos.size() < perPage) {
                break;
            }
            page++;
        }

        log.info("Fetched {} repositories.", allRepos.size());
        return allRepos;
    }

    /**
     * Creates a new repository for the authenticated user.
     */
    public Map<String, Object> createRepo(String name, String description, boolean isPrivate) {
        log.info("Creating repository: {} (private={})", name, isPrivate);

        Map<String, Object> body = new HashMap<>();
        body.put("name", name);
        body.put("description", description != null ? description : "");
        body.put("private", isPrivate);
        body.put("auto_init", false);

        return restClient.post()
                .uri("/user/repos")
                .header("Authorization", "Bearer " + authService.getAccessToken())
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(MAP_TYPE);
    }

    /**
     * Updates a repository's visibility.
     *
     * @param owner      the repo owner
     * @param repo       the repo name
     * @param visibility "public" or "private"
     */
    public Map<String, Object> updateVisibility(String owner, String repo, String visibility) {
        log.info("Changing {}/{} visibility to {}", owner, repo, visibility);

        return restClient.patch()
                .uri("/repos/{owner}/{repo}", owner, repo)
                .header("Authorization", "Bearer " + authService.getAccessToken())
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("visibility", visibility))
                .retrieve()
                .body(MAP_TYPE);
    }

    /**
     * Deletes a repository. This is irreversible.
     */
    public void deleteRepo(String owner, String repo) {
        log.info("Deleting repository: {}/{}", owner, repo);

        restClient.delete()
                .uri("/repos/{owner}/{repo}", owner, repo)
                .header("Authorization", "Bearer " + authService.getAccessToken())
                .retrieve()
                .toBodilessEntity();

        log.info("Repository {}/{} deleted.", owner, repo);
    }

    /**
     * Adds a collaborator to a repository.
     *
     * GitHub returns 201 (invitation sent) or 204 (already a collaborator).
     *
     * @param owner      the repo owner
     * @param repo       the repo name
     * @param username   the collaborator's GitHub username
     * @param permission "pull" (read), "push" (write), or "admin"
     */
    public Map<String, Object> addCollaborator(String owner, String repo, String username, String permission) {
        log.info("Adding collaborator {} to {}/{} with permission {}", username, owner, repo, permission);

        Map<String, Object> result = restClient.put()
                .uri("/repos/{owner}/{repo}/collaborators/{username}", owner, repo, username)
                .header("Authorization", "Bearer " + authService.getAccessToken())
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("permission", permission))
                .retrieve()
                .body(MAP_TYPE);

        // 204 No Content means user is already a collaborator — body() returns null
        return result != null ? result : Map.of("status", "already_collaborator");
    }
}
