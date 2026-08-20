package com.gitdesk.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

/**
 * Handles GitHub OAuth token exchange and in-memory token storage.
 * Since GitDesk is a single-user desktop app, we store exactly one token.
 */
@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private static final ParameterizedTypeReference<Map<String, Object>> MAP_TYPE =
            new ParameterizedTypeReference<>() {};

    @Value("${github.client-id}")
    private String clientId;

    @Value("${github.client-secret}")
    private String clientSecret;

    @Value("${github.redirect-uri}")
    private String redirectUri;

    @Value("${github.scopes}")
    private String scopes;

    private final RestClient restClient;

    /** In-memory access token for the single desktop user */
    private String accessToken;

    /** Cached user info */
    private Map<String, Object> currentUser;

    public AuthService() {
        this.restClient = RestClient.builder().build();
    }

    /**
     * Builds the GitHub OAuth authorization URL.
     */
    public String getLoginUrl() {
        return "https://github.com/login/oauth/authorize"
                + "?client_id=" + clientId
                + "&redirect_uri=" + redirectUri
                + "&scope=" + scopes;
    }

    /**
     * Exchanges an authorization code for an access token.
     *
     * @param code the authorization code from GitHub's OAuth redirect
     * @return the authenticated user's profile info
     */
    public Map<String, Object> exchangeCodeForToken(String code) {
        log.info("Exchanging authorization code for access token...");

        // POST to GitHub to exchange code for token, receive raw JSON string
        String response = restClient.post()
                .uri("https://github.com/login/oauth/access_token")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .body(Map.of(
                        "client_id", clientId,
                        "client_secret", clientSecret,
                        "code", code,
                        "redirect_uri", redirectUri
                ))
                .retrieve()
                .body(String.class);

        // Parse the access token from the JSON response
        try {
            JsonNode node = OBJECT_MAPPER.readTree(response);

            if (node.has("error")) {
                String error = node.get("error").asText();
                String desc = node.has("error_description") ? node.get("error_description").asText() : "";
                throw new RuntimeException("OAuth error: " + error + " — " + desc);
            }

            this.accessToken = node.get("access_token").asText();
            log.info("Access token obtained successfully.");

            // Fetch and cache user info
            this.currentUser = fetchUserInfo();
            return this.currentUser;

        } catch (Exception e) {
            log.error("Failed to exchange code for token", e);
            throw new RuntimeException("Failed to exchange authorization code: " + e.getMessage(), e);
        }
    }

    /**
     * Fetches the authenticated user's profile from GitHub.
     */
    private Map<String, Object> fetchUserInfo() {
        return restClient.get()
                .uri("https://api.github.com/user")
                .header("Authorization", "Bearer " + accessToken)
                .header("Accept", "application/vnd.github+json")
                .header("X-GitHub-Api-Version", "2022-11-28")
                .retrieve()
                .body(MAP_TYPE);
    }

    /**
     * Returns the stored access token, or null if not authenticated.
     */
    public String getAccessToken() {
        return accessToken;
    }

    /**
     * Returns the cached user info, or fetches it if not cached.
     */
    public Map<String, Object> getCurrentUser() {
        if (accessToken == null) {
            return null;
        }
        if (currentUser == null) {
            currentUser = fetchUserInfo();
        }
        return currentUser;
    }

    /**
     * Returns true if the user is authenticated.
     */
    public boolean isAuthenticated() {
        return accessToken != null;
    }

    /**
     * Clears the stored token (logout).
     */
    public void logout() {
        this.accessToken = null;
        this.currentUser = null;
        log.info("User logged out.");
    }
}
