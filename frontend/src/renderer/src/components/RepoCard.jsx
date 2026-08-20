import './RepoCard.css'

export default function RepoCard({ repo, onToggleVisibility, onDelete, onAddCollaborator }) {
  const isPrivate = repo.private
  const updatedAt = new Date(repo.updated_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

  // Extract language color (simplified mapping)
  const langColors = {
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    Python: '#3572A5',
    Java: '#b07219',
    'C#': '#178600',
    'C++': '#f34b7d',
    Go: '#00ADD8',
    Rust: '#dea584',
    Ruby: '#701516',
    PHP: '#4F5D95',
    Swift: '#F05138',
    Kotlin: '#A97BFF',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Shell: '#89e051',
    Dart: '#00B4AB'
  }

  return (
    <div className="repo-card" id={`repo-${repo.name}`}>
      <div className="repo-card-header">
        <div className="repo-card-title-row">
          <a
            href={repo.html_url}
            className="repo-card-name"
            title={`Open ${repo.full_name} on GitHub`}
            onClick={(e) => {
              e.preventDefault()
              if (window.api?.openExternal) {
                window.api.openExternal(repo.html_url)
              } else {
                window.open(repo.html_url, '_blank')
              }
            }}
          >
            {repo.name}
          </a>
          <span className={`badge ${isPrivate ? 'badge-private' : 'badge-public'}`}>
            {isPrivate ? 'Private' : 'Public'}
          </span>
        </div>
        {repo.description && (
          <p className="repo-card-desc">{repo.description}</p>
        )}
      </div>

      <div className="repo-card-meta">
        {repo.language && (
          <span className="repo-card-lang">
            <span
              className="repo-card-lang-dot"
              style={{ backgroundColor: langColors[repo.language] || '#6B7280' }}
            />
            {repo.language}
          </span>
        )}
        {repo.stargazers_count > 0 && (
          <span className="repo-card-stat">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            {repo.stargazers_count}
          </span>
        )}
        {repo.forks_count > 0 && (
          <span className="repo-card-stat">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="18" r="3"/>
              <circle cx="6" cy="6" r="3"/>
              <circle cx="18" cy="6" r="3"/>
              <path d="M18 9a9 9 0 0 1-9 9"/>
              <path d="M6 9a9 9 0 0 0 9 9"/>
            </svg>
            {repo.forks_count}
          </span>
        )}
        <span className="repo-card-date">Updated {updatedAt}</span>
      </div>

      <div className="repo-card-actions">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => onToggleVisibility(repo)}
          title={`Make ${isPrivate ? 'public' : 'private'}`}
        >
          {isPrivate ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          )}
          {isPrivate ? 'Make Public' : 'Make Private'}
        </button>

        <button
          className="btn btn-ghost btn-sm"
          onClick={() => onAddCollaborator(repo)}
          title="Add collaborator"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="8.5" cy="7" r="4"/>
            <line x1="20" y1="8" x2="20" y2="14"/>
            <line x1="23" y1="11" x2="17" y2="11"/>
          </svg>
          Collaborator
        </button>

        <button
          className="btn btn-ghost btn-sm repo-card-delete"
          onClick={() => onDelete(repo)}
          title="Delete repository"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            <line x1="10" y1="11" x2="10" y2="17"/>
            <line x1="14" y1="11" x2="14" y2="17"/>
          </svg>
          Delete
        </button>
      </div>
    </div>
  )
}
