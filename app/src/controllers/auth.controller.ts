import { Response } from 'express';
import { IsNotEmpty, IsString } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { Body, Get, JsonController, Post, Req, Res, UseBefore } from 'routing-controllers';
import { ObjectId } from '@mikro-orm/mongodb';
import { AppContext } from '../app';
import { User } from '../entities/User';
import { createToken } from '../lib/jwt';
import { hash, compare } from '../lib/hash';
import { UserInRequest } from '../interfaces/auth.interface';
import { authMiddleware } from '../middlewares/auth.middleware';

class AccountDto {
    @JSONSchema({
        description: 'Username',
        example: 'customer',
    })
    @IsNotEmpty()
    @IsString()
    username!: string;

    @JSONSchema({
        description: 'PIN',
        example: '112233',
    })
    @IsNotEmpty()
    @IsString()
    pin!: string;
}

@JsonController('/auth')
export default class AuthController {
    @Post('/register')
    async register(@Body() body: AccountDto, @Res() res: Response) {
        const em = AppContext.em;
        const logger = AppContext.logger;

        logger.info(`body: ${JSON.stringify(body, null, 4)}`);

        const userResult: User | null = await em.findOne(User, {
            username: body!.username,
        });

        if (userResult !== null) {
            logger.error(`user already register: ${JSON.stringify(userResult, null, 4)}`);

            return res.status(422).json({
                status: false,
                message: 'Failed register account',
            });
        }

        const hashPin = await hash(body!.pin);
        const userRegister: User = em.create(User, {
            _id: new ObjectId(),
            username: body!.username,
            pin: hashPin,
        });

        await em.insert(userRegister);

        logger.info(`new registered user: ${JSON.stringify(userRegister, null, 4)}`);

        return res.status(201).json({
            status: true,
            message: 'Success register account',
        });
    }

    @Post('/login')
    async createLogin(@Body() body: AccountDto, @Res() res: Response) {
        const em = AppContext.em;
        const logger = AppContext.logger;

        logger.info(`body: ${JSON.stringify(body, null, 4)}`);

        const userResult: User | null = await em.findOne(User, {
            username: body!.username,
        });

        if (userResult === null) {
            logger.info(`user login not found: ${JSON.stringify(body.username, null, 4)}`);

            return res.status(422).json({
                status: false,
                message: 'Username or PIN incorrect',
            });
        }

        let userPin: string = userResult!.pin;
        let comparePin: boolean = await compare(body.pin, userPin);

        if (!comparePin) {
            logger.error(`error login userId: ${userResult?._id}`);

            return res.status(422).json({
                status: false,
                message: 'Username or PIN incorrect',
            });
        }

        const token = createToken(userResult as User);

        logger.info(`success login userId: ${userResult?._id}`);

        return res.status(200).json({
            status: true,
            message: 'Token created',
            data: {
                id: userResult?._id,
                username: userResult?.username,
            },
            authorization: {
                type: 'bearer',
                token: token,
            },
        });
    }

    @Get('/me')
    @UseBefore(authMiddleware)
    async me(@Req() req: UserInRequest, @Res() res: Response) {
        const em = AppContext.em;
        const logger = AppContext.logger;

        const _id = new ObjectId(req.user._id);

        const userResult: User | null = await em.findOne(User, {
            _id: _id,
        });

        if (userResult === null) {
            return res.status(422).json({
                status: false,
                message: 'User not found',
            });
        }

        logger.info(`success retrive userId: ${userResult?._id}`);

        return res.status(200).json({
            status: true,
            message: '',
            data: {
                id: userResult?._id,
                username: userResult?.username,
                phone: userResult?.phone,
                createdAt: userResult?.createdAt,
                updatedAt: userResult?.updatedAt,
            },
        });
    }
}
