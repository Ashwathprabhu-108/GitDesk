import { useState } from 'react'

export default function ConfirmDeleteModal({ repo, onClose, onConfirm }) {
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)

  const repoName = repo.name
  const isConfirmed = confirmText === repoName

  async function handleDelete() {
    if (!isConfirmed) return

    try {
      setLoading(true)
      await onConfirm(repo)
      onClose()
    } catch (err) {
      // Error handled by parent
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-labelledby="delete-repo-title">
        <div className="modal-header">
          <h2 id="delete-repo-title" style={{ color: 'var(--color-danger)' }}>
            Delete repository
          </h2>
          <p>
            This action <strong>cannot be undone</strong>. This will permanently delete the
            <strong> {repo.full_name}</strong> repository, wiki, issues, comments, packages,
            secrets, workflow runs, and remove all collaborator associations.
          </p>
        </div>

        <div className="modal-body">
          <div className="field">
            <label className="field-label" htmlFor="delete-confirm-input">
              Please type <strong>{repoName}</strong> to confirm.
            </label>
            <input
              id="delete-confirm-input"
              className={`input ${confirmText && !isConfirmed ? 'input-error' : ''}`}
              type="text"
              placeholder={repoName}
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className="btn btn-danger"
            onClick={handleDelete}
            disabled={!isConfirmed || loading}
          >
            {loading ? (
              <><span className="spinner spinner-sm" /> Deleting...</>
            ) : (
              'I understand, delete this repository'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
