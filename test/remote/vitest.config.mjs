import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    threads: false,
    testTimeout: 20000,
    hookTimeout: 20000
  }
})
