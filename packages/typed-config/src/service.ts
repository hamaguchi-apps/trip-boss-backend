import * as Convict from 'convict'

export class TypedConfigService<E> {
  constructor(public config: Convict.Config<E>) {}

  get<T extends Convict.Path<E>>(propertyPath: T): Convict.PathValue<E, T> {
    return this.config.get(propertyPath) as Convict.PathValue<E, T>
  }
}
