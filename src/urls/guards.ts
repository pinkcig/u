import type { Request, Response, NextFunction } from 'express';
import { createResponse } from '../util';
import { container } from '../container';

const { prisma } = container;

export function hasSlugParam(req: Request, res: Response, next: NextFunction) {
	if (!req.params.slug) return res.status(400).send(createResponse({ status: 'failure', data: { message: 'missing parameter "slug"' } }));
	return next();
}

export async function hasURL(req: Request, res: Response, next: NextFunction) {
	const { slug } = req.params;

	const url = await prisma.url.findFirst({ where: { slug } });
	if (!url) return res.status(404).send(createResponse({ status: 'failure', data: { message: `url with slug "${slug} not found"` } }));

	req.queriedURL = url;

	return next();
}
