import { useState } from 'react'

export default function CollaboratorModal({ repo, onClose, onSubmit }) {
  const [username, setUsername] = useState('')
  const [permission, setPermission] = useState('push')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()

    if (!username.trim()) {
      setError('GitHub username is required')
      return
    }

    try {
      setLoading(true)
      setError(null)
      await onSubmit(repo, username.trim(), permission)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const permissionDescriptions = {
    pull: 'Can view and clone the repository.',
    push: 'Can read, clone, and push to the repository.',
    admin: 'Full access to the repository, including settings.'
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-labelledby="collab-title">
        <div className="modal-header">
          <h2 id="collab-title">Add a collaborator</h2>
          <p>Invite someone to collaborate on <strong>{repo.full_name}</strong>.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="field">
              <label className="field-label" htmlFor="collab-username">GitHub username *</label>
              <input
                id="collab-username"
                className={`input ${error && !username ? 'input-error' : ''}`}
                type="text"
                placeholder="octocat"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(null) }}
                autoFocus
              />
            </div>

            <div className="field">
              <label className="field-label" htmlFor="collab-permission">Permission level</label>
              <select
                id="collab-permission"
                className="select"
                value={permission}
                onChange={(e) => setPermission(e.target.value)}
              >
                <option value="pull">Read</option>
                <option value="push">Write</option>
                <option value="admin">Admin</option>
              </select>
              <span className="field-hint">{permissionDescriptions[permission]}</span>
            </div>

            {error && <p className="field-error">{error}</p>}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading || !username.trim()}>
              {loading ? (
                <><span className="spinner spinner-sm" /> Sending...</>
              ) : (
                'Send invitation'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
