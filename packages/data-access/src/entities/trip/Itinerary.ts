import { Entity, type Opt, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ schema: 'trip' })
export class Itinerary {

  @PrimaryKey({ type: 'uuid', defaultRaw: `uuid_generate_v4()` })
  id!: string & Opt;

  @Property({ type: 'json', nullable: true })
  content?: any;

  @Property({ type: 'boolean', nullable: true })
  active?: boolean = true;

  @Property({ nullable: true, defaultRaw: `now()` })
  createdAt?: Date;

  @Property({ nullable: true, defaultRaw: `now()` })
  updatedAt?: Date;

}
