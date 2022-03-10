import type { Application } from 'express';

import { PrismaClient } from '@prisma/client';
import { Logger } from 'tslog';
import { Tedis } from 'tedis';
import { default as express } from 'express';

interface IContainer {
	logger: Logger;
	prisma: PrismaClient;
	app: Application;
	redis: Tedis;
}

export const container: IContainer = {
	app: express(),
	logger: new Logger({ name: 'server', displayFilePath: 'hidden', displayFunctionName: false }),
	prisma: new PrismaClient(),
	redis: new Tedis({ port: Number(process.env.REDIS_PORT), host: process.env.REDIS_HOST }),
};
