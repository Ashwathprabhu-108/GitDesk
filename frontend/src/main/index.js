import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'

let mainWindow = null
let javaProcess = null
const BACKEND_PORT = 8080
const BACKEND_URL = `http://localhost:${BACKEND_PORT}`

/**
 * Register the gitdesk:// custom protocol for OAuth callbacks.
 * Must be called before app.ready.
 * In dev mode, pass the resolved path to the built main entry so Windows
 * registers: electron.exe "<path>/out/main/index.js" "%1"
 */
if (process.defaultApp) {
  // Dev mode: argv[1] is the entry script passed to electron
  const appEntry = process.argv[1]
    ? require('path').resolve(process.argv[1])
    : join(__dirname, 'index.js')
  app.setAsDefaultProtocolClient('gitdesk', process.execPath, [appEntry])
} else {
  app.setAsDefaultProtocolClient('gitdesk')
}

/**
 * Handle deep-link on Windows/Linux (single instance lock).
 * When GitHub redirects to gitdesk://auth/callback?code=...,
 * this handler extracts the code and forwards it to the backend.
 */
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (_event, commandLine) => {
    // On Windows, the deep link URL is the last argument
    const url = commandLine.find((arg) => arg.startsWith('gitdesk://'))
    if (url) {
      handleAuthCallback(url)
    }

    // Focus the main window
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

/**
 * Extracts the auth code from the deep-link URL and sends it to the backend.
 */
async function handleAuthCallback(url) {
  try {
    const urlObj = new URL(url)
    const code = urlObj.searchParams.get('code')

    if (!code) {
      console.error('No authorization code in callback URL:', url)
      return
    }

    console.log('Received OAuth callback with code:', code.substring(0, 8) + '...')

    // Send code to backend
    const response = await fetch(`${BACKEND_URL}/api/auth/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    })

    const data = await response.json()

    if (data.authenticated && mainWindow) {
      mainWindow.webContents.send('auth-success', data.user)
    }
  } catch (error) {
    console.error('Failed to handle auth callback:', error)
    if (mainWindow) {
      mainWindow.webContents.send('auth-error', error.message)
    }
  }
}

/**
 * Creates the main application window.
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    show: false,
    title: 'GitDesk',
    backgroundColor: '#FAFBFC',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // Open external links in system browser
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // In dev, load from Vite dev server; in prod, load the built HTML
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

/**
 * App lifecycle.
 */
app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.gitdesk.app')

  // Optimize window shortcuts in dev
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC handlers
  ipcMain.handle('open-external', async (_event, url) => {
    await shell.openExternal(url)
  })

  ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      title: 'Select project folder to push'
    })
    return result.canceled ? null : result.filePaths[0]
  })

  ipcMain.handle('get-backend-url', () => {
    return BACKEND_URL
  })

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

/**
 * Gracefully shut down the Java backend on quit.
 */
app.on('will-quit', () => {
  if (javaProcess) {
    console.log('Shutting down Java backend...')
    javaProcess.kill()
    javaProcess = null
  }
})
