const { defineConfig } = require('cypress')

module.exports = defineConfig({
  viewportWidth: 1920,
  viewportHeight: 1080,
  e2e: {
    baseUrl: 'http://localhost/',
    supportFile: 'support/e2e.js',
    specPattern: 'e2e/**/*.spec.ts',
    testIsolation: false,
    setupNodeEvents(on, config) {
    }
  },
  video: false,
  screenshotOnRunFailure: false,
})
