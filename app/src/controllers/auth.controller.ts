import { Response } from 'express';
import { IsNotEmpty, IsString } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { Body, JsonController, Post, Res } from 'routing-controllers';
import { AppContext } from '../app';
import { User } from '../entities/User';
import { createToken } from '../lib/jwt';
import { hash, compare } from '../lib/hash';
import { ObjectId } from '@mikro-orm/mongodb';

class AccountDto {
    @JSONSchema({
        description: 'Username',
        example: 'customer',
    })
    @IsNotEmpty()
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

        logger.info(`user: ${JSON.stringify(userRegister, null, 4)}`);

        return res.status(201).json({
            status: true,
            message: 'Success register account',
        });
    }

    @Post('/login')
    async login(@Body() body: AccountDto, @Res() res: Response) {
        const em = AppContext.em;
        const logger = AppContext.logger;

        logger.info(`body: ${JSON.stringify(body, null, 4)}`);

        const userResult: User | null = await em.findOne(User, {
            username: body!.username,
        });

        if (userResult === null) {
            logger.info(`user not found: ${JSON.stringify(body.username, null, 4)}`);

            return res.status(422).json({
                status: false,
                message: 'Account not found',
            });
        }

        let userPin: string | undefined = userResult!.pin;

        if (typeof userPin === 'undefined') {
            logger.error(`error login userId: ${userResult?._id}`);

            return res.status(401).json({
                status: false,
                message: 'PIN not set',
            });
        }

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
}
