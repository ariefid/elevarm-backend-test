import { config } from "dotenv";

config({ path: '.env' });

export const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN ?? '2h';

export const {
    NODE_ENV,
    PORT,
    JWT_SECRET_KEY,
    MONGODB_URL,
} = process.env;
