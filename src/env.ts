import type { Url } from '@prisma/client';
import { config } from 'dotenv';

config();

process.env.NODE_ENV ??= 'development';

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV: 'development' | 'production';
			
			PORT: string;
			ORIGIN: string;
			SLUG_LENGTH: string;

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

if (process.env.ORIGIN.endsWith('localhost')) process.env.ORIGIN = `http://localhost:${process.env.PORT}`;
