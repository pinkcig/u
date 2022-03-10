import { container } from './container';

const { redis } = container;

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
type Statuses = 'success' | 'failure' | 'error';

interface IResponseFormat {
	status: Statuses;
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

// As Redis doesn't support JSON, we need to serialize and deserialise it.
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

// Wrapper function to cache automatically
// Can probably be improved with a better solution
export async function get<T extends JSONData = JSONData>(key: string, fetch: () => Promise<T | null>) {
	if (!(await redis.exists(key))) {
		const data = await fetch();
		if (!data) return null;

		await redis.set(key, serialise(data));
		return data;
	}

	return deserialise<T>(await redis.get(key));
}
