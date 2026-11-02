import type { Messages } from '../types';

export interface Row {
	worry: string;
	/** Share naming it among their top worries, %, synthetic. */
	autumn?: number;
	spring?: number;
}

/** In display order: largest first, "don't know" last. Housing was not asked in spring. */
export const rows: Row[] = [
	{ worry: 'prices', autumn: 52.4, spring: 46.9 },
	{ worry: 'wages', autumn: 38.1, spring: 41.3 },
	{ worry: 'corruption', autumn: 29.6, spring: 33.2 },
	{ worry: 'emigration', autumn: 21.5, spring: 18.4 },
	{ worry: 'housing', autumn: 17.2 },
	{ worry: 'jobs', autumn: 14.8, spring: 19.1 },
	{ worry: 'war', autumn: 9.3, spring: 15.7 },
	{ worry: 'dontKnow', autumn: 4.1, spring: 5.2 }
];

export const messages: Messages<{
	title: string;
	subtitle: string;
	alt: string;
	autumn: string;
	spring: string;
	worries: Record<string, string>;
}> = {
	en: {
		title: 'Prices are the top worry, and more name them than in spring',
		subtitle: 'Share naming each issue among their top worries, %; the change since spring at the right',
		alt: 'Bars for the autumn survey and dots for the spring one. Prices are named by 52.4%, up 5.5 points; worry about war fell the most, by 6.4 points.',
		autumn: 'Autumn',
		spring: 'Spring',
		worries: {
			prices: 'Prices',
			wages: 'Low wages',
			corruption: 'Corruption',
			emigration: 'Emigration',
			housing: 'Housing',
			jobs: 'Jobs',
			war: 'War',
			dontKnow: 'Don’t know'
		}
	},
	ro: {
		title: 'Prețurile sunt grija principală, mai des numite decât în primăvară',
		subtitle:
			'Ponderea celor care numesc fiecare problemă printre grijile principale, %; schimbarea din primăvară, la dreapta',
		alt: 'Bare pentru sondajul de toamnă și puncte pentru cel de primăvară. Prețurile sunt numite de 52,4%, cu 5,5 puncte mai mult; grija legată de război a scăzut cel mai mult, cu 6,4 puncte.',
		autumn: 'Toamna',
		spring: 'Primăvara',
		worries: {
			prices: 'Prețurile',
			wages: 'Salariile mici',
			corruption: 'Corupția',
			emigration: 'Emigrarea',
			housing: 'Locuințele',
			jobs: 'Locurile de muncă',
			war: 'Războiul',
			dontKnow: 'Nu știu'
		}
	},
	ru: {
		title: 'Цены — главная забота, и их называют чаще, чем весной',
		subtitle: 'Доля назвавших каждую проблему среди главных забот, %; изменение с весны — справа',
		alt: 'Столбцы — осенний опрос, точки — весенний. Цены называют 52,4%, на 5,5 пункта больше; тревога о войне снизилась сильнее всего, на 6,4 пункта.',
		autumn: 'Осень',
		spring: 'Весна',
		worries: {
			prices: 'Цены',
			wages: 'Низкие зарплаты',
			corruption: 'Коррупция',
			emigration: 'Эмиграция',
			housing: 'Жильё',
			jobs: 'Работа',
			war: 'Война',
			dontKnow: 'Не знаю'
		}
	}
};
