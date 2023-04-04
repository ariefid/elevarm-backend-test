import { NextFunction, Response } from 'express';
import { AppContext } from '../app';
import { User } from '../entities/User';
import { verifyToken } from '../lib/jwt';
import { UserInRequest, UserInToken } from '../interfaces/auth.interface';

export const authMiddleware = async (req: UserInRequest, res: Response, next: NextFunction) => {
    let token: string | undefined | null = req!.cookies ? 'Authorization' in req!.cookies || 'authorization' in req!.cookies ? req!.cookies['Authorization'] || req!.cookies['authorization'] : null : req!.headers!.authorization?.split(' ')[1] ?? null;

    AppContext.logger.info(`token: ${token}`);

    if (token === undefined || token === null) {
        AppContext.logger.error('unauthorized');

        return res.status(401).send({
            status: false,
            message: 'Unauthorized',
        });
    }

    try {
        const decodedToken = verifyToken(token) as UserInToken;
        const user: User | null = await AppContext.em.findOne(User, { _id: decodedToken?.tokenOwner });

        if (user === null) {
            AppContext.logger.error(`unauthorized token: ${token}`);

            return res.status(401).send({
                status: false,
                message: 'Unauthorized',
            });
        }

        req.user = user;

        next();
    } catch (ex: any) {
        AppContext.logger.error(`invalid token: ${token}`);

        return res.status(401).send({
            status: false,
            message: 'Invalid Token',
        });
    }

};
