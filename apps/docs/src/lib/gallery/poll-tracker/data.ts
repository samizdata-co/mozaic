import { kernelSmooth } from 'mozaic/transforms';
import { seeded } from '../../random';
import type { Messages } from '../types';

export type PartyId = 'a' | 'b' | 'c' | 'd';
export const partyIds: PartyId[] = ['a', 'b', 'c', 'd'];

export interface Poll {
	date: Date;
	/** Respondents, synthetic. */
	sample: number;
	/** Vote shares in %, synthetic. */
	values: Record<PartyId, number>;
}

const random = seeded(11);
const normal = () => Math.sqrt(-2 * Math.log(random() || 1e-9)) * Math.cos(2 * Math.PI * random());
const start = new Date(2025, 0, 10);
const end = new Date(2026, 5, 20);
const span = +end - +start;
/** Underlying support: A slides, B climbs, C holds, D sinks under the threshold. */
const truth = (f: number): Record<PartyId, number> => ({ a: 38 - 6 * f, b: 27 + 6 * f, c: 14, d: 6.5 - 2.5 * f });

export const polls: Poll[] = Array.from({ length: 30 }, (_, i) => {
	const date = new Date(+start + (span * (i + random() * 0.6)) / 30);
	const sample = 800 + Math.round(random() * 700);
	const mean = truth((+date - +start) / span);
	const values = Object.fromEntries(
		partyIds.map((id) => {
			const p = mean[id] / 100;
			return [id, Math.max(0.5, Math.round(1000 * (p + normal() * Math.sqrt((p * (1 - p)) / sample))) / 10)];
		})
	) as Record<PartyId, number>;
	return { date, sample, values };
});

const day = 864e5;
const first = +polls[0].date;
const days = Array.from(
	{ length: Math.floor((+polls[polls.length - 1].date - first) / day) + 1 },
	(_, i) => new Date(first + i * day)
);
const bandwidth = 30 * day;

/** Kernel-weighted average per party, weighted by √sample, with a 95% band from sampling error. */
export const series = partyIds.map((id) => ({
	id,
	values: kernelSmooth(polls, {
		x: (d) => d.date,
		y: (d) => d.values[id],
		at: days,
		bandwidth,
		weight: (d) => Math.sqrt(d.sample),
		variance: (d) => (d.values[id] * (100 - d.values[id])) / d.sample
	}).map((s) => ({ date: s.x, value: s.y, lo: s.y - 1.96 * s.se!, hi: s.y + 1.96 * s.se! }))
}));

export const messages: Messages<{
	title: string;
	subtitle: string;
	alt: string;
	threshold: string;
	parties: Record<PartyId, string>;
}> = {
	en: {
		title: 'The two largest parties are now level',
		subtitle: 'Voting intention, %. Lines are a weighted average of polls (dots), with 95% bands',
		alt: 'Poll tracker for four parties, January 2025 to June 2026. Party A falls from about 38% to 32% while Party B rises from 27% to 33%; Party D slips below the 5% threshold.',
		threshold: 'Threshold 5%',
		parties: { a: 'Party A', b: 'Party B', c: 'Party C', d: 'Party D' }
	},
	ro: {
		title: 'Cele mai mari două partide sunt acum la egalitate',
		subtitle: 'Intenția de vot, %. Liniile sunt media ponderată a sondajelor (puncte), cu benzi de 95%',
		alt: 'Evoluția sondajelor pentru patru partide, ianuarie 2025 – iunie 2026. Partidul A scade de la circa 38% la 32%, iar Partidul B crește de la 27% la 33%; Partidul D coboară sub pragul de 5%.',
		threshold: 'Pragul de 5%',
		parties: { a: 'Partidul A', b: 'Partidul B', c: 'Partidul C', d: 'Partidul D' }
	},
	ru: {
		title: 'Две крупнейшие партии теперь идут вровень',
		subtitle: 'Электоральные предпочтения, %. Линии — взвешенное среднее опросов (точки), с полосами 95%',
		alt: 'Динамика опросов для четырёх партий, январь 2025 – июнь 2026. Партия А снижается примерно с 38% до 32%, партия Б растёт с 27% до 33%; партия Г опускается ниже порога 5%.',
		threshold: 'Порог 5%',
		parties: { a: 'Партия А', b: 'Партия Б', c: 'Партия В', d: 'Партия Г' }
	}
};
