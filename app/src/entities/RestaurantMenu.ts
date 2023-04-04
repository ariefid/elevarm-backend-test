import { Entity, Property, PrimaryKey } from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';

@Entity({ tableName: 'restaurantMenus' })
export class RestaurantMenu {
    constructor(restaurantId: ObjectId, name: string) {
        this.restaurantId = restaurantId;
        this.name = name;
    }

    @PrimaryKey()
    _id!: ObjectId;

    @Property()
    restaurantId!: ObjectId;

    @Property()
    name!: string;

    @Property()
    price?: number;

    @Property({ nullable: true })
    createdAt?: Date = new Date();

    @Property({ nullable: true, onUpdate: () => new Date() })
    updatedAt?: Date = new Date();
}
