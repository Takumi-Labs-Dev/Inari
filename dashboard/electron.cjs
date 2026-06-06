const { app, BrowserWindow, shell, session } = require('electron')
const path = require('path')

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 640,
    icon: path.join(__dirname, 'public/assets/icon.ico'),
    title: '稲 ¦ Inari',
    backgroundColor: '#0a0a0b',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      session: session.defaultSession,
    },
    autoHideMenuBar: true,
  })

  if (app.isPackaged) {
    mainWindow.loadURL('http://localhost:3003')
  } else {
    mainWindow.loadURL('http://localhost:5173')
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://localhost:3003/auth')) {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          width: 500,
          height: 700,
          autoHideMenuBar: true,
          backgroundColor: '#0a0a0b',
          webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            session: session.defaultSession, // share the same session
          },
        },
      }
    }
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // Listen for auth success message from popup
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.executeJavaScript(`
      window.addEventListener('message', (e) => {
        if (e.data === 'inari-auth-success') {
          window.location.reload()
        }
      })
    `)
  })
}

app.whenReady().then(() => {
  // Allow cookies from localhost in file:// context
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    callback({ requestHeaders: details.requestHeaders })
  })

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})