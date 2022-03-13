import type { PrismaClient } from '@prisma/client';
import { container } from './container';

const { redis, prisma } = container;

function randomCharacter(characterList: string): string {
	return characterList[Math.floor(Math.random() * characterList.length)];
}

// Ran some benchmarks on this function; the imperative counterpart is
// slightly faster (sometimes slower), but I prefer to trade it for a little bit of readability and consistency.
// https://tinyurl.com/randomPhoneticKeyBenchmark
export function randomPhoneticKey(length: number | string): string {
	if (typeof length === 'string') length = parseInt(length);
	return [...Array(length)].map((_, i) => randomCharacter(i % 2 === 0 ? 'bcdfghjklmnpqrstvwxyz' : 'aeiou')).join('');
}

type JSONData = Record<string, unknown>;
type Status = 'success' | 'failure' | 'error';

interface IResponseFormat {
	status: Status;
	data: JSONData;
}

// Tries to follow https://github.com/omniti-labs/jsend
export function createResponse({ data, status }: Required<IResponseFormat>): JSONData {
	return {
		status,
		data: {
			...data,
		},
	};
}

// As Redis doesn't support JSON, we need to serialise and deserialise it.
export function serialise(data: JSONData): string {
	return JSON.stringify(data);
}

export function deserialise<T extends JSONData = JSONData>(data: string | number | null): T | null {
	// Returns a number if the stored data is of an unknown type, I believe; we don't care about that.
	// https://github.com/silkjs/tedis/blob/e8c7a5fa6894378ca6fe22ff6752ea38ca0fd753/src/core/tedis.ts#L234-L235
	if (!data || typeof data === 'number') return null;

	try {
		return JSON.parse(data) as T;
	} catch {
		return null;
	}
}

type NullOrT<T> = Promise<T | null>;
type PrismaFn<T extends JSONData = JSONData> = (prisma: PrismaClient) => NullOrT<T>;

export async function del<T extends JSONData = JSONData>(key: string, fn: PrismaFn<T>) {
	await redis.del(key);
	return fn(prisma);
}

export async function get<T extends JSONData = JSONData>(key: string, fn: PrismaFn<T>) {
	if (await redis.exists(key)) return deserialise<T>(await redis.get(key));

	const data = await fn(prisma);
	if (!data) return null;

	await redis.set(key, serialise(data));
	return data;
}

export async function set<T extends JSONData = JSONData>(key: string, fn: PrismaFn<T>) {
	const data = await fn(prisma);
	if (!data) return null;

	await redis.set(key, serialise(data));
	return data;
}
