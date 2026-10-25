#!/usr/bin/env node
import { run } from '../src/index.js';

run(process.argv.slice(2)).then(
	(code) => process.exit(code),
	(error) => {
		console.error(`create-mozaic: ${error instanceof Error ? error.message : error}`);
		process.exit(1);
	}
);
