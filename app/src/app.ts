import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { createExpressServer } from 'routing-controllers';
import { MikroORM } from '@mikro-orm/core';
import { MongoDriver, MongoEntityManager } from '@mikro-orm/mongodb';
import { Logger } from 'winston';
import { PORT } from './config';
import mongoDBConfig from './config/mongodb.mikro-orm.config';
import logger from './lib/logger';
import AuthController from './controllers/auth.controller';
import GorideController from './controllers/goride.controller';

export const AppContext = {} as {
    orm: MikroORM<MongoDriver>;
    em: MongoEntityManager;
    logger: Logger;
};

(async () => {
    const orm = await MikroORM.init<MongoDriver>(mongoDBConfig);

    AppContext.orm = orm;
    AppContext.em = orm.em;
    AppContext.logger = logger;
})();

const routingControllersOptions = {
    controllers: [
        AuthController,
        GorideController,
    ],
    routePrefix: '/api',
};

const port: number = parseInt(`${PORT}`, 10) ?? 3030;
const app: express.Application = createExpressServer({
    ...routingControllersOptions,
    interceptors: [`${__dirname}/interceptor/*.interceptor.ts`],
    defaultErrorHandler: false,
    cors: true,
    classTransformer: true,
    validation: true,
    development: true,
    authorizationChecker: async (action, _roles) => {
        const token = action.request.headers.authorization;
        return true;
    }
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(morgan('combined'));

app.get('/', (_req, res) => {
    res.status(200).json({
        success: true,
        message: 'Application running!',
    });

    return;
})

app.listen(port, () => {
    logger.info(`Server is running on port: ${port}`);
});
