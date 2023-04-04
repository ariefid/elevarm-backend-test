import { ObjectId } from '@mikro-orm/mongodb';
import { Jwt, JwtPayload, sign, verify } from 'jsonwebtoken'
import { JWT_SECRET_KEY, JWT_EXPIRES_IN } from '../config';
import { User } from '../entities/User';

export function createToken(user: User): string {
    return sign({ tokenId: new ObjectId(), tokenOwner: user!._id }, JWT_SECRET_KEY as string, { expiresIn: JWT_EXPIRES_IN as string, subject: 'from-backend' });
}

export function verifyToken(token: string): Jwt | JwtPayload | string {
    return verify(token, JWT_SECRET_KEY as string);
}
