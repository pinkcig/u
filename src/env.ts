import { config } from 'dotenv';

config();

process.env.NODE_ENV ??= 'development';

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV: 'development' | 'production';
			PORT: string;
			ORIGIN: string;
		}
	}
}

if (process.env.ORIGIN.endsWith('localhost')) process.env.ORIGIN = `http://localhost:${process.env.PORT}`;
