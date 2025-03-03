import ValidatorService from '../validatorService'
import fs from 'fs/promises'

jest.mock('fs/promises')

describe('ValidatorService', () => {
  let validatorService: ValidatorService

  beforeEach(() => {
    validatorService = new ValidatorService()
  })

  describe('localSchemaLoader', () => {
    it('should load and parse JSON schema files from the schemas directory', async () => {
      const mockSchemaFiles = [
        'test1.json',
        'test2.json',
        'notJson.txt',
      ]
      const mockSchemaContent1 = '{"type": "object", "properties": {"name": {"type": "string"}}}'
      const mockSchemaContent2 = '{"type": "array", "items": {"type": "number"}}';

      (fs.readdir as jest.Mock).mockResolvedValue(mockSchemaFiles);
      (fs.readFile as jest.Mock).mockImplementation(filePath => {
        if (filePath.endsWith('test1.json')) return Promise.resolve(mockSchemaContent1)
        if (filePath.endsWith('test2.json')) return Promise.resolve(mockSchemaContent2)
        return Promise.reject(new Error('Unexpected file'))
      })

      const result = await validatorService.localSchemaLoader()

      expect(result).toEqual([
        { name: 'test1', schema: JSON.parse(mockSchemaContent1) },
        { name: 'test2', schema: JSON.parse(mockSchemaContent2) },
      ])

      expect(fs.readFile).toHaveBeenCalledTimes(2)
    })

    it('should handle errors when reading schema files', async () => {
      (fs.readdir as jest.Mock).mockResolvedValue(['error.json']);
      (fs.readFile as jest.Mock).mockRejectedValue(new Error('File read error'))

      await expect(validatorService.localSchemaLoader()).rejects.toThrow('File read error')
    })

    it('should return an empty array when no JSON files are found', async () => {
      (fs.readdir as jest.Mock).mockResolvedValue(['notJson.txt'])

      const result = await validatorService.localSchemaLoader()

      expect(result).toEqual([])
    })
  })

  describe('initialize', () => {
    it('should call localSchemaLoader', async () => {
      const localSchemaLoaderSpy = jest.spyOn(validatorService, 'localSchemaLoader').mockResolvedValue([])
      await validatorService.initialize()
      expect(localSchemaLoaderSpy).toHaveBeenCalled()
    })
  })

  describe('validate', () => {
    it('should throw an error if the specified schema is not found', async () => {
      const schemaName = 'nonExistentSchema'
      const mockData = { name: 'Test' }

      await expect(validatorService.validate(schemaName, mockData)).rejects.toThrow(`Schema ${schemaName} not found`)
    })

    it('should validate data against a specified schema', async () => {
      await validatorService.addSchemas({
        test1: {
          $schema: 'http://json-schema.org/draft-06/schema#',
          type: 'object',
          additionalProperties: true,
          properties: {
            integer: {
              type: ['integer'],
            },
            string: {
              type: ['string'],
            },
            date: {
              type: ['string'],
              format: 'date',
            },
          },
          required: [
            'integer',
            'string',
            'date',
          ],
        },
      })

      await expect(
        validatorService.validate('test1', {
          integer: 1,
          string: 'test',
          date: '2024-01-01',
        }),
      ).resolves.toMatchObject({
        valid: true,
        errors: null,
      })
    })

    it('should throw error when schema does not validate', async () => {
      await validatorService.addSchemas({
        test1: {
          $schema: 'http://json-schema.org/draft-06/schema#',
          type: 'object',
          additionalProperties: true,
          properties: {
            integer: {
              type: ['integer'],
            },
            string: {
              type: ['string'],
            },
            date: {
              type: ['string'],
              format: 'date',
            },
          },
          required: [
            'integer',
            'string',
            'date',
          ],
        },
      })

      await expect(
        validatorService.validate('test1', {
          string: 'test',
          date: '2024-01-01',
        }),
      ).resolves.toMatchObject({
        valid: false,
        errors: [{
          instancePath: '',
          keyword: 'required',
          message: 'must have required property \'integer\'',
          params: {
            missingProperty: 'integer',
          },
          schemaPath: '#/required',
        }],
      })
    })
  })
})
