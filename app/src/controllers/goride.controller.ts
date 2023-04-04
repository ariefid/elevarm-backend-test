import { Response } from 'express';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
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

    @JSONSchema({
        description: 'Price',
        example: '2000',
    })
    @IsNotEmpty()
    @IsNumber()
    price!: number;
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

        return res.status(200).json({
            status: true,
            message: '',
            data: transaction,
        });
    }

    @Post('/create')
    async createGoRide(@Req() req: UserInRequest, @Body() body: GorideDto, @Res() res: Response) {
        const logger = AppContext.logger;
        const em = AppContext.em;

        logger.info(`body: ${JSON.stringify(body, null, 4)}`);

        const userId = new ObjectId(req.user._id);
        const pickUpLocation: string = body!.pickUpLocation;
        const toLocation: string = body!.toLocation;
        const price: number = body!.price;
        const transactionServiceFrom = TransactionServiceFrom.GORIDE;
        const detail: string[] = [
            pickUpLocation,
            toLocation,
            price.toString(),
        ];

        const transaction: Transaction = em.create(Transaction, {
            _id: new ObjectId(),
            userId: userId,
            detail: detail,
            serviceFrom: transactionServiceFrom,
        });

        await em.insert(transaction);

        logger.info(`new goride: ${JSON.stringify(transaction, null, 4)}`);

        return res.status(200).json({
            status: true,
            message: 'Success create order',
        });
    }

    @Put('/edit/:id')
    @Patch('/edit/:id')
    async updateGoRide(@Param('id') param: string, @Req() req: UserInRequest, @Body() body: GorideDto, @Res() res: Response) {
        const logger = AppContext.logger;
        const em = AppContext.em;

        logger.info(`body: ${JSON.stringify(body, null, 4)}`);

        const _id = new ObjectId(param);
        const pickUpLocation: string = body!.pickUpLocation;
        const toLocation: string = body!.toLocation;
        const price: number = body!.price;
        const transactionServiceFrom = TransactionServiceFrom.GORIDE;
        const detail: string[] = [
            pickUpLocation,
            toLocation,
            price.toString(),
        ];

        const transactionResult: Transaction | null = await em.findOne(Transaction, {
            _id: _id,
            serviceFrom: transactionServiceFrom,
        });

        if (transactionResult === null) {
            logger.info(`goride transaction id not found: ${JSON.stringify(_id, null, 4)}`);

            return res.status(422).json({
                status: false,
                message: 'Failed update order',
            });
        }

        transactionResult.detail = detail;
        await em.persistAndFlush(transactionResult);

        logger.info(`update goride: ${JSON.stringify(transactionResult, null, 4)}`);

        return res.status(200).json({
            status: true,
            message: 'Success update order',
        });
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

            return res.status(422).json({
                status: false,
                message: 'Failed delete order',
            });
        }

        await em.removeAndFlush(transactionResult);

        logger.info(`delete goride: ${JSON.stringify(transactionResult, null, 4)}`);

        return res.status(200).json({
            status: true,
            message: 'Success delete order',
        });
    }
}
