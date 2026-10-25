import type { Messages } from '../types';

export interface Step {
	/** Which region to highlight, or null for all. */
	focus: string | null;
	/** Show values up to this year. */
	until: number;
}

export const steps: Step[] = [
	{ focus: null, until: 2017 },
	{ focus: null, until: 2020 },
	{ focus: 'capital', until: 2025 },
	{ focus: 'south', until: 2025 }
];

export const messages: Messages<{ title: string; steps: string[]; names: Record<string, string> }> = {
	en: {
		title: 'How the regions drifted apart',
		names: { capital: 'Capital', north: 'North', south: 'South' },
		steps: [
			'Until 2017 the three regions moved almost in step.',
			'The 2020 shock hit all of them at once.',
			'Afterwards the capital recovered fastest and kept growing.',
			'The south barely returned to where it started.'
		]
	},
	ro: {
		title: 'Cum s-au îndepărtat regiunile',
		names: { capital: 'Capitala', north: 'Nord', south: 'Sud' },
		steps: [
			'Până în 2017, cele trei regiuni au evoluat aproape la fel.',
			'Șocul din 2020 le-a lovit pe toate deodată.',
			'Apoi capitala și-a revenit cel mai repede și a continuat să crească.',
			'Sudul abia a revenit la nivelul de pornire.'
		]
	},
	ru: {
		title: 'Как регионы разошлись',
		names: { capital: 'Столица', north: 'Север', south: 'Юг' },
		steps: [
			'До 2017 года три региона двигались почти синхронно.',
			'Шок 2020 года ударил по всем сразу.',
			'Затем столица восстановилась быстрее всех и продолжила расти.',
			'Юг едва вернулся к исходному уровню.'
		]
	}
};
