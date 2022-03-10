import type { Url } from '@prisma/client';

import { hasMatchingAPIKey, hasSlugParam, hasURL } from './guards';
import { createResponse, randomPhoneticKey, set, del } from '../util';
import { Router } from 'express';

export const router = Router();

router.get('/:slug', hasSlugParam, hasURL, (req, res) => {
	return res.status(301).redirect(req.queriedURL.url);
});

router.get('/urls/:slug', hasSlugParam, hasURL, (req, res) => {
	return res.status(200).json(createResponse({ status: 'success', data: { url: req.queriedURL } }));
});

router.delete('/urls/:slug', hasMatchingAPIKey, hasSlugParam, hasURL, async (req, res) => {
	const result = await del<Url>(`urls/${req.queriedURL.slug}`, (prisma) => prisma.url.delete({ where: { slug: req.queriedURL.slug } }));
	return res.status(200).send(createResponse({ status: 'success', data: { message: 'url deleted', url: result } }));
});

router.put('/urls/:slug', hasMatchingAPIKey, hasSlugParam, hasURL, async (req, res) => {
	const result = await set<Url>(`urls/${req.queriedURL.slug}`, (prisma) =>
		prisma.url.update({ where: { slug: req.queriedURL.slug }, data: { ...req.body } }),
	);

	return res.status(200).send(createResponse({ status: 'success', data: { message: 'url updated', from: req.queriedURL, to: result } }));
});

router.post('/urls', hasMatchingAPIKey, async (req, res) => {
	const { url, slug } = req.body;
	if (!url) return res.status(400).send(createResponse({ status: 'failure', data: { message: 'missing body element "url"' } }));

	const key = slug ?? randomPhoneticKey(process.env.SLUG_LENGTH);
	const result = await set<Url>(`urls/${key}`, (prisma) => prisma.url.create({ data: { url, slug: key } }));

	return res.status(201).json(createResponse({ status: 'success', data: { url: result } }));
});
