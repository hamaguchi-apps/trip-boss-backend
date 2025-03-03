import { type Config, type ServiceUserCredentials } from './interfaces'
import { Injectable } from '@nestjs/common'
import { ClientError, Metadata, Status } from 'nice-grpc-common'

type Client = Awaited<ReturnType<typeof createClient>>
export type UserServiceClient = Client['user']
export type ManagementServiceClient = Client['management']
export type AdminServiceClient = Client['admin']
export type User = NonNullable<Awaited<ReturnType<UserServiceClient['getUserByID']>>['user']>
export type UserGrant = NonNullable<Awaited<ReturnType<ManagementServiceClient['getUserGrantByID']>>['userGrant']>
export type Org = NonNullable<Awaited<ReturnType<AdminServiceClient['listOrgs']>>['result'][number]>
export type Project = NonNullable<Awaited<ReturnType<ManagementServiceClient['listProjects']>>['result'][number]>
export type Role = 'user' | 'tenant' | 'reseller'

type MetadataEntry = {
  key: string
  value: Buffer
}

type GetUserRequest = {
  userId: string
  organizationId: string
}

type AddUserRequest = {
  organizationId: string
  userId: string
  username: string
  profile: {
    givenName: string
    familyName: string
  }
  email: {
    email: string
    isEmailVerified: boolean
  }
  password?: {
    password: string
    mustChangePassword: boolean
  }
  metadata: MetadataEntry[]
}

type GetOrAddUserRequest = AddUserRequest

type FindProjectRequest = {
  organizationId: string
}

type FindOrganizationRequest = {
  contains: string
}

type AddUserToProjectRequest = {
  organizationId: string
  userId: string
  projectId: string
  roles: Role[]
}

interface CreateKeyResponse {
  details: {
    id: string
    created: string
    changed: string
    owner: {
      type: 'OWNER_TYPE_UNSPECIFIED' | 'OWNER_TYPE_SYSTEM' | 'OWNER_TYPE_INSTANCE' | 'OWNER_TYPE_ORG'
      id: string
    }
  }
}


interface ActivateKeyResponse {
  details: {
    id: string
    created: string
    changed: string
    owner: {
      type: 'OWNER_TYPE_UNSPECIFIED' | 'OWNER_TYPE_SYSTEM' | 'OWNER_TYPE_INSTANCE' | 'OWNER_TYPE_ORG'
      id: string
    }
  }
}

async function createClient(baseURL: string, credentials: ServiceUserCredentials) {
  const { createAccessTokenInterceptor, createUserClient, createManagementClient, createOrganizationClient, createAdminClient, createOidcClient } = await import('@zitadel/node/dist/api/index.js')

  const tokenInterceptor = createAccessTokenInterceptor(credentials.pat)
  const userClient = createUserClient(baseURL, tokenInterceptor)
  const managementClient = createManagementClient(baseURL, tokenInterceptor)
  const organizationClient = createOrganizationClient(baseURL, tokenInterceptor)
  const adminClient = createAdminClient(baseURL, tokenInterceptor)
  const oidcClient = createOidcClient(baseURL, tokenInterceptor)

  return {
    admin: adminClient,
    user: userClient,
    management: managementClient,
    organization: organizationClient,
    oidc: oidcClient,
  }
}

async function getUser(client: UserServiceClient, req: GetUserRequest): Promise<User | undefined> {
  const metadata: Metadata = new Metadata()
  metadata.set('x-zitadel-orgid', req.organizationId)

  try {
    const get = await client.getUserByID({ userId: req.userId }, { metadata })
    return get.user
  }
  catch (error) {
    const isNotFound = error instanceof ClientError && error.code === Status.NOT_FOUND
    if (!isNotFound) throw error
    return undefined
  }
}

async function addUser(client: UserServiceClient, req: AddUserRequest): Promise<User | undefined> {
  const metadata: Metadata = new Metadata()
  metadata.set('x-zitadel-orgid', req.organizationId)

  const add = await client.addHumanUser(req, { metadata })

  return await getUser(client, { userId: add.userId, organizationId: req.organizationId })
}

async function findOrganization(client: AdminServiceClient, req: FindOrganizationRequest): Promise<Org | undefined> {
  const { TextQueryMethod } = await import('@zitadel/node/dist/api/generated/zitadel/object/v2/object.js')

  const res = await client.listOrgs({
    queries: [{
      nameQuery: {
        name: req.contains,
        method: TextQueryMethod.TEXT_QUERY_METHOD_CONTAINS_IGNORE_CASE,
      },
    }],
  })

  if (res.result.length === 0) return undefined
  return res.result[0]
}

async function findProject(client: ManagementServiceClient, req: FindProjectRequest): Promise<Project | undefined> {
  const metadata: Metadata = new Metadata()
  metadata.set('x-zitadel-orgid', req.organizationId)

  const res = await client.listProjects({}, { metadata })
  if (res.result.length === 0) return undefined
  if (res.result.length === 1) return res.result[0]

  const projects = res.result.filter(project => !/zitadel/i.test(project.name))
  return projects[0]
}

async function addUserToProject(client: ManagementServiceClient, req: AddUserToProjectRequest): Promise<void> {
  const metadata: Metadata = new Metadata()
  metadata.set('x-zitadel-orgid', req.organizationId)

  const grants = await client.listProjectGrants({ projectId: req.projectId }, { metadata })

  const grant = grants.result.find(grant => grant.grantedOrgName.includes('ZITADEL')) // search for main zitadel org

  const roles = req.roles.filter(role => grant?.grantedRoleKeys.includes(role))


  await client.addUserGrant({
    projectGrantId: grant?.grantId,
    projectId: req.projectId,
    userId: req.userId,
    roleKeys: roles,
  })
}

export type CreateUserRequest =
  Omit<GetOrAddUserRequest, 'organizationId'> &
  Pick<AddUserToProjectRequest, 'roles'> &
  { organization: { name: string } }

@Injectable()
export class ZitadelService {
  private client: Client | undefined
  constructor(private config: Config) { }

  private async getClient() {
    if (this.client) return this.client
    this.client = await createClient(this.config.baseUrl, {
      pat: this.config.pat,

    })
    return this.client
  }

  async isHealthy(): Promise<boolean> {
    try {
      const client = await this.getClient()
      const orgs = await client.admin.listOrgs({})
      return orgs.result.length > 0
    }
    catch (error) {
      return false
    }
  }

  async createUser(req: CreateUserRequest): Promise<User | undefined> {
    let org: Org | undefined
    let user: User | undefined
    let project: Project | undefined

    try {
      const client = await this.getClient()

      org = await findOrganization(client.admin, { contains: req.organization.name })
      if (!org) throw new Error('Organization not found')

      user = await getUser(client.user, { ...req, organizationId: org.id })
      console.debug('already exists', user)
      if (user) return user

      user = await addUser(client.user, { ...req, organizationId: org.id })
      if (!user) throw new Error('User not found')

      project = await findProject(client.management, { organizationId: org.id })
      if (!project) throw new Error('Project not found')

      await addUserToProject(client.management, {
        userId: user.userId,
        projectId: project.id,
        roles: req.roles,
        organizationId: org.id,
      })

      console.debug('createUser', {
        user,
      })

      return user
    }
    catch (error) {
      const { metadata, ...rest } = req
      console.warn({
        req: rest,
        org,
        user,
        project,
      })
      throw error
    }
  }

  async ensureActivateWebKeyFeature(): Promise<void> {
    await fetch(`${this.config.baseUrl}/v2/features/instance`, {
      method: 'PUT',
      body: JSON.stringify({
        web_key: true,
      }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.pat}`,
      },
    })
  }

  async refreshKeys(): Promise<{ responseCreateKey: CreateKeyResponse, responseActivateKey: ActivateKeyResponse, [key: string]: any }> {
    await this.ensureActivateWebKeyFeature()

    // {{baseUrl}}/resources/v3alpha/web_keys
    // http post to this endpoint with empty body
    const reqCreateKey = await fetch(`${this.config.baseUrl}/resources/v3alpha/web_keys`, {
      method: 'POST',
      body: JSON.stringify({}),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.pat}`,
      },
    })

    const responseCreateKey = await reqCreateKey.json() as CreateKeyResponse

    const reqActivateKey = await fetch(`${this.config.baseUrl}/resources/v3alpha/web_keys/${responseCreateKey.details.id}/_activate`, {
      method: 'POST',
      body: JSON.stringify({}),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.pat}`,
      },
    })

    const responseActivateKey = await reqActivateKey.json()

    return {
      responseCreateKey,
      responseActivateKey,
      url: this.config.baseUrl,
    }
  }
}
