import type { Messages } from '../types';

export interface Party {
	id: 'left' | 'centreLeft' | 'centre' | 'liberal' | 'right';
	/** Seats in a 101-seat chamber, synthetic. */
	seats: number;
	/** Vote share, synthetic. */
	share: number;
}

/** In chamber order, left to right. */
export const parties: Party[] = [
	{ id: 'left', seats: 18, share: 16.1 },
	{ id: 'centreLeft', seats: 27, share: 25.4 },
	{ id: 'centre', seats: 22, share: 20.8 },
	{ id: 'liberal', seats: 9, share: 8.7 },
	{ id: 'right', seats: 25, share: 23.3 }
];

export const total = 101;
export const majority = Math.floor(total / 2) + 1;

export const messages: Messages<{
	title: string;
	subtitle: string;
	alt: string;
	majority: string;
	seats: string;
	parties: Record<Party['id'], string>;
}> = {
	en: {
		title: 'No party can govern alone',
		subtitle: 'Seats in a 101-seat parliament; 51 are needed for a majority',
		alt: 'Parliament chart of 101 seats. The largest party has 27 seats, so none has the 51 needed for a majority.',
		majority: '51 for a majority',
		seats: 'seats',
		parties: { left: 'Left', centreLeft: 'Centre-left', centre: 'Centre', liberal: 'Liberals', right: 'Right' }
	},
	ro: {
		title: 'Niciun partid nu poate guverna singur',
		subtitle: 'Mandate într-un parlament de 101 deputați; majoritatea cere 51',
		alt: 'Grafic al unui parlament de 101 mandate. Cel mai mare partid are 27 de mandate, deci niciunul nu are cele 51 necesare pentru majoritate.',
		majority: '51 pentru majoritate',
		seats: 'mandate',
		parties: { left: 'Stânga', centreLeft: 'Centru-stânga', centre: 'Centru', liberal: 'Liberalii', right: 'Dreapta' }
	},
	ru: {
		title: 'Ни одна партия не может править в одиночку',
		subtitle: 'Мандаты в парламенте из 101 депутата; для большинства нужно 51',
		alt: 'Диаграмма парламента из 101 мандата. У крупнейшей партии 27 мандатов, ни у одной нет 51, нужного для большинства.',
		majority: '51 для большинства',
		seats: 'мандатов',
		parties: { left: 'Левые', centreLeft: 'Левоцентристы', centre: 'Центр', liberal: 'Либералы', right: 'Правые' }
	}
};
