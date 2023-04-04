import { Entity, Property, PrimaryKey, Enum, ArrayType } from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';

@Entity({ tableName: 'transactions' })
export class Transaction {
    constructor(userId: ObjectId, serviceFrom: TransactionServiceFrom, detail: string[]) {
        this.userId = userId;
        this.serviceFrom = serviceFrom;
        this.detail = detail;
    }

    @PrimaryKey()
    _id!: ObjectId;

    @Property()
    userId!: ObjectId;

    @Enum(() => TransactionServiceFrom)
    serviceFrom!: TransactionServiceFrom;

    @Property({ type: ArrayType })
    detail!: string[];

    @Property({ nullable: true })
    createdAt?: Date = new Date();

    @Property({ nullable: true, onUpdate: () => new Date() })
    updatedAt?: Date = new Date();
}

export enum TransactionServiceFrom {
    GORIDE = 'goride',
    GOFOOD = 'gofood',
}
