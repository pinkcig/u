import type { Application } from 'express';

import { PrismaClient } from '@prisma/client';
import { Logger } from 'tslog';
import { default as express } from 'express';

interface IContainer {
	logger: Logger;
	prisma: PrismaClient;
	app: Application;
}

export const container: IContainer = {
	app: express(),
	logger: new Logger({ name: 'server', displayFilePath: 'hidden', displayFunctionName: false }),
	prisma: new PrismaClient(),
};
