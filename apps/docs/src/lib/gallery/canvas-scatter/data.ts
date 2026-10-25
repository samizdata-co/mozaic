import { seeded } from '../../random';
import type { Messages } from '../types';

const random = seeded(99);
const gauss = () => Math.sqrt(-2 * Math.log(random() || 1e-9)) * Math.cos(2 * Math.PI * random());

/** 5,000 synthetic points: two correlated clusters. */
export const points = Array.from({ length: 5000 }, (_, i) => {
	const cluster = i % 3 === 0 ? 1 : 0;
	const x = (cluster ? 6 : 3) + gauss() * 1.1;
	return { x, y: x * (cluster ? 0.6 : 1.1) + gauss() * 0.9, cluster };
});

export const messages: Messages<{ title: string; subtitle: string; alt: string; groups: [string, string] }> = {
	en: {
		title: 'Two groups, two different slopes',
		subtitle: '5,000 points drawn on a canvas layer, with SVG axes',
		alt: 'Scatter plot of 5,000 points in two overlapping clusters with different slopes.',
		groups: ['Group A', 'Group B']
	},
	ro: {
		title: 'Două grupuri, două pante diferite',
		subtitle: '5.000 de puncte desenate pe un strat canvas, cu axe SVG',
		alt: 'Grafic de dispersie cu 5.000 de puncte în două grupuri suprapuse, cu pante diferite.',
		groups: ['Grupul A', 'Grupul B']
	},
	ru: {
		title: 'Две группы, два разных наклона',
		subtitle: '5 000 точек на слое canvas с осями SVG',
		alt: 'Точечная диаграмма из 5 000 точек в двух пересекающихся группах с разными наклонами.',
		groups: ['Группа A', 'Группа B']
	}
};
