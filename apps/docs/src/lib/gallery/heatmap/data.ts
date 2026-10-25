import { seeded } from '../../random';
import type { Messages } from '../types';

export interface Cell {
	year: string;
	month: number;
	/** Temperature anomaly, °C, synthetic. */
	anomaly: number;
}

const random = seeded(41);
export const years = Array.from({ length: 12 }, (_, i) => String(2014 + i));
export const cells: Cell[] = years.flatMap((year, yi) =>
	Array.from({ length: 12 }, (_, month) => ({
		year,
		month,
		anomaly: Math.round(((yi - 4) * 0.18 + (random() - 0.5) * 2.2) * 10) / 10
	}))
);

export const messages: Messages<{ title: string; subtitle: string; alt: string; legend: string }> = {
	en: {
		title: 'Warm months have become the norm',
		subtitle: 'Monthly temperature compared with the 1991–2020 average, °C',
		alt: 'Heatmap of monthly temperature anomalies from 2014 to 2025. Later years are mostly warmer than average.',
		legend: 'Difference from average, °C'
	},
	ro: {
		title: 'Lunile calde au devenit regula',
		subtitle: 'Temperatura lunară față de media anilor 1991–2020, °C',
		alt: 'Hartă termică a abaterilor lunare de temperatură, 2014–2025. Anii recenți sunt mai calzi decât media.',
		legend: 'Abaterea de la medie, °C'
	},
	ru: {
		title: 'Тёплые месяцы стали нормой',
		subtitle: 'Месячная температура относительно средней за 1991–2020 годы, °C',
		alt: 'Тепловая карта месячных температурных аномалий, 2014–2025. Последние годы в основном теплее среднего.',
		legend: 'Отклонение от средней, °C'
	}
};
