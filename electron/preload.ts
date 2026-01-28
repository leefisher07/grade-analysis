// Electron preload script
import { contextBridge } from 'electron'

contextBridge.exposeInMainWorld('electron', {
  platform: process.platform,
  version: process.versions.electron
})
