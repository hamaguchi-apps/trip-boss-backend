function validateCPF(cpf: string): boolean {
  // Remove non-numeric characters
  cpf = cpf.replace(/[^\d]/g, '')

  // Check length
  if (cpf.length !== 11) return false

  // Check for all same digits
  if (/^(\d)\1{10}$/.test(cpf)) return false

  // Validate first digit
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i)
  }
  let remainder = (sum * 10) % 11
  if (remainder === 10) remainder = 0
  if (remainder !== parseInt(cpf.charAt(9))) return false

  // Validate second digit
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10) remainder = 0
  if (remainder !== parseInt(cpf.charAt(10))) return false

  return true
}

function validateCNPJ(cnpj: string): boolean {
  // Remove non-numeric characters
  cnpj = cnpj.replace(/[^\d]/g, '')

  // Check length
  if (cnpj.length !== 14) return false

  // Check for all same digits
  if (/^(\d)\1{13}$/.test(cnpj)) return false

  // Validate first digit
  let size = cnpj.length - 2
  let numbers = cnpj.substring(0, size)
  const digits = cnpj.substring(size)
  let sum = 0
  let pos = size - 7

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--
    if (pos < 2) pos = 9
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== parseInt(digits.charAt(0))) return false

  // Validate second digit
  size = size + 1
  numbers = cnpj.substring(0, size)
  sum = 0
  pos = size - 7

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--
    if (pos < 2) pos = 9
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== parseInt(digits.charAt(1))) return false

  return true
}

function validateDocument(document: string): string | undefined {
  // Remove non-numeric characters and leading zeros
  const cleanDoc = (document?.replace(/[^\d]/g, '') ?? '').replace(/^0+/, '')

  // Check if length is valid for either CPF or CNPJ
  if (cleanDoc.length > 14) return undefined

  // Try CPF last (11 digits)
  const cpfCandidate = cleanDoc.padStart(11, '0').slice(-11)
  if (validateCPF(cpfCandidate)) {
    return cpfCandidate
  }

  // Try CNPJ last (14 digits)
  const cnpjCandidate = cleanDoc.padStart(14, '0').slice(-14)
  if (validateCNPJ(cnpjCandidate)) {
    return cnpjCandidate
  }

  return undefined
}

export { validateCPF, validateCNPJ, validateDocument }
