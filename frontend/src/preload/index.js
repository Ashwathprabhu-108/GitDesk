import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

/**
 * Expose Electron APIs to the renderer process through contextBridge.
 */
const api = {
  /** Open a URL in the system browser */
  openExternal: (url) => ipcRenderer.invoke('open-external', url),

  /** Open a folder picker dialog */
  selectFolder: () => ipcRenderer.invoke('select-folder'),

  /** Get the backend URL */
  getBackendUrl: () => ipcRenderer.invoke('get-backend-url'),

  /** Listen for OAuth success from main process */
  onAuthSuccess: (callback) => {
    ipcRenderer.on('auth-success', (_event, user) => callback(user))
  },

  /** Listen for OAuth error from main process */
  onAuthError: (callback) => {
    ipcRenderer.on('auth-error', (_event, error) => callback(error))
  },

  /** Remove auth listeners */
  removeAuthListeners: () => {
    ipcRenderer.removeAllListeners('auth-success')
    ipcRenderer.removeAllListeners('auth-error')
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
