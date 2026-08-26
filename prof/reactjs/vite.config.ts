import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'
import slugtree from 'slugtree/vite'

export default defineConfig({
  plugins: [slugtree(), react(), babel({ presets: [reactCompilerPreset()] })]
})
