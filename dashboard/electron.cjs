const { app, BrowserWindow, shell } = require('electron')
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
    },
    autoHideMenuBar: true,
  })

  mainWindow.webContents.openDevTools()

  if (app.isPackaged) {
    const indexPath = path.join(__dirname, 'dist', 'index.html')
    mainWindow.loadFile(indexPath)
  } else {
    mainWindow.loadURL('http://localhost:5173')
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})