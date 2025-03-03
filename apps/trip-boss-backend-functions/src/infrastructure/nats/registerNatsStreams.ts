import { NatsStreamConfig } from '@repo/nestjs-nats-jetstream-transport'

const streams: NatsStreamConfig[] = []

export const registerNatsStreams = (streamConfigs: NatsStreamConfig[]) => {
  streams.push(...(streamConfigs ?? []))
}

export const getNatsStreams = () => streams
