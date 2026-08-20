package com.gitdesk.model;

/**
 * DTO for pushing a local project to a GitHub repository.
 */
public class PushRequest {

    private String localPath;
    private String repoFullName;
    private String commitMessage;

    public PushRequest() {
    }

    public PushRequest(String localPath, String repoFullName, String commitMessage) {
        this.localPath = localPath;
        this.repoFullName = repoFullName;
        this.commitMessage = commitMessage;
    }

    public String getLocalPath() {
        return localPath;
    }

    public void setLocalPath(String localPath) {
        this.localPath = localPath;
    }

    public String getRepoFullName() {
        return repoFullName;
    }

    public void setRepoFullName(String repoFullName) {
        this.repoFullName = repoFullName;
    }

    public String getCommitMessage() {
        return commitMessage;
    }

    public void setCommitMessage(String commitMessage) {
        this.commitMessage = commitMessage;
    }
}
