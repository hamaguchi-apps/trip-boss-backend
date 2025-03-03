import { ConfigLoaderService } from '@repo/typed-config'
import * as Convict from 'convict'

export interface ItineraryGeneratorConfig {
  serpApiKey: string
  openAiApiKey: string
  openAiOrgId: string
  openAiProjectId: string
  openAiAssistantId: string
  geocodingApiKey: string
}

export const ItineraryGeneratorConfigSchema: Convict.Schema<ItineraryGeneratorConfig> = {
  serpApiKey: {
    env: 'SERP_API_KEY',
    doc: 'Serp api key',
    format: 'String',
    default: null,
    nullable: true,
  },
  geocodingApiKey: {
    env: 'GEOCODING_API_KEY',
    doc: 'Geocoding api key',
    format: 'String',
    default: null,
    nullable: true,
  },
  openAiApiKey: {
    env: 'OPENAI_API_KEY',
    doc: 'Open ai api key',
    format: 'String',
    default: null,
    nullable: true,
  },
  openAiOrgId: {
    env: 'OPENAI_ORG_ID',
    doc: 'Open ai org id',
    format: 'String',
    default: null,
    nullable: true,
  },
  openAiProjectId: {
    env: 'OPENAI_PROJECT_ID',
    doc: 'Open ai project id',
    format: 'String',
    default: null,
    nullable: true,
  },
  openAiAssistantId: {
    env: 'OPENAI_ASSISTANT_ID',
    doc: 'Open ai assistant id',
    format: 'String',
    default: null,
    nullable: true,
  },
}

export function getConfig(configLoader: ConfigLoaderService): ItineraryGeneratorConfig {
  const config = configLoader.load(ItineraryGeneratorConfigSchema)
  return {
    serpApiKey: config.get('serpApiKey'),
    openAiApiKey: config.get('openAiApiKey'),
    openAiOrgId: config.get('openAiOrgId'),
    openAiProjectId: config.get('openAiProjectId'),
    openAiAssistantId: config.get('openAiAssistantId'),
    geocodingApiKey: config.get('geocodingApiKey'),
  }
}
