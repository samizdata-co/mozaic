import { describe, expect, it } from 'vitest';
import { toCSV } from './csv.js';

describe('toCSV', () => {
	it('writes a header and quotes awkward values', () => {
		const csv = toCSV(
			[
				{ name: 'Ștefan Vodă', value: 1.5, date: new Date(Date.UTC(2024, 0, 2)) },
				{ name: 'A, "B"', value: null, date: null }
			],
			[
				{ label: 'Name', value: (d) => d.name },
				{ label: 'Value', value: (d) => d.value },
				{ label: 'Date', value: (d) => d.date }
			]
		);
		expect(csv).toBe('Name,Value,Date\nȘtefan Vodă,1.5,2024-01-02\n"A, ""B""",,\n');
	});
});
