import { default as request, type Response } from 'supertest';
import { app } from '../src';
import { container } from '../src/container';

function hasBaseWellFormedBody(res: Response) {
	expect(res.body).toHaveProperty('status');
	expect(res.body).toHaveProperty('data');
}

function hasData(res: Response, property: string | string[]) {
	expect(res.body.data).toHaveProperty(property);
}

function isSuccess(res: Response) {
	expect(res.body.status).toBe('success');
}

function hasBasicURLEndpointData(res: Response) {
	const fn = hasData.bind(null, res);

	fn('url');

	for (const key of ['createdAt', 'updatedAt', 'url', 'slug']) {
		fn(['url', key]);
	}

	return fn;
}

describe('/', () => {
	test('should be alive', async () => {
		await request(app).get('/').expect(200);
	});

	test('should return well-formed body', async () => {
		await request(app)
			.get('/')
			.expect((res) => {
				isSuccess(res);
				hasBaseWellFormedBody(res);
				hasData(res, 'message');

				expect(res.body.data.message).toBe('Alive');
			});
	});

	describe('/urls', () => {
		beforeEach(async () => {
			await container.prisma.url.delete({ where: { slug: 'test' } }).catch(() => null);
			await container.prisma.url.create({ data: { slug: 'test', url: 'https://example.com/' } }).catch(() => null);
		});

		describe('GET /urls/:slug', () => {
			test('should return 404 when slug is not found', async () => {
				await request(app).get('/urls/not-found').expect(404);
			});

			test('should return 200 when slug is found', async () => {
				await request(app).get('/urls/test').expect(200);
			});

			test('should return a well-formed body', async () => {
				await request(app)
					.get('/urls/test')
					.expect((res) => {
						isSuccess(res);
						hasBaseWellFormedBody(res);
						hasBasicURLEndpointData(res);
					});
			});
		});

		describe('DELETE /urls/:slug', () => {
			test('should return 401 if authorization header is not provided', async () => {
				await request(app).post('/urls').expect(401);
			});

			test('should return 404 when slug is not found', async () => {
				await request(app).delete('/urls/not-found').set('Authorization', process.env.API_KEY).expect(404);
			});

			test('should return 200 when slug is found', async () => {
				await request(app).delete('/urls/test').set('Authorization', process.env.API_KEY).expect(200);
			});

			test('should return a well-formed body', async () => {
				await request(app)
					.delete('/urls/test')
					.set('Authorization', process.env.API_KEY)
					.expect((res) => {
						isSuccess(res);
						hasBaseWellFormedBody(res);
						hasBasicURLEndpointData(res);

						expect(res.body.data.message).toBe('url deleted');
					});
			});
		});

		describe('POST /urls', () => {
			test('should return 401 if authorization header is not provided', async () => {
				await request(app).post('/urls').expect(401);
			});

			test('should return 201 when url is provided', async () => {
				const res = await request(app)
					.post('/urls')
					.set('Authorization', process.env.API_KEY)
					.send({ url: 'https://example.com/' })
					.expect(201);

				await container.prisma.url.delete({ where: { slug: res.body.data.url.slug } }).catch(() => null);
			});

			test('should return a well-formed body', async () => {
				const res = await request(app)
					.post('/urls')
					.set('Authorization', process.env.API_KEY)
					.send({ url: 'https://example.com/' })
					.expect((res) => {
						isSuccess(res);
						hasBaseWellFormedBody(res);
						hasBasicURLEndpointData(res);

						expect(res.body.data.url.url).toBe('https://example.com/');
					});

				await container.prisma.url.delete({ where: { slug: res.body.data.url.slug } }).catch(() => null);
			});
		});

		describe('PUT /urls/:slug', () => {
			test('should return 401 if authorization header is not provided', async () => {
				await request(app).put('/urls/test').expect(401);
			});

			test('should return 404 when slug is not found', async () => {
				await request(app).put('/urls/not-found').set('Authorization', process.env.API_KEY).expect(404);
			});

			test('should return 200 when slug is found', async () => {
				await request(app)
					.put('/urls/test')
					.set('Authorization', process.env.API_KEY)
					.send({ url: 'https://example.com/' })
					.expect(200);
			});

			test('should return a well-formed body', async () => {
				await request(app)
					.put('/urls/test')
					.set('Authorization', process.env.API_KEY)
					.send({ url: 'https://google.com/' })
					.expect((res) => {
						expect(res.body).toHaveProperty('status');
						expect(res.body).toHaveProperty('data');

						expect(res.body.data).toHaveProperty('from');
						expect(res.body.data).toHaveProperty('to');

						expect(res.body.data.from).toHaveProperty('slug');
						expect(res.body.data.from).toHaveProperty('url');

						expect(res.body.data.to).toHaveProperty('slug');
						expect(res.body.data.to).toHaveProperty('url');

						expect(res.body.data.from.url).toBe('https://example.com/');
						expect(res.body.data.to.url).toBe('https://google.com/');
					});
			});
		});
	});
});

afterAll(() => {
	container.prisma.$disconnect();
	container.redis.close();
});
