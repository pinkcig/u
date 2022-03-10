import { Config } from '@jest/types';

export default async(): Promise<Config.InitialOptions> => ({
	displayName: 'unit tests',
	preset: 'ts-jest',
	testEnvironment: 'node',
	testRunner: 'jest-circus/runner',
	globals: {
		'ts-jest': {
			tsconfig: '<rootDir>/src/tsconfig.json',
		}
	}
})
