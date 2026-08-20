package com.gitdesk.service;

import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.PushCommand;
import org.eclipse.jgit.api.RemoteAddCommand;
import org.eclipse.jgit.api.Status;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.lib.PersonIdent;
import org.eclipse.jgit.lib.StoredConfig;
import org.eclipse.jgit.transport.PushResult;
import org.eclipse.jgit.transport.RemoteRefUpdate;
import org.eclipse.jgit.transport.URIish;
import org.eclipse.jgit.transport.UsernamePasswordCredentialsProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.File;
import java.net.URISyntaxException;
import java.util.*;

/**
 * Handles local git operations using JGit:
 * init, add, commit, set remote, and push.
 */
@Service
public class JGitService {

    private static final Logger log = LoggerFactory.getLogger(JGitService.class);

    private final AuthService authService;

    public JGitService(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Pushes a local directory to a GitHub repository.
     * If the directory isn't already a git repo, it will be initialized.
     *
     * @param localPath     absolute path to the local project folder
     * @param repoFullName  "owner/repo" format
     * @param commitMessage the commit message
     * @return a summary of the push result
     */
    public Map<String, Object> pushLocalProject(String localPath, String repoFullName, String commitMessage) {
        File dir = new File(localPath);
        if (!dir.exists() || !dir.isDirectory()) {
            throw new IllegalArgumentException("Path does not exist or is not a directory: " + localPath);
        }

        String token = authService.getAccessToken();
        if (token == null) {
            throw new IllegalStateException("Not authenticated. Please log in first.");
        }

        String remoteUrl = "https://github.com/" + repoFullName + ".git";
        Map<String, Object> userInfo = authService.getCurrentUser();
        String userName = userInfo != null ? String.valueOf(userInfo.getOrDefault("login", "GitDesk")) : "GitDesk";
        String userEmail = userInfo != null ? String.valueOf(userInfo.getOrDefault("email", userName + "@users.noreply.github.com")) : "gitdesk@users.noreply.github.com";

        // If email is "null" string (GitHub can return null for private emails), use noreply
        if ("null".equals(userEmail)) {
            userEmail = userName + "@users.noreply.github.com";
        }

        log.info("Pushing {} to {} ...", localPath, remoteUrl);

        try {
            Git git;
            File gitDir = new File(dir, ".git");

            if (gitDir.exists()) {
                // Open existing repo
                git = Git.open(dir);
                log.info("Opened existing git repository at {}", localPath);
            } else {
                // Initialize new repo
                git = Git.init().setDirectory(dir).setInitialBranch("main").call();
                log.info("Initialized new git repository at {}", localPath);
            }

            try {
                // Ensure remote "origin" is set to the target repo
                configureRemote(git, remoteUrl);

                // Stage all files
                git.add().addFilepattern(".").call();

                // Check if there's anything to commit
                Status status = git.status().call();
                boolean hasChanges = !status.getAdded().isEmpty()
                        || !status.getChanged().isEmpty()
                        || !status.getRemoved().isEmpty()
                        || !status.getModified().isEmpty()
                        || !status.getUntracked().isEmpty();

                if (hasChanges || git.log().setMaxCount(1).call().iterator().hasNext() == false) {
                    // Also stage removals
                    git.add().addFilepattern(".").setUpdate(true).call();

                    // Commit
                    git.commit()
                            .setAuthor(new PersonIdent(userName, userEmail))
                            .setMessage(commitMessage != null ? commitMessage : "Update from GitDesk")
                            .call();
                    log.info("Committed changes with message: {}", commitMessage);
                } else {
                    log.info("No changes to commit.");
                }

                // Push
                PushCommand pushCommand = git.push()
                        .setRemote("origin")
                        .setCredentialsProvider(new UsernamePasswordCredentialsProvider(token, ""));

                Iterable<PushResult> results = pushCommand.call();

                // Build result summary
                List<String> pushMessages = new ArrayList<>();
                boolean success = true;

                for (PushResult result : results) {
                    for (RemoteRefUpdate update : result.getRemoteUpdates()) {
                        String statusStr = update.getStatus().toString();
                        pushMessages.add(update.getRemoteName() + ": " + statusStr);

                        if (update.getStatus() != RemoteRefUpdate.Status.OK
                                && update.getStatus() != RemoteRefUpdate.Status.UP_TO_DATE) {
                            success = false;
                        }
                    }
                    if (result.getMessages() != null && !result.getMessages().isEmpty()) {
                        pushMessages.add(result.getMessages());
                    }
                }

                Map<String, Object> resultMap = new HashMap<>();
                resultMap.put("success", success);
                resultMap.put("messages", pushMessages);
                resultMap.put("repository", repoFullName);
                resultMap.put("localPath", localPath);

                log.info("Push completed. Success: {}", success);
                return resultMap;

            } finally {
                git.close();
            }

        } catch (GitAPIException | java.io.IOException e) {
            log.error("Git operation failed", e);
            throw new RuntimeException("Git operation failed: " + e.getMessage(), e);
        }
    }

    /**
     * Configures or updates the "origin" remote URL.
     */
    private void configureRemote(Git git, String remoteUrl) {
        try {
            StoredConfig config = git.getRepository().getConfig();
            String existingUrl = config.getString("remote", "origin", "url");

            if (existingUrl == null) {
                // Add remote
                RemoteAddCommand remoteAdd = git.remoteAdd();
                remoteAdd.setName("origin");
                remoteAdd.setUri(new URIish(remoteUrl));
                remoteAdd.call();
                log.info("Added remote 'origin': {}", remoteUrl);
            } else if (!existingUrl.equals(remoteUrl)) {
                // Update remote URL
                config.setString("remote", "origin", "url", remoteUrl);
                config.save();
                log.info("Updated remote 'origin' from {} to {}", existingUrl, remoteUrl);
            }
        } catch (URISyntaxException | GitAPIException | java.io.IOException e) {
            throw new RuntimeException("Failed to configure remote: " + e.getMessage(), e);
        }
    }
}
