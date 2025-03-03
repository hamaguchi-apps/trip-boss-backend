import { ConfigLoaderService } from '@repo/typed-config'
import * as Convict from 'convict'
import { HttpModuleOptions } from '@nestjs/axios'

export interface GraphqlConfig {
  connection: {
    host: string
  }
}

export const GraphqlConfigSchema: Convict.Schema<GraphqlConfig> = {
  connection: {
    host: {
      env: 'GRAPHQL_HOST',
      doc: 'Graphql host',
      format: 'String',
      default: 'localhost',
      nullable: true,
    },
  },
}

export const getGraphqlConfig = (configLoader: ConfigLoaderService): HttpModuleOptions => {
  const config = configLoader.load(GraphqlConfigSchema)
  const graphqlConfig: GraphqlConfig = {
    connection: {
      host: config.get('connection.host'),
    },
  }
  return {
    baseURL: graphqlConfig.connection.host,
  }
}
