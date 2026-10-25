import type { LocaleCode } from 'mozaic/locale';
import { seeded } from '../../random';

export interface Point {
	date: Date;
	value: number;
}

export interface Series {
	id: string;
	values: Point[];
}

/** Synthetic monthly index (Jan 2019 = 100) for four regions. */
function makeSeries(): Series[] {
	const random = seeded(2026);
	const trends: Record<string, number> = { north: 0.25, centre: 0.45, south: 0.15, capital: 0.75 };
	return Object.entries(trends).map(([id, trend]) => {
		let value = 100;
		const values: Point[] = [];
		for (let m = 0; m < 84; m++) {
			if (m > 0) value += trend + (random() - 0.5) * 2.4 - (m >= 14 && m < 20 ? 1.6 : 0);
			values.push({ date: new Date(2019, m, 1), value: Math.round(value * 10) / 10 });
		}
		return { id, values };
	});
}

export const series = makeSeries();

export const messages: Record<
	LocaleCode,
	{
		title: string;
		subtitle: string;
		alt: string;
		notes: string;
		source: string;
		regions: Record<string, string>;
	}
> = {
	en: {
		title: 'The capital pulled ahead after 2021',
		subtitle: 'Activity index by region, January 2019 = 100 (illustrative data)',
		alt: 'Line chart of a monthly index for four regions from 2019 to 2025. All dip in 2020; Chișinău grows fastest afterwards, the South slowest.',
		notes: 'Synthetic values for testing the chart library. Not real figures.',
		source: 'mozaic test data',
		regions: { north: 'North', centre: 'Centre', south: 'South', capital: 'Chișinău' }
	},
	ro: {
		title: 'Capitala s-a desprins după 2021',
		subtitle: 'Indicele activității pe regiuni, ianuarie 2019 = 100 (date ilustrative)',
		alt: 'Grafic liniar al unui indice lunar pentru patru regiuni, 2019–2025. Toate scad în 2020; Chișinăul crește cel mai repede apoi, Sudul cel mai încet.',
		notes: 'Valori sintetice pentru testarea bibliotecii. Nu sunt date reale.',
		source: 'date de test mozaic',
		regions: { north: 'Nord', centre: 'Centru', south: 'Sud', capital: 'Chișinău' }
	},
	ru: {
		title: 'Столица вырвалась вперёд после 2021 года',
		subtitle: 'Индекс активности по регионам, январь 2019 = 100 (условные данные)',
		alt: 'Линейный график месячного индекса для четырёх регионов, 2019–2025. Все снижаются в 2020 году; затем быстрее всех растёт Кишинёв, медленнее всех Юг.',
		notes: 'Синтетические значения для тестирования библиотеки. Не реальные данные.',
		source: 'тестовые данные mozaic',
		regions: { north: 'Север', centre: 'Центр', south: 'Юг', capital: 'Кишинёв' }
	}
};
