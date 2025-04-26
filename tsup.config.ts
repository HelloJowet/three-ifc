import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/**/*.ts'],
  outDir: 'dist',
  format: ['esm', 'cjs'],
  splitting: false, // no code splitting
  sourcemap: true,
  clean: true,
  dts: true,
  minify: false, // optional: for readable output
  bundle: false, // 🔥 very important: disable bundling
})
