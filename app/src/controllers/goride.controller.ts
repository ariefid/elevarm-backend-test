import { Response } from 'express';
import { IsNotEmpty, IsString, validate } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { Body, Delete, Get, JsonController, Param, Patch, Post, Put, Req, Res, UseBefore } from 'routing-controllers';
import { ObjectId } from '@mikro-orm/mongodb';
import { AppContext } from '../app';
import { authMiddleware } from '../middlewares/auth.middleware';
import { Transaction, TransactionServiceFrom } from '../entities/Transaction';
import { UserInRequest } from '../interfaces/auth.interface';

class GorideDto {
    @JSONSchema({
        description: 'Pickup Location',
        example: '-7.302260,112.739041',
    })
    @IsNotEmpty()
    @IsString()
    pickUpLocation!: string;

    @JSONSchema({
        description: 'Destination Location',
        example: '-7.297260,112.738375',
    })
    @IsNotEmpty()
    @IsString()
    toLocation!: string;
}

@JsonController('/goride')
@UseBefore(authMiddleware)
export default class GorideController {
    @Get('/')
    async getAllGoRide(@Res() res: Response) {
        const logger = AppContext.logger;
        const em = AppContext.em;
        const transactionServiceFrom = TransactionServiceFrom.GORIDE;

        const repo = em.getRepository(Transaction);
        const transaction = await repo.find({
            serviceFrom: { $in: [transactionServiceFrom] },
        });

        logger.info(`load data goride from transaction: ${transaction}`);

        res.status(200).json({
            status: true,
            message: '',
            data: transaction,
        });

        return;
    }

    @Get('/detail/:id')
    async getDetailGoRide(@Param('id') param: string, @Res() res: Response) {
        const logger = AppContext.logger;
        const em = AppContext.em;
        const transactionServiceFrom = TransactionServiceFrom.GORIDE;

        const _id = new ObjectId(param);
        const repo = em.getRepository(Transaction);
        const transaction = await repo.find({
            _id: { $in: [_id] },
            serviceFrom: { $in: [transactionServiceFrom] },
        });

        logger.info(`load data goride from transaction: ${transaction}`);

        res.status(200).json({
            status: true,
            message: '',
            data: transaction,
        });

        return;
    }

    @Post('/create')
    async createGoRide(@Req() req: UserInRequest, @Body() body: GorideDto, @Res() res: Response) {
        const logger = AppContext.logger;
        const em = AppContext.em;

        validate(body).then(errors => {
            if (errors.length > 0) {
                logger.error(`body error: ${errors}`);

                res.status(400).json({
                    status: false,
                    message: errors,
                });

                return;
            }
        });

        logger.info(`body: ${JSON.stringify(body, null, 4)}`);

        const userId = new ObjectId(req.user._id);
        const pickUpLocation: string = body!.pickUpLocation;
        const toLocation: string = body!.toLocation;
        const price: number = Math.floor(Math.random() * (50000 - 1000 + 1)) + 1000;
        const transactionServiceFrom = TransactionServiceFrom.GORIDE;
        const detail: {} = {
            pickUpLocation,
            toLocation,
            price,
        };

        const transaction: Transaction = em.create(Transaction, {
            _id: new ObjectId(),
            userId: userId,
            detail: detail,
            serviceFrom: transactionServiceFrom,
        });

        await em.persistAndFlush([transaction]);

        logger.info(`new goride: ${JSON.stringify(transaction, null, 4)}`);

        res.status(200).json({
            status: true,
            message: 'Success create order',
        });

        return;
    }

    @Put('/edit/:id')
    @Patch('/edit/:id')
    async updateGoRide(@Param('id') param: string, @Body() body: GorideDto, @Res() res: Response) {
        const logger = AppContext.logger;
        const em = AppContext.em;

        validate(body).then(errors => {
            if (errors.length > 0) {
                logger.error(`body error: ${errors}`);

                res.status(400).json({
                    status: false,
                    message: errors,
                });

                return;
            }
        });

        logger.info(`body: ${JSON.stringify(body, null, 4)}`);

        const _id = new ObjectId(param);
        const pickUpLocation: string = body!.pickUpLocation;
        const toLocation: string = body!.toLocation;
        const price: number = Math.floor(Math.random() * (50000 - 1000 + 1)) + 1000;
        const transactionServiceFrom = TransactionServiceFrom.GORIDE;
        const detail: {} = {
            pickUpLocation,
            toLocation,
            price,
        };

        const transactionResult: Transaction | null = await em.findOne(Transaction, {
            _id: _id,
            serviceFrom: transactionServiceFrom,
        });

        if (transactionResult === null) {
            logger.info(`goride transaction id not found: ${JSON.stringify(_id, null, 4)}`);

            res.status(422).json({
                status: false,
                message: 'Failed update order',
            });

            return;
        }

        transactionResult.detail = detail;
        await em.persistAndFlush(transactionResult);

        logger.info(`update goride: ${JSON.stringify(transactionResult, null, 4)}`);

        res.status(200).json({
            status: true,
            message: 'Success update order',
        });

        return;
    }

    @Delete('/delete/:id')
    async deleteGoRide(@Param('id') param: string, @Res() res: Response) {
        const logger = AppContext.logger;
        const em = AppContext.em;

        const _id = new ObjectId(param);
        const transactionServiceFrom = TransactionServiceFrom.GORIDE;

        const transactionResult: Transaction | null = await em.findOne(Transaction, {
            _id: _id,
            serviceFrom: transactionServiceFrom,
        });

        if (transactionResult === null) {
            logger.info(`goride transaction id not found: ${JSON.stringify(_id, null, 4)}`);

            res.status(422).json({
                status: false,
                message: 'Failed delete order',
            });

            return;
        }

        await em.removeAndFlush(transactionResult);

        logger.info(`delete goride: ${JSON.stringify(transactionResult, null, 4)}`);

        res.status(200).json({
            status: true,
            message: 'Success delete order',
        });

        return;
    }
}
