import { MongoDriver } from '@mikro-orm/mongodb';
import { Options, ReflectMetadataProvider } from '@mikro-orm/core';
import { MONGODB_URL } from './index';

export default {
    type: 'mongo',
    clientUrl: MONGODB_URL,
    entities: ['dist/entities'],
    entitiesTs: ['src/entities'],
    debug: process.env.NODE_ENV === 'development',
    allowGlobalContext: true,
    metadataProvider: ReflectMetadataProvider,
} as Options<MongoDriver>;
