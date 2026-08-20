import { useState, useEffect } from 'react'
import { getRepos } from '../api/github'

export default function PushProjectModal({ onClose, onSubmit }) {
  const [localPath, setLocalPath] = useState('')
  const [repoFullName, setRepoFullName] = useState('')
  const [commitMessage, setCommitMessage] = useState('')
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingRepos, setLoadingRepos] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadRepos()
  }, [])

  async function loadRepos() {
    try {
      const data = await getRepos()
      setRepos(data)
    } catch (err) {
      console.error('Failed to load repos:', err)
    } finally {
      setLoadingRepos(false)
    }
  }

  async function selectFolder() {
    try {
      if (window.api?.selectFolder) {
        const folder = await window.api.selectFolder()
        if (folder) {
          setLocalPath(folder)
        }
      } else {
        // Fallback for browser dev
        setLocalPath('C:\\path\\to\\your\\project')
      }
    } catch (err) {
      console.error('Failed to select folder:', err)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!localPath) {
      setError('Please select a project folder')
      return
    }
    if (!repoFullName) {
      setError('Please select a target repository')
      return
    }

    try {
      setLoading(true)
      setError(null)
      await onSubmit(
        localPath,
        repoFullName,
        commitMessage.trim() || 'Update from GitDesk'
      )
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-labelledby="push-project-title">
        <div className="modal-header">
          <h2 id="push-project-title">Push a local project</h2>
          <p>Select a folder and push it to one of your GitHub repositories.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="field">
              <label className="field-label">Project folder *</label>
              <div className="folder-picker">
                <input
                  id="push-local-path"
                  className="input"
                  type="text"
                  placeholder="Select a folder..."
                  value={localPath}
                  onChange={(e) => setLocalPath(e.target.value)}
                  readOnly
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={selectFolder}
                >
                  Browse
                </button>
              </div>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="push-repo-select">Target repository *</label>
              <select
                id="push-repo-select"
                className="select"
                value={repoFullName}
                onChange={(e) => setRepoFullName(e.target.value)}
                disabled={loadingRepos}
              >
                <option value="">
                  {loadingRepos ? 'Loading repositories...' : 'Select a repository'}
                </option>
                {repos.map((repo) => (
                  <option key={repo.id} value={repo.full_name}>
                    {repo.full_name} {repo.private ? '🔒' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="push-commit-message">Commit message</label>
              <input
                id="push-commit-message"
                className="input"
                type="text"
                placeholder="Update from GitDesk"
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
              />
              <span className="field-hint">Leave empty for default message.</span>
            </div>

            {error && <p className="field-error">{error}</p>}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !localPath || !repoFullName}
            >
              {loading ? (
                <><span className="spinner spinner-sm" /> Pushing...</>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="19" x2="12" y2="5"/>
                    <polyline points="5 12 12 5 19 12"/>
                  </svg>
                  Push to GitHub
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
