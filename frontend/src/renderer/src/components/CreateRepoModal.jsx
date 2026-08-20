import { useState } from 'react'

export default function CreateRepoModal({ onClose, onSubmit }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Repository name is required')
      return
    }

    // Validate repo name (no spaces, special chars)
    if (!/^[a-zA-Z0-9._-]+$/.test(name)) {
      setError('Name can only contain letters, numbers, hyphens, periods, and underscores')
      return
    }

    try {
      setLoading(true)
      setError(null)
      await onSubmit(name.trim(), description.trim(), isPrivate)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-labelledby="create-repo-title">
        <div className="modal-header">
          <h2 id="create-repo-title">Create a new repository</h2>
          <p>A repository contains all project files and revision history.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="field">
              <label className="field-label" htmlFor="repo-name">Repository name *</label>
              <input
                id="repo-name"
                className={`input ${error && !name ? 'input-error' : ''}`}
                type="text"
                placeholder="my-awesome-project"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(null) }}
                autoFocus
              />
            </div>

            <div className="field">
              <label className="field-label" htmlFor="repo-description">Description</label>
              <input
                id="repo-description"
                className="input"
                type="text"
                placeholder="Short description of your repository (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="field">
              <div className="toggle-field">
                <div className="toggle-field-text">
                  <span className="toggle-field-label">Private repository</span>
                  <span className="field-hint">
                    {isPrivate
                      ? 'Only you and collaborators can see this repository.'
                      : 'Anyone on the internet can see this repository.'}
                  </span>
                </div>
                <button
                  type="button"
                  className={`toggle ${isPrivate ? 'active' : ''}`}
                  onClick={() => setIsPrivate(!isPrivate)}
                  aria-label="Toggle private"
                />
              </div>
            </div>

            {error && <p className="field-error">{error}</p>}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading || !name.trim()}>
              {loading ? (
                <><span className="spinner spinner-sm" /> Creating...</>
              ) : (
                'Create repository'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
