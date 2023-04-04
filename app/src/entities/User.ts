import { Entity, Property, PrimaryKey } from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';

@Entity({ tableName: 'users' })
export class User {
    constructor(_id: ObjectId, username: string, pin: string) {
        this._id = _id;
        this.username = username;
        this.pin = pin;
    }

    @PrimaryKey()
    _id!: ObjectId;

    @Property()
    username!: string;

    @Property()
    pin!: string;

    @Property({ nullable: true })
    phone?: string;

    @Property({ nullable: true })
    createdAt?: Date = new Date();

    @Property({ nullable: true, onUpdate: () => new Date() })
    updatedAt?: Date = new Date();
}
