import { validateCPF, validateCNPJ, validateDocument } from './index'

describe('CPF/CNPJ Validation', () => {
  describe('validateCPF', () => {
    it('should validate a correct CPF', () => {
      expect(validateCPF('529.982.247-25')).toBe(true)
      expect(validateCPF('52998224725')).toBe(true)
    })

    it('should reject invalid CPF', () => {
      expect(validateCPF('111.111.111-11')).toBe(false)
      expect(validateCPF('123.456.789-10')).toBe(false)
    })

    it('should reject CPF with wrong length', () => {
      expect(validateCPF('1234567890')).toBe(false)
      expect(validateCPF('123456789012')).toBe(false)
    })

    it('should reject CPF with all same digits', () => {
      expect(validateCPF('00000000000')).toBe(false)
      expect(validateCPF('11111111111')).toBe(false)
      expect(validateCPF('22222222222')).toBe(false)
    })

    it('should handle CPF with special characters', () => {
      expect(validateCPF('529.982.247-25')).toBe(true)
      expect(validateCPF('529-982-247.25')).toBe(true)
    })
  })

  describe('validateCNPJ', () => {
    it('should validate a correct CNPJ', () => {
      expect(validateCNPJ('11.222.333/0001-81')).toBe(true)
      expect(validateCNPJ('11222333000181')).toBe(true)
    })

    it('should reject invalid CNPJ', () => {
      expect(validateCNPJ('11.222.333/0001-82')).toBe(false)
      expect(validateCNPJ('12345678901234')).toBe(false)
    })

    it('should reject CNPJ with wrong length', () => {
      expect(validateCNPJ('1234567890123')).toBe(false)
      expect(validateCNPJ('123456789012345')).toBe(false)
    })

    it('should reject CNPJ with all same digits', () => {
      expect(validateCNPJ('00000000000000')).toBe(false)
      expect(validateCNPJ('11111111111111')).toBe(false)
      expect(validateCNPJ('22222222222222')).toBe(false)
    })

    it('should handle CNPJ with special characters', () => {
      expect(validateCNPJ('11.222.333/0001-81')).toBe(true)
      expect(validateCNPJ('11-222-333.0001.81')).toBe(true)
    })
  })

  describe('validateDocument', () => {
    it('should validate and return clean CPF', () => {
      expect(validateDocument('529.982.247-25')).toBe('52998224725')
      expect(validateDocument('52998224725')).toBe('52998224725')
    })

    it('should validate and return clean CNPJ', () => {
      expect(validateDocument('11.222.333/0001-81')).toBe('11222333000181')
      expect(validateDocument('11222333000181')).toBe('11222333000181')
    })

    it('should return null for invalid documents', () => {
      expect(validateDocument('111.111.111-11')).toBe(undefined)
      expect(validateDocument('11.222.333/0001-82')).toBe(undefined)
      expect(validateDocument('123456')).toBe(undefined)
    })

    it('should handle documents with special characters', () => {
      expect(validateDocument('529.982.247-25')).toBe('52998224725')
      expect(validateDocument('11.222.333/0001-81')).toBe('11222333000181')
    })

    it('should return null for empty or invalid input', () => {
      expect(validateDocument('')).toBe(undefined)
      expect(validateDocument('abc')).toBe(undefined)
      expect(validateDocument('12345678901234567890')).toBe(undefined)
    })

    it('should handle undefined and null inputs', () => {
      expect(validateDocument(undefined as unknown as string)).toBe(undefined)
      expect(validateDocument(null as unknown as string)).toBe(undefined)
    })

    it('should handle documents with spaces', () => {
      expect(validateDocument('529 982 247 25')).toBe('52998224725')
      expect(validateDocument('11 222 333 0001 81')).toBe('11222333000181')
    })

    it('should handle documents with mixed special characters', () => {
      expect(validateDocument('529.982/247-25')).toBe('52998224725')
      expect(validateDocument('11/222.333-0001/81')).toBe('11222333000181')
    })

    it('should handle documents with leading/trailing spaces', () => {
      expect(validateDocument('  529.982.247-25  ')).toBe('52998224725')
      expect(validateDocument(' 11.222.333/0001-81 ')).toBe('11222333000181')
    })

    it('should handle cpf with trailing 0', () => {
      expect(validateDocument('000010223696870')).toBe('10223696870')
      expect(validateDocument('00006309899821')).toBe('06309899821')
    })

    it('should handle cnpj with trailing 0', () => {
      expect(validateDocument('013677907000131')).toBe('13677907000131')
      expect(validateDocument('050228291000148')).toBe('50228291000148')
    })
  })
})
