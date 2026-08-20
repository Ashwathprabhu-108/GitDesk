import { useState, useCallback } from 'react'
import { useAuth } from './hooks/useAuth'
import { ToastProvider, useToast } from './components/Toast'
import LoginScreen from './components/LoginScreen'
import Sidebar from './components/Sidebar'
import RepoList from './components/RepoList'
import CreateRepoModal from './components/CreateRepoModal'
import PushProjectModal from './components/PushProjectModal'
import ConfirmDeleteModal from './components/ConfirmDeleteModal'
import CollaboratorModal from './components/CollaboratorModal'
import {
  createRepo,
  updateVisibility,
  deleteRepo,
  addCollaborator,
  pushProject
} from './api/github'
import './App.css'

function AppContent() {
  const { user, loading, login, logout, isAuthenticated } = useAuth()
  const toast = useToast()

  const [activeView, setActiveView] = useState('repos')
  const [refreshKey, setRefreshKey] = useState(0)

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showPushModal, setShowPushModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [collabTarget, setCollabTarget] = useState(null)

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  // Navigation handler — "create" and "push" open modals instead of changing views
  function handleNavigate(view) {
    if (view === 'create') {
      setShowCreateModal(true)
    } else if (view === 'push') {
      setShowPushModal(true)
    } else {
      setActiveView(view)
    }
  }

  // ---- Handlers ----

  async function handleCreateRepo(name, description, isPrivate) {
    await createRepo(name, description, isPrivate)
    toast.success(`Repository "${name}" created successfully!`)
    refresh()
  }

  async function handleToggleVisibility(repo) {
    const newVisibility = repo.private ? 'public' : 'private'
    const owner = repo.owner?.login || repo.full_name.split('/')[0]
    await updateVisibility(owner, repo.name, newVisibility)
    toast.success(`"${repo.name}" is now ${newVisibility}.`)
    refresh()
  }

  async function handleDeleteRepo(repo) {
    const owner = repo.owner?.login || repo.full_name.split('/')[0]
    await deleteRepo(owner, repo.name)
    toast.success(`Repository "${repo.name}" has been deleted.`)
    setDeleteTarget(null)
    refresh()
  }

  async function handleAddCollaborator(repo, username, permission) {
    const owner = repo.owner?.login || repo.full_name.split('/')[0]
    await addCollaborator(owner, repo.name, username, permission)
    toast.success(`Invitation sent to @${username}.`)
  }

  async function handlePushProject(localPath, repoFullName, commitMessage) {
    await pushProject(localPath, repoFullName, commitMessage)
    toast.success(`Project pushed to ${repoFullName} successfully!`)
    refresh()
  }

  // ---- Render ----

  if (!isAuthenticated) {
    return <LoginScreen onLogin={login} loading={loading} />
  }

  return (
    <div className="app-layout">
      <Sidebar
        user={user}
        activeView={activeView}
        onNavigate={handleNavigate}
        onLogout={logout}
      />

      <main className="app-main">
        {activeView === 'repos' && (
          <RepoList
            refreshKey={refreshKey}
            onToggleVisibility={handleToggleVisibility}
            onDelete={(repo) => setDeleteTarget(repo)}
            onAddCollaborator={(repo) => setCollabTarget(repo)}
          />
        )}
      </main>

      {/* Modals */}
      {showCreateModal && (
        <CreateRepoModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateRepo}
        />
      )}

      {showPushModal && (
        <PushProjectModal
          onClose={() => setShowPushModal(false)}
          onSubmit={handlePushProject}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          repo={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteRepo}
        />
      )}

      {collabTarget && (
        <CollaboratorModal
          repo={collabTarget}
          onClose={() => setCollabTarget(null)}
          onSubmit={handleAddCollaborator}
        />
      )}
    </div>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  )
}
