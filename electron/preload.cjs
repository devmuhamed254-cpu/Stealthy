const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // Window control
    moveWindow: (x, y) => ipcRenderer.invoke('window-move', x, y),
    windowMove: (x, y) => ipcRenderer.invoke('window-move', x, y),
    windowGetPosition: () => ipcRenderer.invoke('window-get-position'),
    resizeWindow: (w, h) => ipcRenderer.invoke('window-resize', w, h),
    minimizeToTray: () => ipcRenderer.invoke('minimize-to-tray'),
    showWindow: () => ipcRenderer.invoke('show-window'),
    setIgnoreMouseEvents: (ignore, options) => ipcRenderer.invoke('set-ignore-mouse-events', ignore, options),

    // Settings
    getSetting: (key) => ipcRenderer.invoke('get-setting', key),
    saveSetting: (key, value) => ipcRenderer.invoke('save-setting', key, value),

    // Stealth mode
    setStealthMode: (enabled) => ipcRenderer.invoke('set-stealth-mode', enabled),
    getStealthMode: () => ipcRenderer.invoke('get-stealth-mode'),

    // Audio
    getAudioDevices: () => ipcRenderer.invoke('get-audio-devices'),
    getScreenSources: () => ipcRenderer.invoke('get-screen-sources'),

    // Event listeners
    onToggleVisibility: (callback) => {
        ipcRenderer.on('toggle-visibility', (_event, isVisible) => callback(isVisible));
    },
    onStealthModeChanged: (callback) => {
        ipcRenderer.on('stealth-mode-changed', (_event, isStealth) => callback(isStealth));
    },
});