import { Request } from 'express';
import { ObjectId } from '@mikro-orm/mongodb';
import { User } from '../entities/User';

export interface UserInRequest extends Request {
    user: User;
}

export interface UserInToken {
    tokenId: string;
    tokenOwner: ObjectId;
}
