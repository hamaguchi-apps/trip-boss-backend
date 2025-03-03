import { registerNatsStreams } from '../infrastructure/nats/registerNatsStreams'

export const NatsConsumerOptions = {
  consumerOptions: {
    deliverGroup: 'sample-group',
    durable: 'sample-durable',
    deliverTo: 'sample',
    manualAck: true,
  },
}

export const initializeNatsStreams = () => {
  registerNatsStreams([{
    name: 'test',
    subjects: ['test.*'],
  }])
}
