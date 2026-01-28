import { defineConfig } from 'vite'
<<<<<<< HEAD
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'
=======
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron/simple'
import { resolve } from 'path'
>>>>>>> b56face1a95cd2b8af20261f4b81aced32df9c5e

// https://vite.dev/config/
export default defineConfig({
  plugins: [
<<<<<<< HEAD
    react(),
    viteSingleFile()
  ],
  build: {
    cssCodeSplit: false,
    assetsInlineLimit: 100000000, // 100MB，内联所有资源
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})
=======
    vue(),
    electron({
      main: {
        entry: 'electron/main.ts',
      },
      preload: {
        input: 'electron/preload.ts',
      },
      renderer: {},
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  base: './', // 重要：使用相对路径，确保打包后可以正常加载资源
})
>>>>>>> b56face1a95cd2b8af20261f4b81aced32df9c5e
