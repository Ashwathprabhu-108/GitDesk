package com.gitdesk.model;

/**
 * DTO for adding a collaborator to a repository.
 */
public class CollaboratorRequest {

    private String username;
    private String permission; // "pull", "push", or "admin"

    public CollaboratorRequest() {
    }

    public CollaboratorRequest(String username, String permission) {
        this.username = username;
        this.permission = permission;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPermission() {
        return permission;
    }

    public void setPermission(String permission) {
        this.permission = permission;
    }
}
