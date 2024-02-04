import { app, shell, BrowserWindow, ipcMain, Tray, Menu, Notification } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { nativeImage } from 'electron/common'
import { EventEmitter } from 'stream'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    if (process.platform === 'darwin') {
      app.dock.show()
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  if (process.platform === 'darwin') {
    app.dock.hide()
  }

  // テンプレートを作った時の画像を16pxに加工
  const trayIcon = nativeImage.createFromPath(icon).resize({ width: 16 })
  // Tray作成
  const tray = new Tray(trayIcon)
  // Trayにメニュー追加
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'ウィンドウを開く',
      click: () => {
        createWindow()
      }
    },
    {
      label: '終了',
      click: () => {
        app.quit()
      }
    }
  ])
  tray.setContextMenu(contextMenu)
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform === 'darwin') {
    app.dock.hide()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

type Time = {
  hours: number
  minutes: number
}

let notifyTime: Time | null = null

// 1分ごとにtimeイベントをemitする
const intervalEventEmitter = new EventEmitter()
setInterval(() => {
  intervalEventEmitter.emit('time', new Date())
}, 1000 * 60)

intervalEventEmitter.on('time', (now: Date) => {
  if (notifyTime == null) {
    return
  }

  if (notifyTime.hours === now.getHours() && notifyTime.minutes === now.getMinutes()) {
    const notification = new Notification({
      title: '時間になりました。'
    })
    notification.show()
  }
})

ipcMain.handle('setTimer', (event, time: Time) => {
  console.debug('setTimer', time)
  notifyTime = time
})
