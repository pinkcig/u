import './env';

import { default as helmet } from 'helmet';
import { createResponse } from './util';
import { container } from './container';
import { default as cors } from 'cors';
import { router } from './urls/urls';
import { json } from 'express';

const { app, logger, redis } = container;

app.use(json())
	.use(helmet())
	.use(cors({ origin: process.env.ORIGIN }))
	.use(router);

app.get('/', (_, res) => res.status(200).json(createResponse({ status: 'success', data: { message: 'Alive' } })));
app.all('*', (_, res) => res.status(404).json(createResponse({ status: 'failure', data: { message: 'Not Found' } })));

app.listen(process.env.PORT, () => logger.info(process.env.ORIGIN));


redis.hset('test', 'test', 'test');
