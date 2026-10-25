import type { Messages } from '../types';

export const groups = ['women', 'men'] as const;
export interface Row {
	age: string;
	group: (typeof groups)[number];
	/** Employment rate, synthetic. */
	rate: number;
}

const rates: [string, number, number][] = [
	['15–24', 0.18, 0.24],
	['25–34', 0.52, 0.66],
	['35–44', 0.61, 0.69],
	['45–54', 0.58, 0.62],
	['55–64', 0.38, 0.47]
];
export const rows: Row[] = rates.flatMap(([age, w, m]) => [
	{ age, group: 'women' as const, rate: w },
	{ age, group: 'men' as const, rate: m }
]);

export const messages: Messages<{
	title: string;
	subtitle: string;
	alt: string;
	age: string;
	groups: Record<Row['group'], string>;
}> = {
	en: {
		title: 'The gap is widest between 25 and 34',
		subtitle: 'Employment rate by age group and sex',
		alt: 'Grouped bar chart of employment rates for women and men in five age groups. Men are employed more in every group; the gap is widest at 25–34.',
		age: 'Age',
		groups: { women: 'Women', men: 'Men' }
	},
	ro: {
		title: 'Decalajul e cel mai mare la 25–34 de ani',
		subtitle: 'Rata de ocupare pe grupe de vârstă și sexe',
		alt: 'Grafic cu bare grupate al ratei de ocupare pentru femei și bărbați în cinci grupe de vârstă. Bărbații sunt mai ocupați în fiecare grupă; decalajul e maxim la 25–34 de ani.',
		age: 'Vârsta',
		groups: { women: 'Femei', men: 'Bărbați' }
	},
	ru: {
		title: 'Разрыв больше всего в 25–34 года',
		subtitle: 'Уровень занятости по возрастным группам и полу',
		alt: 'Сгруппированная столбчатая диаграмма уровня занятости женщин и мужчин в пяти возрастных группах. Мужчины заняты больше в каждой группе; разрыв максимален в 25–34 года.',
		age: 'Возраст',
		groups: { women: 'Женщины', men: 'Мужчины' }
	}
};
