const { app, BrowserWindow, ipcMain, globalShortcut, screen, Tray, Menu, nativeImage } = require('electron');
const path = require('path');

let Store;
try {
    Store = require('electron-store');
    if (Store.default) Store = Store.default;
} catch (e) {
    Store = null;
}

const store = Store ? new Store() : null;
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

const WIDGET_W = 560;
const WIDGET_H = 56;
const EXPANDED_H = 620;

let mainWindow = null;
let tray = null;
let stealthMode = false;

function createWindow() {
    const { width: screenW, height: screenH } = screen.getPrimaryDisplay().workAreaSize;

    mainWindow = new BrowserWindow({
        width: WIDGET_W,
        height: WIDGET_H,
        x: Math.round((screenW - WIDGET_W) / 2),
        y: 40,
        transparent: true,
        frame: false,
        hasShadow: false,
        alwaysOnTop: true,
        skipTaskbar: false,
        resizable: false,
        type: process.platform === 'linux' ? 'dock' : 'panel',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.cjs'),
        },
    });

    mainWindow.setAlwaysOnTop(true, 'screen-saver');
    mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    mainWindow.setIgnoreMouseEvents(true, { forward: true });

    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    console.log('[Stealthy] Window created with stealth settings');
}

function createTray() {
    const iconPath = path.join(__dirname, '../public/icon.png');
    let trayIcon;
    
    try {
        trayIcon = nativeImage.createFromPath(iconPath);
        if (trayIcon.isEmpty()) {
            trayIcon = nativeImage.createEmpty();
        }
    } catch (e) {
        trayIcon = nativeImage.createEmpty();
    }

    tray = new Tray(trayIcon);

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show Stealthy',
            click: () => {
                mainWindow.show();
                mainWindow.setAlwaysOnTop(true, 'screen-saver');
            }
        },
        {
            label: 'Hide Stealthy',
            click: () => mainWindow.hide()
        },
        { type: 'separator' },
        {
            label: 'Stealth Mode',
            type: 'checkbox',
            checked: stealthMode,
            click: (menuItem) => {
                stealthMode = menuItem.checked;
                if (stealthMode) {
                    mainWindow.hide();
                    if (store) store.set('stealthMode', true);
                }
                if (mainWindow.webContents) {
                    mainWindow.webContents.send('stealth-mode-changed', stealthMode);
                }
            }
        },
        { type: 'separator' },
        {
            label: 'Quit',
            click: () => app.quit()
        }
    ]);

    tray.setToolTip('Stealthy - AI Meeting Assistant');
    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
        if (mainWindow.isVisible()) {
            mainWindow.hide();
        } else {
            mainWindow.show();
            mainWindow.setAlwaysOnTop(true, 'screen-saver');
        }
    });
}

app.whenReady().then(() => {
    createWindow();
    createTray();

    // Load saved stealth mode
    if (store) {
        stealthMode = store.get('stealthMode', false);
    }

    // Global shortcuts
    globalShortcut.register('CommandOrControl+Shift+S', () => {
        if (!mainWindow) return;
        if (mainWindow.isVisible()) {
            mainWindow.hide();
        } else {
            mainWindow.show();
            mainWindow.setAlwaysOnTop(true, 'screen-saver');
        }
        if (mainWindow.webContents) {
            mainWindow.webContents.send('toggle-visibility', mainWindow.isVisible());
        }
    });

    // Quick hide shortcut (double tap Escape)
    let escapeCount = 0;
    let escapeTimer = null;
    
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// IPC Handlers
ipcMain.handle('window-move', (_event, x, y) => {
    if (mainWindow) mainWindow.setPosition(Math.round(x), Math.round(y));
});

ipcMain.handle('window-get-position', () => {
    if (!mainWindow) return [0, 0];
    return mainWindow.getPosition();
});

ipcMain.handle('window-resize', (_event, w, h) => {
    if (mainWindow) mainWindow.setSize(Math.round(w), Math.round(h));
});

ipcMain.handle('minimize-to-tray', () => {
    if (mainWindow) mainWindow.hide();
});

ipcMain.handle('show-window', () => {
    if (!mainWindow) return;
    mainWindow.show();
    mainWindow.setAlwaysOnTop(true, 'screen-saver');
});

ipcMain.handle('set-ignore-mouse-events', (_event, ignore, options) => {
    if (mainWindow) {
        mainWindow.setIgnoreMouseEvents(ignore, options || { forward: true });
    }
});

ipcMain.handle('get-setting', (_event, key) => {
    return store ? store.get(key) : null;
});

ipcMain.handle('save-setting', (_event, key, value) => {
    if (store) store.set(key, value);
});

ipcMain.handle('set-stealth-mode', (_event, enabled) => {
    stealthMode = enabled;
    if (store) store.set('stealthMode', enabled);
    if (enabled && mainWindow) {
        mainWindow.hide();
    }
});

ipcMain.handle('get-stealth-mode', () => {
    return stealthMode;
});

// Get audio input devices
ipcMain.handle('get-audio-devices', async () => {
    const { desktopCapturer } = require('electron');
    const sources = await desktopCapturer.getSources({ 
        types: ['audio'],
        thumbnailSize: { width: 0, height: 0 }
    });
    return sources.map(source => ({
        id: source.id,
        name: source.name,
        appIcon: source.appIcon ? source.appIcon.toDataURL() : null
    }));
});

// Get screen sources for potential screen capture
ipcMain.handle('get-screen-sources', async () => {
    const { desktopCapturer } = require('electron');
    const sources = await desktopCapturer.getSources({ 
        types: ['window', 'screen'],
        thumbnailSize: { width: 320, height: 180 }
    });
    return sources.map(source => ({
        id: source.id,
        name: source.name,
        thumbnail: source.thumbnail.toDataURL()
    }));
});