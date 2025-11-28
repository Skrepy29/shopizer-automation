const { defineConfig } = require('cypress')
const fs = require('fs')
const path = require('path')
const Papa = require('papaparse')


function parseCsvToRows(fullPath) {
  const csv = fs.readFileSync(fullPath, 'utf8')
  const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true })

  return parsed.data.map((row) => {
    const cleaned = {}
    for (const k in row) {
      const key = String(k).trim()
      const val = typeof row[k] === 'string' ? row[k].trim() : row[k]
      cleaned[key] = val
    }
    return cleaned
  })
}

module.exports = defineConfig({
  viewportWidth: 1920,
  viewportHeight: 1080,
  e2e: {
    baseUrl: 'http://localhost/',
    supportFile: 'support/e2e.js',
    specPattern: [
          'e2e/all.spec.ts',
          'e2e/register.spec.ts',
          'e2e/myAccount.spec.ts',
          'e2e/login.spec.ts',
          'e2e/addTables.spec.ts',
          'e2e/addChairs.spec.ts',
          'e2e/checkCartItems.spec.ts',
          'e2e/cleanup.spec.ts',
        ],    
    testIsolation: false,

    setupNodeEvents(on, config) {
      const usersCsv = path.join(__dirname, 'utils', 'values.csv')
      if (fs.existsSync(usersCsv)) {
        config.env.registerRows = parseCsvToRows(usersCsv)
      } else {
        config.env.registerRows = []
      }

      const tablesCsv = path.join(__dirname, 'utils', 'tables.csv')
      if (fs.existsSync(tablesCsv)) {
        config.env.tablesRows = parseCsvToRows(tablesCsv)
      } else {
        config.env.tablesRows = []
      }

      return config
    },
  },
  video: false,
  screenshotOnRunFailure: false,
})
