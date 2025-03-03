/* eslint-disable @typescript-eslint/no-namespace */
import { ModuleMetadata, Type } from '@nestjs/common'

export interface Config {
  baseUrl: string
  pat: string
}

export interface ServiceUserCredentials {
  pat: string
}

export interface ZitadelModuleOptions extends Pick<ModuleMetadata, 'imports'> {
  inject: any[]
  useFactory: (...args: any[]) => Config
}

export namespace UserService {
  export interface V2AddHumanUserRequest {
    userId?: string // optional
    username?: string // optional
    organization?: V2Organization // optional
    profile: V2SetHumanProfile // required
    email: V2SetHumanEmail // required
    phone?: V2SetHumanPhone // optional
    metadata?: V2SetMetadataEntry[] // optional
    password?: V2Password // optional
    hashedPassword?: V2HashedPassword // optional
    idpLinks?: V2IDPLink[] // optional
    totpSecret?: string // optional
  }

  export interface V2Organization {
    orgId?: string
    orgDomain?: string
  }

  export interface V2SetHumanProfile {
    givenName: string
    familyName: string
    nickName?: string
    displayName?: string
    preferredLanguage?: string
    gender?: V2Gender
    avatarUrl?: string
  }

  export interface V2SetHumanEmail {
    email: string
    isVerified?: boolean
  }

  export interface V2SetHumanPhone {
    phone: string
    isVerified?: boolean
  }

  export interface V2SetMetadataEntry {
    key: string
    value: string // Base64 encoded
  }

  export interface V2Password {
    password: string
    changeRequired?: boolean
  }

  export interface V2HashedPassword {
    hash: string
    changeRequired?: boolean
  }

  export interface V2IDPLink {
    idpId: string
    userId: string
    userName: string
  }

  export type V2Gender = 'GENDER_UNSPECIFIED' | 'GENDER_FEMALE' | 'GENDER_MALE' | 'GENDER_DIVERSE'
}
