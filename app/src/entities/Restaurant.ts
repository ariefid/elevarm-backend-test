import { Entity, Property, PrimaryKey } from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';

@Entity({ tableName: 'restaurants' })
export class Restaurant {
    constructor(name: string) {
        this.name = name;
    }

    @PrimaryKey()
    _id!: ObjectId;

    @Property()
    name!: string;

    @Property({ nullable: true })
    address?: string;

    @Property({ nullable: true })
    phone?: string;

    @Property({ nullable: true })
    createdAt?: Date = new Date();

    @Property({ nullable: true, onUpdate: () => new Date() })
    updatedAt?: Date = new Date();
}
