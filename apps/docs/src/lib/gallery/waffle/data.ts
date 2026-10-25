import type { Messages } from '../types';

export interface Row {
	id: 'work' | 'study' | 'neither';
	/** Out of 100 young people, synthetic. */
	count: number;
}

export const rows: Row[] = [
	{ id: 'work', count: 41 },
	{ id: 'study', count: 32 },
	{ id: 'neither', count: 27 }
];

export const messages: Messages<{ title: string; subtitle: string; alt: string; items: Record<Row['id'], string> }> = {
	en: {
		title: 'More than a quarter of young people neither work nor study',
		subtitle: 'Out of 100 people aged 15–29',
		alt: 'Waffle chart of 100 squares: 41 young people work, 32 study, 27 do neither.',
		items: { work: 'Work', study: 'Study', neither: 'Neither' }
	},
	ro: {
		title: 'Peste un sfert dintre tineri nici nu muncesc, nici nu învață',
		subtitle: 'Din 100 de persoane cu vârsta de 15–29 de ani',
		alt: 'Grafic waffle din 100 de pătrate: 41 de tineri muncesc, 32 învață, 27 nici una, nici alta.',
		items: { work: 'Muncesc', study: 'Învață', neither: 'Nici una' }
	},
	ru: {
		title: 'Более четверти молодёжи не работает и не учится',
		subtitle: 'Из 100 человек в возрасте 15–29 лет',
		alt: 'Вафельная диаграмма из 100 квадратов: 41 молодой человек работает, 32 учатся, 27 — ни то, ни другое.',
		items: { work: 'Работают', study: 'Учатся', neither: 'Ни то, ни другое' }
	}
};
