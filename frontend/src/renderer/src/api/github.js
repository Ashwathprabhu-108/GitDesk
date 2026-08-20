/**
 * API client for communicating with the GitDesk Spring Boot backend.
 * All methods point to http://localhost:8080/api/
 */

const BASE_URL = 'http://localhost:8080/api'

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  }

  const response = await fetch(url, config)

  // Handle 204 No Content
  if (response.status === 204) {
    return { success: true }
  }

  // Handle errors
  if (!response.ok) {
    let errorBody
    try {
      errorBody = await response.json()
    } catch {
      errorBody = { error: response.statusText }
    }
    throw new Error(errorBody.error || `Request failed: ${response.status}`)
  }

  return response.json()
}

// ---- Auth ----

export async function getLoginUrl() {
  const data = await request('/auth/login-url')
  return data.url
}

export async function sendAuthCode(code) {
  return request('/auth/callback', {
    method: 'POST',
    body: JSON.stringify({ code })
  })
}

export async function getUser() {
  return request('/auth/user')
}

export async function logout() {
  return request('/auth/logout', { method: 'POST' })
}

// ---- Repos ----

export async function getRepos() {
  return request('/repos')
}

export async function createRepo(name, description, isPrivate) {
  return request('/repos', {
    method: 'POST',
    body: JSON.stringify({ name, description, private: isPrivate })
  })
}

export async function updateVisibility(owner, repo, visibility) {
  return request(`/repos/${owner}/${repo}`, {
    method: 'PATCH',
    body: JSON.stringify({ visibility })
  })
}

export async function deleteRepo(owner, repo) {
  return request(`/repos/${owner}/${repo}`, {
    method: 'DELETE'
  })
}

// ---- Collaborators ----

export async function addCollaborator(owner, repo, username, permission) {
  return request(`/repos/${owner}/${repo}/collaborators/${username}`, {
    method: 'PUT',
    body: JSON.stringify({ username, permission })
  })
}

// ---- Push ----

export async function pushProject(localPath, repoFullName, commitMessage) {
  return request('/push', {
    method: 'POST',
    body: JSON.stringify({ localPath, repoFullName, commitMessage })
  })
}
