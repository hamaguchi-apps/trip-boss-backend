export interface NatsMessage<T> {
  id: string
  data: T
  pattern: string
}
