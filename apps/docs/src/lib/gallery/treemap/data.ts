import type { Messages } from '../types';

export interface Row {
	id: string;
	group: 'social' | 'economy' | 'state';
	/** Billion lei, synthetic. */
	value: number;
}

export const rows: Row[] = [
	{ id: 'pensions', group: 'social', value: 24.1 },
	{ id: 'health', group: 'social', value: 11.8 },
	{ id: 'education', group: 'social', value: 13.6 },
	{ id: 'benefits', group: 'social', value: 6.2 },
	{ id: 'roads', group: 'economy', value: 5.4 },
	{ id: 'agriculture', group: 'economy', value: 3.9 },
	{ id: 'energy', group: 'economy', value: 2.8 },
	{ id: 'defence', group: 'state', value: 2.6 },
	{ id: 'police', group: 'state', value: 4.1 },
	{ id: 'justice', group: 'state', value: 1.9 },
	{ id: 'debt', group: 'state', value: 5.7 }
];

export const messages: Messages<{
	title: string;
	subtitle: string;
	alt: string;
	unit: string;
	groups: Record<Row['group'], string>;
	items: Record<string, string>;
}> = {
	en: {
		title: 'Social spending takes more than half the budget',
		subtitle: 'Planned spending by area, billion lei',
		alt: 'Treemap of planned spending in eleven areas grouped as social, economy and state. Pensions are the largest single item.',
		unit: 'bn lei',
		groups: { social: 'Social', economy: 'Economy', state: 'State' },
		items: {
			pensions: 'Pensions',
			health: 'Health',
			education: 'Education',
			benefits: 'Benefits',
			roads: 'Roads',
			agriculture: 'Agriculture',
			energy: 'Energy',
			defence: 'Defence',
			police: 'Police',
			justice: 'Justice',
			debt: 'Debt'
		}
	},
	ro: {
		title: 'Cheltuielile sociale depășesc jumătate din buget',
		subtitle: 'Cheltuieli planificate pe domenii, miliarde lei',
		alt: 'Hartă arborescentă a cheltuielilor planificate în unsprezece domenii, grupate în social, economie și stat. Pensiile sunt cel mai mare articol.',
		unit: 'mld. lei',
		groups: { social: 'Social', economy: 'Economie', state: 'Stat' },
		items: {
			pensions: 'Pensii',
			health: 'Sănătate',
			education: 'Educație',
			benefits: 'Prestații',
			roads: 'Drumuri',
			agriculture: 'Agricultură',
			energy: 'Energie',
			defence: 'Apărare',
			police: 'Poliție',
			justice: 'Justiție',
			debt: 'Datorie'
		}
	},
	ru: {
		title: 'Социальные расходы — больше половины бюджета',
		subtitle: 'Плановые расходы по направлениям, млрд лей',
		alt: 'Древовидная карта плановых расходов по одиннадцати направлениям, сгруппированным в социальные, экономику и государство. Пенсии — крупнейшая статья.',
		unit: 'млрд лей',
		groups: { social: 'Социальные', economy: 'Экономика', state: 'Государство' },
		items: {
			pensions: 'Пенсии',
			health: 'Здравоохранение',
			education: 'Образование',
			benefits: 'Пособия',
			roads: 'Дороги',
			agriculture: 'Сельское хоз.',
			energy: 'Энергетика',
			defence: 'Оборона',
			police: 'Полиция',
			justice: 'Юстиция',
			debt: 'Долг'
		}
	}
};
