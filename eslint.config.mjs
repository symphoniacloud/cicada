import eslint from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import tseslint from 'typescript-eslint'

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  [globalIgnores(['src/web/js/htmx.min.js'])],
  {
    languageOptions: {
      globals: {
        // Browser APIs
        document: 'readonly',
        localStorage: 'readonly',
        window: 'readonly',
        fetch: 'readonly',
        XMLHttpRequest: 'readonly',
        DOMParser: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly'
      }
    },
    rules: {
      // Add any specific rules you want to override here
    }
  }
)
