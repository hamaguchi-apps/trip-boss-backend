import Ajv, { ValidateFunction } from 'ajv'
import ajvFormats from 'ajv-formats'
import draft06 from 'ajv/dist/refs/json-schema-draft-06.json'
import fs from 'fs/promises'
import path from 'path'

/**
 * ValidatorService class for managing JSON schema validation.
 */
export default class ValidatorService {
  /** Ajv instance for JSON schema compilation and validation */
  private ajv: Ajv
  /** Record of compiled validation functions for each schema */
  private schemas: Record<string, ValidateFunction> = {}

  /**
   * Initializes the ValidatorService with Ajv instance and meta-schema.
   */
  constructor() {
    this.ajv = new Ajv({ allErrors: true, code: { esm: true } })
    this.ajv.addMetaSchema(draft06)
    ajvFormats(this.ajv)
  }

  /**
   * Loads JSON schema files from the local 'schemas' directory.
   * @returns {Promise<any[]>} A promise that resolves to an array of loaded schemas.
   */
  async localSchemaLoader() {
    const schemaDir = path.join(__dirname, 'schemas')
    const schemaFiles = await fs.readdir(schemaDir)

    const result = await Promise.all(
      schemaFiles
        .filter((file: string) => path.extname(file).toLowerCase() === '.json')
        .map(async (file: string) => {
          const filePath = path.join(schemaDir, file)
          const content = await fs.readFile(filePath, 'utf-8')
          const parsedSchema = JSON.parse(content)
          const schemaName = path.basename(file, '.json')

          this.schemas[schemaName] = this.ajv.compile(parsedSchema)

          return { name: schemaName, schema: parsedSchema }
        }),
    )

    return result
  }

  /**
   * Initializes the ValidatorService by loading local schemas.
   * @returns {Promise<void>}
   */
  async initialize() {
    await this.localSchemaLoader()
  }

  /**
   * Adds new schemas to the ValidatorService.
   * @param {Record<string, Object>} schemas - An object containing schema names and their corresponding JSON schemas.
   * @returns {Promise<void>}
   */
  async addSchemas(schemas: Record<string, object>) {
    for (const [
      schemaName, schema,
    ] of Object.entries(schemas)) {
      this.schemas[schemaName] = this.ajv.compile(schema)
    }
  }

  /**
   * Validates data against a specified schema.
   * @param {string} schemaName - The name of the schema to validate against.
   * @param {any} data - The data to be validated.
   * @returns {Promise<{valid: boolean, errors: ErrorObject[]}>} A promise that resolves to an object containing the validation result and any errors.
   * @throws {Error} If the specified schema is not found.
   */
  async validate(schemaName: string, data: any) {
    const validate = this.schemas[schemaName]
    if (!validate) {
      throw new Error(`Schema ${schemaName} not found`)
    }

    return {
      valid: validate(data),
      errors: validate.errors,
    }
  }
}
