import type { Url } from '@prisma/client';
import { config } from 'dotenv';

config();

process.env.NODE_ENV ??= 'development';

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV: 'development' | 'production' | 'test';

			PORT: string;
			ORIGIN: string;
			SLUG_LENGTH: string;
			API_KEY: string;

			REDIS_HOST: string;
			REDIS_PORT: string;
		}
	}
}

declare module 'express-serve-static-core' {
	interface Request {
		queriedURL: Url;
	}
}

if (process.env.ORIGIN === '0.0.0.0') process.env.ORIGIN = `http://0.0.0.0:${process.env.PORT}`;
