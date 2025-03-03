import { Test, TestingModule } from '@nestjs/testing'
import { ZitadelService } from '../zitadel.service'
import { ZITADEL_MODULE_SERVICE } from '@repo/zitadel'
import { Logger } from '@nestjs/common'

describe('ZitadelService', () => {
  let service: ZitadelService
  let zitadelModuleService: any
  let logger: Logger

  beforeEach(async () => {
    zitadelModuleService = {
      isHealthy: jest.fn(),
      refreshKeys: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ZitadelService,
        {
          provide: ZITADEL_MODULE_SERVICE,
          useValue: zitadelModuleService,
        },
      ],
    }).compile()

    service = module.get<ZitadelService>(ZitadelService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('isHealthy', () => {
    it('should return true when zitadel service is healthy', async () => {
      zitadelModuleService.isHealthy.mockResolvedValue(true)

      const result = await service.isHealthy()

      expect(result).toBe(true)
      expect(zitadelModuleService.isHealthy).toHaveBeenCalled()
    })

    it('should return false when zitadel service is not healthy', async () => {
      zitadelModuleService.isHealthy.mockResolvedValue(false)

      const result = await service.isHealthy()

      expect(result).toBe(false)
      expect(zitadelModuleService.isHealthy).toHaveBeenCalled()
    })

    it('should propagate errors from zitadel service', async () => {
      const error = new Error('Zitadel service error')
      zitadelModuleService.isHealthy.mockRejectedValue(error)

      await expect(service.isHealthy()).rejects.toThrow(error)
    })
  })

  describe('refreshKeys', () => {
    it('should successfully refresh keys', async () => {
      const mockResponse = { success: true }
      zitadelModuleService.refreshKeys.mockResolvedValue(mockResponse)

      await service.refreshKeys()

      expect(zitadelModuleService.refreshKeys).toHaveBeenCalled()
    })

    it('should propagate errors when refreshing keys fails', async () => {
      const error = new Error('Failed to refresh keys')
      zitadelModuleService.refreshKeys.mockRejectedValue(error)

      await expect(service.refreshKeys()).rejects.toThrow(error)
    })
  })
})
