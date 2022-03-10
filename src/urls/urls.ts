import { Router } from 'express';
import { createResponse } from '../util';
import { hasSlugParam, hasURL } from './guards';


export const router = Router();

router.get('/:slug', hasSlugParam, hasURL, async (req, res) => {
	return res.status(301).redirect(req.queriedURL.url);
});

router.get('/urls/:slug', hasSlugParam, hasURL, async (req, res) => {
	return res.status(200).json(createResponse({ status: 'success', data: { url: req.queriedURL } }));
});
