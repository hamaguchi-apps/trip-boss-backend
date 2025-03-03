/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */

/**
 * @typedef {Object} Metadata
 * @property {string} creationDate - The creation date of the metadata entry.
 * @property {string} changeDate - The change date of the metadata entry.
 * @property {string} resourceOwner - The resource owner ID.
 * @property {number} sequence - The sequence number of the metadata entry.
 * @property {string} key - The key of the metadata entry.
 * @property {Object} value - The value of the metadata entry.
 */

/**
 * @typedef {Object} MetadataResult
 * @property {number} count - The count of metadata entries.
 * @property {number} sequence - The sequence number.
 * @property {string} timestamp - The timestamp of the metadata.
 * @property {Array<Metadata>} metadata - An array of metadata objects.
 * @example
 * {
 *   "Count": 2,
 *   "Sequence": 0,
 *   "Timestamp": "0001-01-01T00:00:00Z",
 *   "Metadata": [
 *     {
 *       "CreationDate": "2024-12-13T06:31:57.940056Z",
 *       "ChangeDate": "2024-12-13T06:31:57.940056Z",
 *       "ResourceOwner": "286808071626358791",
 *       "Sequence": 13,
 *       "Key": "reseller_id",
 *       "Value": {}
 *     },
 *     {
 *       "CreationDate": "2024-12-13T06:31:57.940056Z",
 *       "ChangeDate": "2024-12-13T06:31:57.940056Z",
 *       "ResourceOwner": "286808071626358791",
 *       "Sequence": 12,
 *       "Key": "tenant_id",
 *       "Value": {}
 *     }
 *   ]
 * }
 */

/**
 * @typedef {Object} UserGrant
 * @property {string} id - The ID of the user grant.
 * @property {string} projectGrantId - The ID of the project grant.
 * @property {number} state - The state of the user grant (0: unspecified, 1: active, 2: inactive, 3: removed).
 * @property {Date} creationDate - The creation date of the user grant.
 * @property {Date} changeDate - The change date of the user grant.
 * @property {number} sequence - The sequence number of the user grant.
 * @property {string} userId - The ID of the user.
 * @property {Array<string>} roles - An array of roles assigned to the user.
 * @property {string} userResourceOwner - The ID of the organization of the user.
 * @property {string} userGrantResourceOwner - The ID of the organization where the user was granted.
 * @property {string} userGrantResourceOwnerName - The name of the organization where the user was granted.
 * @property {string} projectId - The ID of the project.
 * @property {string} projectName - The name of the project.
 * @property {function(): MetadataResult} getOrgMetadata - Function to get the metadata of the organization where the user was granted.
 */

/**
 * @typedef {Object} UserGrantList
 * @property {number} count - The number of user grants.
 * @property {number} sequence - The sequence number.
 * @property {Date} timestamp - The timestamp of the user grant list.
 * @property {Array<UserGrant>} grants - An array of user grants.
 * @property {function(): MetadataResult} grants[].getOrgMetadata - Function to get the metadata of the organization where the user was granted.
 */

/**
 * @typedef {Object} User
 * @property {function(): MetadataResult} getMetadata - Function to get user metadata.
 * @property {UserGrantList} grants - User grants.
 */

/**
 * @typedef {Object} Org
 * @property {function(): MetadataResult} getMetadata - Function to get org metadata.
 */

/**
 * @typedef {Object} Claims
 * @property {Object.<string, any>} [key] - Claims key-value pairs.
 */

/**
 * @typedef {Object} V1
 * @property {Claims} claims - Claims object.
 * @property {function(): User} getUser - Function to get User.
 * @property {User} user - User object.
 * @property {Org} org - Org object.
 */

/**
 * @typedef {Object} Ctx
 * @property {V1} v1 - V1 object.
 */

/**
 * @typedef {Object} ClaimApi
  * @property {function(string, any): void} setClaim - Function to get User.
 */


/**
 * @typedef {Object} ApiV1
 * @property {ClaimApi} claims - Claims object.
 */

/**
 * @typedef {Object} Api
 * @property {ApiV1} v1 - V1 object.
 */

let logger = require('zitadel/log')

/**
 * Set Hasura Claims
 *
 * Flow: Complement token, Trigger: Pre access token creation
 *
 * @param {Ctx} ctx - Context object.
 * @param {Api} api - API object.
 */
function add_hasura_claims(ctx, api) {
  if (ctx.v1.claims && ctx.v1.claims['https://hasura.io/jwt/claims']) {
    return
  }

  let roles = []
  ctx.v1.user.grants.grants.forEach(grant => {
    grant.roles.forEach(role => {
      roles.push(role)
    })
  })

  const orgMetadata = ctx.v1.org.getMetadata()
  const userMetadata = ctx.v1.user.getMetadata()
  const userId = ctx.v1.claims.sub
  const defaultRole = getDefaultRole(roles)
  const tenantId = getMetadata(orgMetadata, 'tenant_id')?.value || getMetadata(userMetadata, 'tenant_id')?.value
  const resellerId = getMetadata(orgMetadata, 'reseller_id')?.value || getMetadata(userMetadata, 'reseller_id')?.value

  const hasuraClaims = {
    'x-hasura-user-id': userId,
    'x-hasura-default-role': defaultRole,
    'x-hasura-allowed-roles': roles,
    'x-hasura-tenant-id': tenantId,
  }

  if (resellerId) {
    hasuraClaims['x-hasura-reseller-id'] = resellerId
  }

  api.v1.claims.setClaim('https://hasura.io/jwt/claims', hasuraClaims)
}

/**
 * Determines the default role based on the highest weight.
 *
 * @param {string[]} roles - An array of role names.
 * @returns {string|null} - The role with the highest weight, or null if no roles are provided.
 */
function getDefaultRole(roles) {
  if (!Array.isArray(roles) || roles.length === 0) return null

  const roleWeight = {
    user: 1,
    tenant: 2,
    reseller: 3,
    admin: 10,
  }

  const weights = roles.map(role => roleWeight[role] || 0)
  const maxWeight = Math.max(...weights)
  return roles[weights.indexOf(maxWeight)]
}

/**
 * Determines the default role based on the highest weight.
 *
 * @param {MetadataResult} metadata - Metadata object.
 * @param {string} key - The key to get the value from.
 * @returns {Metadata|null} - The role with the highest weight, or null if no roles are provided.
 */
function getMetadata(metadata, key) {
  if (!metadata || !metadata.metadata) return null
  return metadata.metadata.find(item => item.key === key)
}

