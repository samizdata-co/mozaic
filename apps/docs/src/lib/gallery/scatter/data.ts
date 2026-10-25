import { seeded } from '../../random';
import type { Messages } from '../types';

export interface District {
	name: string;
	/** Distance to the capital, km. */
	distance: number;
	/** Average monthly income, lei. */
	income: number;
	population: number;
	region: 'north' | 'centre' | 'south';
}

const random = seeded(5);
const names: [string, District['region'], number][] = [
	['Bălți', 'north', 130],
	['Briceni', 'north', 250],
	['Edineț', 'north', 220],
	['Soroca', 'north', 160],
	['Florești', 'north', 140],
	['Drochia', 'north', 170],
	['Ocnița', 'north', 240],
	['Rîșcani', 'north', 170],
	['Orhei', 'centre', 45],
	['Ialoveni', 'centre', 15],
	['Strășeni', 'centre', 25],
	['Hîncești', 'centre', 35],
	['Ungheni', 'centre', 105],
	['Criuleni', 'centre', 40],
	['Nisporeni', 'centre', 70],
	['Cahul', 'south', 175],
	['Comrat', 'south', 95],
	['Cimișlia', 'south', 70],
	['Leova', 'south', 100],
	['Taraclia', 'south', 165],
	['Căușeni', 'south', 85]
];
export const districts: District[] = names.map(([name, region, distance]) => ({
	name,
	region,
	distance,
	income: Math.round(9800 - distance * 14 + (random() - 0.5) * 1800 + (name === 'Bălți' ? 1800 : 0)),
	population: Math.round(20000 + random() * 100000 + (name === 'Bălți' ? 60000 : 0))
}));

export const messages: Messages<{
	title: string;
	subtitle: string;
	alt: string;
	x: string;
	y: string;
	regions: Record<District['region'], string>;
}> = {
	en: {
		title: 'Incomes fall with distance from the capital',
		subtitle: 'Average monthly income and distance to Chișinău, by district; circle size shows population',
		alt: 'Scatter plot of district income against distance to the capital. Incomes fall as distance grows; Bălți is an exception.',
		x: 'Distance, km',
		y: 'Income, lei',
		regions: { north: 'North', centre: 'Centre', south: 'South' }
	},
	ro: {
		title: 'Veniturile scad odată cu distanța de capitală',
		subtitle: 'Venitul mediu lunar și distanța până la Chișinău, pe raioane; mărimea cercului arată populația',
		alt: 'Grafic de dispersie al venitului raioanelor față de distanța până la capitală. Veniturile scad cu distanța; Bălțiul e o excepție.',
		x: 'Distanța, km',
		y: 'Venitul, lei',
		regions: { north: 'Nord', centre: 'Centru', south: 'Sud' }
	},
	ru: {
		title: 'Доходы падают с удалением от столицы',
		subtitle: 'Средний месячный доход и расстояние до Кишинёва по районам; размер круга — население',
		alt: 'Точечная диаграмма дохода районов в зависимости от расстояния до столицы. Доходы падают с расстоянием; исключение — Бельцы.',
		x: 'Расстояние, км',
		y: 'Доход, лей',
		regions: { north: 'Север', centre: 'Центр', south: 'Юг' }
	}
};
