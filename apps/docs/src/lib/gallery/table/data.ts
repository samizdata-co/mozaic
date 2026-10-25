import { seeded } from '../../random';
import type { Messages } from '../types';

export interface Row {
	district: string;
	population: number;
	change: number;
	income: number;
	trend: number[];
}

const random = seeded(77);
const districts = [
	'Chișinău',
	'Bălți',
	'Cahul',
	'Ungheni',
	'Orhei',
	'Soroca',
	'Hîncești',
	'Ialoveni',
	'Strășeni',
	'Edineț',
	'Comrat',
	'Florești'
];
export const rows: Row[] = districts.map((district, i) => {
	let v = 100;
	const trend = Array.from({ length: 10 }, () => (v += (random() - 0.45) * 6));
	return {
		district,
		population: Math.round((i === 0 ? 830000 : i === 1 ? 140000 : 40000 + random() * 80000) / 100) * 100,
		change: Math.round((random() - 0.6) * 0.2 * 1000) / 1000,
		income: Math.round(7000 + random() * 6000 + (i === 0 ? 5000 : 0)),
		trend
	};
});

export const messages: Messages<{
	title: string;
	subtitle: string;
	alt: string;
	columns: { district: string; population: string; change: string; income: string; trend: string };
}> = {
	en: {
		title: 'District profiles',
		subtitle: 'Population, population change since 2014, average income and ten-year activity trend',
		alt: 'Sortable table of twelve districts with population, population change, average income and a trend sparkline.',
		columns: { district: 'District', population: 'Population', change: 'Change', income: 'Income, lei', trend: 'Trend' }
	},
	ro: {
		title: 'Profilurile raioanelor',
		subtitle: 'Populația, schimbarea populației din 2014, venitul mediu și tendința activității pe zece ani',
		alt: 'Tabel sortabil cu douăsprezece raioane: populația, schimbarea populației, venitul mediu și o minidiagramă a tendinței.',
		columns: {
			district: 'Raionul',
			population: 'Populația',
			change: 'Schimbare',
			income: 'Venit, lei',
			trend: 'Tendință'
		}
	},
	ru: {
		title: 'Профили районов',
		subtitle: 'Население, изменение населения с 2014 года, средний доход и десятилетний тренд активности',
		alt: 'Сортируемая таблица двенадцати районов: население, изменение населения, средний доход и мини-график тренда.',
		columns: { district: 'Район', population: 'Население', change: 'Изменение', income: 'Доход, лей', trend: 'Тренд' }
	}
};
