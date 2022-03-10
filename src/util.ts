function randomCharacter(characterList: string): string {
	return characterList[Math.floor(Math.random() * characterList.length)];
}

// Ran some benchmarks on this function; the imperative counterpart is
// slightly faster (sometimes slower), but I prefer to trade it for a little bit of readability and consistency.
// https://tinyurl.com/randomPhoneticKeyBenchmark
export function randomPhoneticKey(length: number | string): string {
	return [...Array(Number(length))].map((_, i) => randomCharacter(i % 2 === 0 ? 'bcdfghjklmnpqrstvwxyz' : 'aeiou')).join('');
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
