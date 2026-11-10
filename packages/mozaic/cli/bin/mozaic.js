#!/usr/bin/env node
import { main } from '../src/main.js';

main(process.argv.slice(2)).then(
	(code) => process.exit(code),
	(error) => {
		console.error(`mozaic: ${error instanceof Error ? error.message : error}`);
		process.exit(1);
	}
);
