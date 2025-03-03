import { createDefaultPreset, type JestConfigWithTsJest } from 'ts-jest'

const presetConfig = createDefaultPreset({

})

const jestConfig: JestConfigWithTsJest = {
  ...presetConfig,
  passWithNoTests: true,
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  testPathIgnorePatterns: ['.(integration|e2e).*'],
  transformIgnorePatterns: [
    '/data-access',
    '/redecard',
    '/utils',
    '/contracts',
    '/adiq',
    '/gsurf',
    '/phoebus',
    '/typed-config',
    'node_modules',
  ],
}

export default jestConfig
