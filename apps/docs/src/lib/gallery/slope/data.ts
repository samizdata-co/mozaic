import type { Messages } from '../types';

export interface Row {
	region: string;
	/** Turnout share, synthetic. */
	before: number;
	after: number;
}

export const rows: Row[] = [
	{ region: 'chisinau', before: 0.46, after: 0.58 },
	{ region: 'north', before: 0.44, after: 0.49 },
	{ region: 'centre', before: 0.41, after: 0.47 },
	{ region: 'south', before: 0.43, after: 0.41 },
	{ region: 'diaspora', before: 0.22, after: 0.35 }
];

export const messages: Messages<{ title: string; subtitle: string; alt: string; regions: Record<string, string> }> = {
	en: {
		title: 'Turnout rose everywhere except the south',
		subtitle: 'Turnout by region, 2019 and 2024',
		alt: 'Slope chart of turnout in five regions between 2019 and 2024. It rose in four regions, most in the diaspora, and fell slightly in the south.',
		regions: { chisinau: 'Chișinău', north: 'North', centre: 'Centre', south: 'South', diaspora: 'Diaspora' }
	},
	ro: {
		title: 'Prezența a crescut peste tot, cu excepția sudului',
		subtitle: 'Prezența la vot pe regiuni, 2019 și 2024',
		alt: 'Grafic de pantă al prezenței la vot în cinci regiuni, între 2019 și 2024. A crescut în patru regiuni, cel mai mult în diaspora, și a scăzut ușor în sud.',
		regions: { chisinau: 'Chișinău', north: 'Nord', centre: 'Centru', south: 'Sud', diaspora: 'Diaspora' }
	},
	ru: {
		title: 'Явка выросла везде, кроме юга',
		subtitle: 'Явка по регионам, 2019 и 2024 годы',
		alt: 'Диаграмма наклонов явки в пяти регионах между 2019 и 2024 годами. Она выросла в четырёх регионах, больше всего в диаспоре, и немного снизилась на юге.',
		regions: { chisinau: 'Кишинёв', north: 'Север', centre: 'Центр', south: 'Юг', diaspora: 'Диаспора' }
	}
};
