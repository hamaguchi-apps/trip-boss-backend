import { jwtDecode } from 'jwt-decode'

export interface JwtPayload {
  'aud': string[]
  'exp': number
  'https://hasura.io/jwt/claims': HttpsHasuraIoJwtClaims
  'iat': number
  'iss': string
  'jti': string
  'nbf': number
  'sub': string
}

export interface HttpsHasuraIoJwtClaims {
  'x-hasura-allowed-roles': string[]
  'x-hasura-default-role': string
  'x-hasura-user-id': string
}

export const decodeJwt = (token: string): JwtPayload => {
  return jwtDecode<JwtPayload>(token)
}

export const getUserIdFromToken = (token: string): string | undefined => {
  const decodedToken = decodeJwt(token)
  return decodedToken['https://hasura.io/jwt/claims']?.['x-hasura-user-id']
}

export const getUserIdFromJwt = (jwt: JwtPayload): string | undefined => {
  return jwt['https://hasura.io/jwt/claims']?.['x-hasura-user-id']
}
