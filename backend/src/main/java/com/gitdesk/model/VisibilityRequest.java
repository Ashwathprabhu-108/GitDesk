package com.gitdesk.model;

/**
 * DTO for changing repository visibility.
 */
public class VisibilityRequest {

    private String visibility; // "public" or "private"

    public VisibilityRequest() {
    }

    public VisibilityRequest(String visibility) {
        this.visibility = visibility;
    }

    public String getVisibility() {
        return visibility;
    }

    public void setVisibility(String visibility) {
        this.visibility = visibility;
    }
}
