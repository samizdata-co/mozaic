import { seeded } from '../../random';
import type { Messages } from '../types';

export interface Series {
	id: string;
	values: { year: number; value: number }[];
}

const random = seeded(31);
const trends: Record<string, number> = {
	chisinau: 3.1,
	balti: 1.2,
	cahul: 0.6,
	orhei: 1.6,
	ungheni: 0.9,
	soroca: -1.4
};
export const series: Series[] = Object.entries(trends).map(([id, trend]) => {
	let value = 50 + random() * 10;
	return {
		id,
		values: Array.from({ length: 11 }, (_, i) => {
			// Small noise so each trend's direction stays clear.
			if (i > 0) value += trend + (random() - 0.5) * 1.6;
			return { year: 2015 + i, value: Math.round(value * 10) / 10 };
		})
	};
});

export const messages: Messages<{ title: string; subtitle: string; alt: string; names: Record<string, string> }> = {
	en: {
		title: 'Only Soroca fell over the decade',
		subtitle: 'Index of local business activity, 2015–2025',
		alt: 'Six small line charts, one per city, with the same scale. Chișinău rises fastest; Soroca ends lower than it started.',
		names: {
			chisinau: 'Chișinău',
			balti: 'Bălți',
			cahul: 'Cahul',
			orhei: 'Orhei',
			ungheni: 'Ungheni',
			soroca: 'Soroca'
		}
	},
	ro: {
		title: 'Doar Soroca a scăzut în ultimul deceniu',
		subtitle: 'Indicele activității economice locale, 2015–2025',
		alt: 'Șase grafice liniare mici, câte unul pentru fiecare oraș, cu aceeași scară. Chișinăul crește cel mai repede; Soroca termină mai jos decât a început.',
		names: {
			chisinau: 'Chișinău',
			balti: 'Bălți',
			cahul: 'Cahul',
			orhei: 'Orhei',
			ungheni: 'Ungheni',
			soroca: 'Soroca'
		}
	},
	ru: {
		title: 'За десятилетие снизились только Сороки',
		subtitle: 'Индекс местной деловой активности, 2015–2025',
		alt: 'Шесть маленьких линейных графиков, по одному на город, в одном масштабе. Кишинёв растёт быстрее всех; Сороки заканчивают ниже, чем начинали.',
		names: {
			chisinau: 'Кишинёв',
			balti: 'Бельцы',
			cahul: 'Кагул',
			orhei: 'Оргеев',
			ungheni: 'Унгены',
			soroca: 'Сороки'
		}
	}
};
