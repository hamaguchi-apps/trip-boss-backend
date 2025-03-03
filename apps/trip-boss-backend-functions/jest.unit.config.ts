import { createDefaultPreset, type JestConfigWithTsJest } from 'ts-jest'

const presetConfig = createDefaultPreset({
 diagnostics: true
})

const jestConfig: JestConfigWithTsJest = {
  ...presetConfig,
  passWithNoTests: true,
  testPathIgnorePatterns: [
    '.(integration|e2e).*',
    '<rootDir>/dist/',
    '/data-access/',
    '/redecard/',
    '/utils/',
    '/contracts/',
    '/adiq/',
    '/gsurf/',
    '/phoebus/',
    '/typed-config/',
  ]
}

export default jestConfig
