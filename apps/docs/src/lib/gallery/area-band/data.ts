import { seeded } from '../../random';
import type { Messages } from '../types';

export interface Point {
	date: Date;
	/** Unemployment rate, synthetic. */
	rate: number;
}

const random = seeded(3);
let rate = 0.052;
export const points: Point[] = Array.from({ length: 96 }, (_, m) => {
	const date = new Date(2018, m, 1);
	if (m > 0) rate += (random() - 0.5) * 0.002 + (m >= 26 && m < 31 ? 0.006 : 0) - (m >= 31 && m < 62 ? 0.0016 : 0);
	return { date, rate: Math.max(0.02, rate) };
});

export const messages: Messages<{ title: string; subtitle: string; alt: string; band: string; target: string }> = {
	en: {
		title: 'Unemployment jumped in 2020, then fell below its old level',
		subtitle: 'Unemployment rate, monthly',
		alt: 'Area chart of the monthly unemployment rate from 2018 to 2025. It jumps in spring 2020 and falls below its earlier level by 2022.',
		band: 'Pandemic',
		target: 'Target 4%'
	},
	ro: {
		title: 'Șomajul a crescut brusc în 2020, apoi a scăzut sub nivelul anterior',
		subtitle: 'Rata șomajului, lunar',
		alt: 'Grafic cu arie al ratei lunare a șomajului, 2018–2025. Crește brusc în primăvara lui 2020 și scade sub nivelul anterior până în 2022.',
		band: 'Pandemia',
		target: 'Ținta 4%'
	},
	ru: {
		title: 'Безработица подскочила в 2020 году, затем упала ниже прежнего уровня',
		subtitle: 'Уровень безработицы, по месяцам',
		alt: 'Диаграмма с областями месячного уровня безработицы, 2018–2025. Резкий рост весной 2020 года и падение ниже прежнего уровня к 2022 году.',
		band: 'Пандемия',
		target: 'Цель 4%'
	}
};
