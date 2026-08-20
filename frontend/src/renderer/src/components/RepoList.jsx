import { useState, useEffect } from 'react'
import { getRepos } from '../api/github'
import RepoCard from './RepoCard'
import './RepoList.css'

export default function RepoList({ onToggleVisibility, onDelete, onAddCollaborator, refreshKey }) {
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all') // 'all', 'public', 'private'

  useEffect(() => {
    fetchRepos()
  }, [refreshKey])

  async function fetchRepos() {
    try {
      setLoading(true)
      setError(null)
      const data = await getRepos()
      setRepos(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filtered = repos.filter((repo) => {
    const matchesSearch = repo.name.toLowerCase().includes(search.toLowerCase()) ||
      (repo.description && repo.description.toLowerCase().includes(search.toLowerCase()))
    const matchesFilter =
      filter === 'all' ||
      (filter === 'public' && !repo.private) ||
      (filter === 'private' && repo.private)
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="repo-list">
        <div className="repo-list-header">
          <h1 className="repo-list-title">Repositories</h1>
        </div>
        <div className="repo-list-loading">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="repo-card-skeleton">
              <div className="skeleton" style={{ width: '40%', height: 18, marginBottom: 8 }} />
              <div className="skeleton" style={{ width: '80%', height: 14, marginBottom: 12 }} />
              <div className="skeleton" style={{ width: '30%', height: 12 }} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="repo-list">
      <div className="repo-list-header">
        <div className="repo-list-header-top">
          <h1 className="repo-list-title">
            Repositories
            <span className="repo-list-count">{repos.length}</span>
          </h1>
          <button className="btn btn-ghost btn-sm" onClick={fetchRepos} title="Refresh">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"/>
              <polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            Refresh
          </button>
        </div>

        <div className="repo-list-filters">
          <div className="repo-list-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="search-icon">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              id="repo-search"
              type="text"
              className="input repo-search-input"
              placeholder="Search repositories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="repo-list-filter-buttons">
            {['all', 'public', 'private'].map((f) => (
              <button
                key={f}
                className={`btn btn-ghost btn-sm ${filter === f ? 'filter-active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="repo-list-error">
          <p>{error}</p>
          <button className="btn btn-secondary btn-sm" onClick={fetchRepos}>Try again</button>
        </div>
      )}

      {!error && filtered.length === 0 && (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
          <h3>{search ? 'No matching repositories' : 'No repositories yet'}</h3>
          <p>{search ? 'Try adjusting your search.' : 'Create your first repository to get started.'}</p>
        </div>
      )}

      <div className="repo-list-grid">
        {filtered.map((repo) => (
          <RepoCard
            key={repo.id}
            repo={repo}
            onToggleVisibility={onToggleVisibility}
            onDelete={onDelete}
            onAddCollaborator={onAddCollaborator}
          />
        ))}
      </div>
    </div>
  )
}
